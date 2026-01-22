import { Router } from "express";
import { create, getPlan } from "../controllers/semesterPlan.controller.js";

const router = Router();

router.post("/", create);
router.get("/semester/:semesterId", getPlan);

export default router;
