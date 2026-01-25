import { TimetableSlot, Course, Instructor, LectureHall, Semester } from "../models/index.js";

export async function create(req, res) {
  try {
    const slot = await TimetableSlot.create(req.body);
    // Return the created slot with associations
    const createdSlot = await TimetableSlot.findByPk(slot.id, {
      include: [
        { model: Course },
        { model: Instructor },
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
    const [updated] = await TimetableSlot.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: "Timetable slot not found" });
    }
    // Return the updated slot with associations
    const updatedSlot = await TimetableSlot.findByPk(req.params.id, {
      include: [
        { model: Course },
        { model: Instructor },
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

// Get timetable slots by instructor (optionally filtered by semester)
export async function getByInstructor(req, res) {
  try {
    const { instructorId } = req.params;
    const { semesterId } = req.query;

    const whereClause = { InstructorId: Number(instructorId) };
    
    // If semesterId is provided, filter by it
    if (semesterId) {
      whereClause.SemesterId = Number(semesterId);
    }

    const slots = await TimetableSlot.findAll({
      where: whereClause,
      include: [
        { model: Course },
        { model: Instructor },
        { model: LectureHall },
        { model: Semester }
      ],
      order: [["dayOfWeek", "ASC"], ["startTime", "ASC"]]
    });

    // Calculate weekly workload (sum of hours)
    let totalMinutes = 0;
    slots.forEach(slot => {
      if (slot.startTime && slot.endTime) {
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const startMins = startH * 60 + startM;
        const endMins = endH * 60 + endM;
        totalMinutes += (endMins - startMins);
      }
    });

    res.json({
      slots,
      weeklyWorkloadHours: Math.round(totalMinutes / 60)
    });
  } catch (err) {
    console.error("Error fetching timetable slots by instructor:", err);
    res.status(500).json({ message: "Failed to fetch timetable slots", error: err.message });
  }
}
