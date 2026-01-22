import { Router } from "express";
import { create, getBySemester, update, remove } from "../controllers/timetable.controller.js";

const router = Router();

router.post("/", create);
router.get("/semester/:semesterId", getBySemester);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
