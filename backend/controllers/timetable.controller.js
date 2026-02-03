import { TimetableSlot, Course, Instructor, LectureHall, Semester } from "../models/index.js";
import { Op } from "sequelize";

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
