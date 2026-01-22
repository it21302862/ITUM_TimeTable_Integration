import { TimetableSlot, Course, Instructor, LectureHall } from "../models/index.js";

export async function create(req, res) {
  res.json(await TimetableSlot.create(req.body));
}

export async function getBySemester(req, res) {
  res.json(await TimetableSlot.findAll({
    where: { SemesterId: req.params.semesterId },
    include: [
      { model: Course },
      { model: Instructor },
      { model: LectureHall }
    ]
  }));
}

export async function update(req, res) {
  await TimetableSlot.update(req.body, {
    where: { id: req.params.id }
  });
  res.json({ message: "Updated" });
}

export async function remove(req, res) {
  await TimetableSlot.destroy({
    where: { id: req.params.id }
  });
  res.json({ message: "Deleted" });
}
