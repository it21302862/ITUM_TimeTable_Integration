import { Semester } from "../models/index.js";

export async function create(req, res) {
  res.json(await Semester.create(req.body));
}

export async function getByYear(req, res) {
  res.json(await Semester.findAll({
    where: { AcademicYearId: req.params.yearId }
  }));
}
