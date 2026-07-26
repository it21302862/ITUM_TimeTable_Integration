import { TimetableSlot, Course, Instructor, LectureHall, Semester } from "../models/index.js";
import { Op } from "sequelize";
import { buildActiveSemesterWhere } from "../utils/semesterStatus.js";

function timeToMinutes(timeInput) {
  if (!timeInput) return 0;
  let timeStr = timeInput;
  if (timeInput instanceof Date) {
    timeStr = timeInput.toTimeString().slice(0, 5);
  } else if (typeof timeInput !== "string") {
    timeStr = String(timeInput);
  }
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  return 0;
}

function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

const slotIncludes = [
  { model: Course },
  { model: Instructor },
  { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
  { model: LectureHall },
  { model: Semester },
];

export async function create(req, res) {
  try {
    const { SupportiveInstructorIds, ...slotData } = req.body;
    const slot = await TimetableSlot.create(slotData);
    
    // Add supportive instructors if provided
    if (SupportiveInstructorIds && SupportiveInstructorIds.length > 0) {
      await slot.addSupportiveInstructors(SupportiveInstructorIds);
    }
    
    // Return the created slot with associations
    const createdSlot = await TimetableSlot.findByPk(slot.id, {
      include: [
        { model: Course },
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall }
      ]
    });
    res.status(201).json(createdSlot);
  } catch (err) {
    console.error("Error creating timetable slot:", err);
    res.status(500).json({ message: "Failed to create timetable slot", error: err.message });
  }
}

export async function getBySemester(req, res) {
  try {
    const slots = await TimetableSlot.findAll({
      where: { SemesterId: req.params.semesterId },
      include: [
        { model: Course, include: [
          { model: Instructor, as: "assignedInstructor" },
          { model: Instructor, as: "moduleLeader" },
        ]},
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall }
      ],
      order: [["dayOfWeek", "ASC"], ["startTime", "ASC"]]
    });
    res.json(slots);
  } catch (err) {
    console.error("Error fetching timetable slots:", err);
    res.status(500).json({ message: "Failed to fetch timetable slots", error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id, {
      include: [
        { model: Course },
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall },
        { model: Semester }
      ]
    });
    if (!slot) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }
    res.json(slot);
  } catch (err) {
    console.error("Error fetching timetable slot:", err);
    res.status(500).json({ message: "Failed to fetch timetable slot", error: err.message });
  }
}

