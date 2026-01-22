import { SemesterEvent } from "../models/index.js";

export async function create(req, res) {
  res.json(await SemesterEvent.create(req.body));
}

export async function getPlan(req, res) {
  res.json(await SemesterEvent.findAll({
    where: { SemesterId: req.params.semesterId }
  }));
}
