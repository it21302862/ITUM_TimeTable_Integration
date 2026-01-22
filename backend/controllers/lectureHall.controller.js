import { LectureHall } from "../models/index.js";

export async function create(req, res) {
  const hall = await LectureHall.create(req.body);
  res.status(201).json(hall);
}

export async function getAll(req, res) {
  res.json(await LectureHall.findAll());
}

export async function getOne(req, res) {
  res.json(await LectureHall.findByPk(req.params.id));
}

export async function update(req, res) {
  await LectureHall.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Lecture hall updated" });
}

export async function remove(req, res) {
  await LectureHall.destroy({ where: { id: req.params.id } });
  res.json({ message: "Lecture hall deleted" });
}
