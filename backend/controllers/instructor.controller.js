import { Instructor } from "../models/index.js";

export async function create(req, res) {
  const instructor = await Instructor.create(req.body);
  res.status(201).json(instructor);
}

export async function getAll(req, res) {
  res.json(await Instructor.findAll());
}

export async function getOne(req, res) {
  res.json(await Instructor.findByPk(req.params.id));
}

export async function update(req, res) {
  await Instructor.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Instructor updated" });
}

export async function remove(req, res) {
  await Instructor.destroy({ where: { id: req.params.id } });
  res.json({ message: "Instructor deleted" });
}
