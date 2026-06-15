import { Router } from "express";
import {
  sendAssignmentNote,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { verifyToken } from "../controllers/auth.controller.js";

const router = Router();

router.use(verifyToken);

router.post("/assignment-note", sendAssignmentNote);
router.get("/", getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
