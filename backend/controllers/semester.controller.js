import { Semester, AcademicYear } from "../models/index.js";
import { buildActiveSemesterWhere } from "../utils/semesterStatus.js";

export async function create(req, res) {
  res.json(await Semester.create(req.body));
}

export async function getByYear(req, res) {
  res.json(await Semester.findAll({
    where: { AcademicYearId: req.params.yearId }
  }));
}

export async function getCurrent(req, res) {
  try {
    const { yearId } = req.query;
    const extra = yearId ? { AcademicYearId: Number(yearId) } : {};

    const semesters = await Semester.findAll({
      where: buildActiveSemesterWhere(extra),
      include: [{ model: AcademicYear }],
      order: [["name", "ASC"]]
    });
    res.json(semesters);
  } catch (err) {
    console.error("Error fetching current semesters:", err);
    res.status(500).json({ message: "Failed to fetch current semesters", error: err.message });
  }
}
