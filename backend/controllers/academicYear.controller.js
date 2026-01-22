import { AcademicYear } from "../models/index.js";

export async function create(req, res) {
  try {
    const year = await AcademicYear.create(req.body);
    res.json(year);
  } catch (error) {
    console.error("Error creating academic year:", error);
    res.status(400).json({ error: error.message });
  }
}

export async function getAll(req, res) {
  try {
    const years = await AcademicYear.findAll();
    res.json(years);
  } catch (error) {
    console.error("Error fetching academic years:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const year = await AcademicYear.findByPk(req.params.id);
    if (!year) {
      return res.status(404).json({ error: "Academic year not found" });
    }
    res.json(year);
  } catch (error) {
    console.error("Error fetching academic year:", error);
    res.status(500).json({ error: error.message });
  }
}
