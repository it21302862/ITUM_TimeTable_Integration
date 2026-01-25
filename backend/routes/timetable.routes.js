import { Router } from "express";
import { create, getBySemester, getByInstructor, getOne, update, remove } from "../controllers/timetable.controller.js";

const router = Router();

router.post("/", create);
router.get("/semester/:semesterId", getBySemester);
router.get("/instructor/:instructorId", getByInstructor);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
