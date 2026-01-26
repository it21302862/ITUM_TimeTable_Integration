import { Router } from "express";
import { create, getAll, getOne, getByCourse, update, remove } from "../controllers/moduleOutline.controller.js";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/course/:courseId", getByCourse);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
