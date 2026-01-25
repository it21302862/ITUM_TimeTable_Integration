import { Course, Instructor } from "../models/index.js";

export async function create(req, res) {
  const course = await Course.create(req.body);
  res.status(201).json(course);
}

export async function getAll(req, res) {
  const courses = await Course.findAll({
    include: [
      { model: Instructor, as: "assignedInstructor" },
      { model: Instructor, as: "moduleLeader" },
      { model: Instructor, as: "moduleCoordinator" },
    ],
  });
  res.json(courses);
}

export async function getOne(req, res) {
  const course = await Course.findByPk(req.params.id, {
    include: [
      { model: Instructor, as: "assignedInstructor" },
      { model: Instructor, as: "moduleLeader" },
      { model: Instructor, as: "moduleCoordinator" },
    ],
  });
  res.json(course);
}

export async function update(req, res) {
  await Course.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Course updated" });
}

export async function remove(req, res) {
  await Course.destroy({ where: { id: req.params.id } });
  res.json({ message: "Course deleted" });
}
