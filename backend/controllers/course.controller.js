import {
  Course,
  Instructor,
  TimetableSlot,
  Semester,
} from "../models/index.js";
import { Op } from "sequelize";

export async function create(req, res) {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error("Error creating course:", err);
    res
      .status(500)
      .json({ message: "Failed to create course", error: err.message });
  }
}

export async function getAll(req, res) {
  try {
    const { semesterId, yearId } = req.query;

    if (semesterId) {
      const courses = await Course.findAll({
        where: { SemesterId: Number(semesterId) },
        include: [
          { model: Instructor, as: "assignedInstructor" },
          { model: Instructor, as: "moduleLeader" },
          { model: Instructor, as: "moduleCoordinator" },
        ],
      });
      return res.json(courses);
    }

    // If yearId is provided, filter courses by academic year
    if (yearId) {
      const courses = await Course.findAll({
        where: { AcademicYearId: Number(yearId) },
        include: [
          { model: Instructor, as: "assignedInstructor" },
          { model: Instructor, as: "moduleLeader" },
          { model: Instructor, as: "moduleCoordinator" },
        ],
      });
      return res.json(courses);
    }

    // Default: return all courses
    const courses = await Course.findAll({
      include: [
        { model: Instructor, as: "assignedInstructor" },
        { model: Instructor, as: "moduleLeader" },
        { model: Instructor, as: "moduleCoordinator" },
      ],
    });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: err.message });
  }
}

export async function getOne(req, res) {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: Instructor, as: "assignedInstructor" },
        { model: Instructor, as: "moduleLeader" },
        { model: Instructor, as: "moduleCoordinator" },
      ],
    });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch course", error: err.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await Course.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course updated" });
  } catch (err) {
    console.error("Error updating course:", err);
    res
      .status(500)
      .json({ message: "Failed to update course", error: err.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await Course.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error("Error deleting course:", err);
    res
      .status(500)
      .json({ message: "Failed to delete course", error: err.message });
  }
}

// Get courses by semester (courses that have timetable slots in the semester)
export async function getBySemester(req, res) {
  try {
    const { semesterId } = req.params;

    const courseIds = await TimetableSlot.findAll({
      where: { SemesterId: Number(semesterId) },
      attributes: ["CourseId"],
      group: ["CourseId"],
    });

    const uniqueCourseIds = [
      ...new Set(courseIds.map((slot) => slot.CourseId).filter(Boolean)),
    ];

    if (uniqueCourseIds.length === 0) {
      return res.json([]);
    }

    const courses = await Course.findAll({
      where: { id: { [Op.in]: uniqueCourseIds } },
      include: [
        { model: Instructor, as: "assignedInstructor" },
        { model: Instructor, as: "moduleLeader" },
        { model: Instructor, as: "moduleCoordinator" },
      ],
    });
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses by semester:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch courses", error: err.message });
  }
}

export async function getModulesByInstructor(req, res) {
  try {
    const instructorId = Number(req.params.id);
    const { semesterId, yearId } = req.query;

    if (!instructorId) {
      return res.status(400).json({ message: "Invalid instructor ID" });
    }

    // Get timetable slots for this instructor
    let timetableWhere = { InstructorId: instructorId };
    
    if (semesterId) {
      timetableWhere.SemesterId = Number(semesterId);
    } else if (yearId) {
      // If yearId is provided, get semesters for that year
      const semesters = await Semester.findAll({
        where: { AcademicYearId: Number(yearId) },
        attributes: ["id"],
      });
      const semesterIds = semesters.map((s) => s.id);
      if (semesterIds.length === 0) {
        return res.json([]);
      }
      timetableWhere.SemesterId = { [Op.in]: semesterIds };
    }

    // Get unique course IDs from timetable slots
    const slots = await TimetableSlot.findAll({
      where: timetableWhere,
      attributes: ["CourseId"],
      group: ["CourseId"],
    });

    const uniqueCourseIds = [
      ...new Set(slots.map((slot) => slot.CourseId).filter(Boolean)),
    ];

    if (uniqueCourseIds.length === 0) {
      return res.json([]);
    }

    const courses = await Course.findAll({
      where: { id: { [Op.in]: uniqueCourseIds } },
      attributes: ["id", "code", "name"],
    });

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching modules" });
  }
}

export async function getByYearAndSemester(req, res) {
  try {
    const { yearId, semesterId } = req.query;

    if (!yearId || !semesterId) {
      return res.status(400).json({
        message: "yearId and semesterId are required",
      });
    }

    const courses = await Course.findAll({
      where: {
        academicYearId: yearId,
        semesterId: semesterId,
      },
      attributes: ["id", "code", "name", "credit"],
    });

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
}
