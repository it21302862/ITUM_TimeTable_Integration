import { Router } from "express";
import { create, getAll, getOne, update, remove, getModulesByInstructor  } from "../controllers/course.controller.js";

const router = Router();

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);
router.get("/by-instructor/:id", getModulesByInstructor);

export default router;
