import { Router } from "express";
import { create, getAll, getOne, getAvailableInstructors, update, remove } from "../controllers/instructor.controller.js";
import multer from "multer";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists (same as auth routes)
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname);
	},
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/", upload.single("image"), create);
router.get("/available", getAvailableInstructors);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;
