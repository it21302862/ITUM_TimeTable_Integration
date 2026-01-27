import { Router } from "express";
import { create, getAll, getOne, getAvailableInstructors, update, remove } from "../controllers/instructor.controller.js";

const router = Router();

router.post("/", create);
router.get("/available", getAvailableInstructors);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