export async function update(req, res) {
  try {
    const { SupportiveInstructorIds, ...slotData } = req.body;
    const [updated] = await TimetableSlot.update(slotData, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }
    
    // Update supportive instructors if provided
    const slot = await TimetableSlot.findByPk(req.params.id);
    if (SupportiveInstructorIds !== undefined) {
      await slot.setSupportiveInstructors(SupportiveInstructorIds || []);
    }
    
    // Return the updated slot with associations
    const updatedSlot = await TimetableSlot.findByPk(req.params.id, {
      include: [
        { model: Course },
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall }
      ]
    });
    res.json(updatedSlot);
  } catch (err) {
    console.error("Error updating timetable slot:", err);
    res.status(500).json({ message: "Failed to update timetable slot", error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await TimetableSlot.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Error deleting timetable slot:", err);
    res.status(500).json({ message: "Failed to delete timetable slot", error: err.message });
  }
}

export async function getAssignableSessions(req, res) {
  try {
    const instructorIdNum = req.query.instructorId
      ? Number(req.query.instructorId)
      : null;
    const yearIdNum = req.query.yearId ? Number(req.query.yearId) : null;

    const semesterWhere = buildActiveSemesterWhere(
      yearIdNum ? { AcademicYearId: yearIdNum } : {},
    );

    const currentSemesters = await Semester.findAll({
      where: semesterWhere,
      order: [["name", "ASC"]],
    });

    const semesterIds = currentSemesters.map((s) => s.id);

    if (semesterIds.length === 0) {
      return res.json({
        semesters: [],
        sessions: [],
        instructorSessions: [],
        semesterReview: [],
        totalSessions: 0,
        hiddenDueToConflict: 0,
      });
    }

    const allSlots = await TimetableSlot.findAll({
      where: { SemesterId: { [Op.in]: semesterIds } },
      include: slotIncludes,
      order: [
        ["SemesterId", "ASC"],
        ["dayOfWeek", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    let instructorSlots = [];
    if (instructorIdNum) {
      const mainSlots = await TimetableSlot.findAll({
        where: {
          SemesterId: { [Op.in]: semesterIds },
          InstructorId: instructorIdNum,
        },
        include: slotIncludes,
      });

      const supportiveSlots = await TimetableSlot.findAll({
        where: { SemesterId: { [Op.in]: semesterIds } },
        include: [
          { model: Course },
          { model: Instructor },
          { model: LectureHall },
          { model: Semester },
          {
            model: Instructor,
            as: "SupportiveInstructors",
            where: { id: instructorIdNum },
            through: { attributes: [] },
            required: true,
          },
        ],
      });

      const byId = new Map();
      for (const slot of [...mainSlots, ...supportiveSlots]) {
        byId.set(slot.id, slot);
      }
      instructorSlots = Array.from(byId.values());
    }

    const assignableSessions = allSlots.filter((slot) => {
      if (!instructorIdNum) return true;

      if (slot.InstructorId === instructorIdNum) return false;
      if (slot.SupportiveInstructors?.some((i) => i.id === instructorIdNum)) {
        return false;
      }

      for (const busy of instructorSlots) {
        if (
          slot.dayOfWeek === busy.dayOfWeek &&
          timesOverlap(
            slot.startTime,
            slot.endTime,
            busy.startTime,
            busy.endTime,
          )
        ) {
          return false;
        }
      }
      return true;
    });

    const semesterReview = currentSemesters.map((semester) => {
      const semInstructorSlots = instructorSlots.filter(
        (s) => s.SemesterId === semester.id,
      );
      const semAssignable = assignableSessions.filter(
        (s) => s.SemesterId === semester.id,
      );
      const semTotal = allSlots.filter((s) => s.SemesterId === semester.id);

      let status = "NO_CONFLICT";
      let label = "No Conflicts";

      if (semInstructorSlots.length > 0 && semAssignable.length === 0) {
        status = "BLOCKED";
        label = "Fully Booked";
      } else if (semInstructorSlots.length > 0) {
        status = "ADVISORY";
        label = `${semInstructorSlots.length} Existing Session${semInstructorSlots.length !== 1 ? "s" : ""}`;
      } else if (semTotal.length === 0) {
        status = "NO_SLOTS";
        label = "No Sessions Listed";
      }

      return {
        semesterId: semester.id,
        semesterName: semester.name,
        status,
        label,
        existingSessionCount: semInstructorSlots.length,
        assignableCount: semAssignable.length,
      };
    });

    res.json({
      semesters: currentSemesters,
      sessions: assignableSessions,
      instructorSessions: instructorSlots,
      semesterReview,
      totalSessions: allSlots.length,
      hiddenDueToConflict: allSlots.length - assignableSessions.length,
    });
  } catch (err) {
    console.error("Error fetching assignable sessions:", err);
    res.status(500).json({
      message: "Failed to fetch assignable sessions",
      error: err.message,
    });
  }
}

// Get timetable slots by instructor (optionally filtered by semester and year)
export async function getByInstructor(req, res) {
  try {
    const { instructorId } = req.params;
    const { semesterId, yearId } = req.query;

    const instructorIdNum = Number(instructorId);
    const semesterIdNum = semesterId ? Number(semesterId) : null;
    const yearIdNum = yearId ? Number(yearId) : null;

    const slotWhere = {};
    if (semesterIdNum) slotWhere.SemesterId = semesterIdNum;

    const courseInclude = {
      model: Course,
      where: yearIdNum ? { AcademicYearId: yearIdNum } : undefined,
      required: !!yearIdNum,
    };

    // 1) Slots where user is the MAIN instructor
    const mainSlots = await TimetableSlot.findAll({
      where: { ...slotWhere, InstructorId: instructorIdNum },
      include: [
        courseInclude,
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall },
        { model: Semester },
      ],
      order: [["dayOfWeek", "ASC"], ["startTime", "ASC"]],
    });

    // 2) Slots where user is a SUPPORTIVE instructor (many-to-many)
    const supportiveSlots = await TimetableSlot.findAll({
      where: slotWhere,
      include: [
        courseInclude,
        { model: Instructor },
        {
          model: Instructor,
          as: "SupportiveInstructors",
          where: { id: instructorIdNum },
          through: { attributes: [] },
          required: true,
        },
        { model: LectureHall },
        { model: Semester },
      ],
      order: [["dayOfWeek", "ASC"], ["startTime", "ASC"]],
    });

    // Merge & dedupe by slot id
    const byId = new Map();
    for (const s of [...mainSlots, ...supportiveSlots]) byId.set(s.id, s);
    const filteredSlots = Array.from(byId.values()).sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek.localeCompare(b.dayOfWeek);
      return String(a.startTime).localeCompare(String(b.startTime));
    });

    // Calculate weekly workload (sum of hours)
    let totalMinutes = 0;
    filteredSlots.forEach(slot => {
      if (slot.startTime && slot.endTime) {
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        totalMinutes += (endMins - startMins);
      }
    });

    res.json({
      slots: filteredSlots,
      weeklyWorkloadHours: Math.round(totalMinutes / 60)
    });
  } catch (err) {
    console.error("Error fetching timetable slots by instructor:", err);
    res.status(500).json({ message: "Failed to fetch timetable slots", error: err.message });
  }
}
