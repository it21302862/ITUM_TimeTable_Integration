import { Router } from "express";
import { create, getAll, getOne, update, remove, getModulesByInstructor, getBySemester, getByYearAndSemester } from "../controllers/course.controller.js";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/by-instructor/:id", getModulesByInstructor);
router.get("/by-semester/:semesterId", getBySemester);
router.get("/by-year-semester", getByYearAndSemester);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
