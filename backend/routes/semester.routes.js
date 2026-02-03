import { Router } from "express";
import { create, getByYear, getCurrent } from "../controllers/semester.controller.js";

const router = Router();

router.post("/", create);
router.get("/year/:yearId", getByYear);
router.get("/current", getCurrent);

export default router;
