import { Router } from "express";
import { create, getByYear } from "../controllers/semester.controller.js";

const router = Router();

router.post("/", create);
router.get("/year/:yearId", getByYear);

export default router;
