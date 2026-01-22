import { Course } from "../models/index.js";

export async function create(req, res) {
  const course = await Course.create(req.body);
  res.status(201).json(course);
}

export async function getAll(req, res) {
  res.json(await Course.findAll());
}

export async function getOne(req, res) {
  res.json(await Course.findByPk(req.params.id));
}

export async function update(req, res) {
  await Course.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Course updated" });
}

export async function remove(req, res) {
  await Course.destroy({ where: { id: req.params.id } });
  res.json({ message: "Course deleted" });
}
