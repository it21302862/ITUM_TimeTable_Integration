import {
  Notification,
  Instructor,
  TimetableSlot,
  Course,
  LectureHall,
} from "../models/index.js";
import { Op } from "sequelize";

const DAY_MAP = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
};

function mapDayToEnum(day) {
  if (!day) return null;
  return DAY_MAP[day] || DAY_MAP[day.toUpperCase()] || null;
}

async function resolveCourse(moduleName, semesterId, yearId) {
  if (!moduleName) return null;

  let course = await Course.findOne({
    where: {
      SemesterId: semesterId,
      [Op.or]: [
        { name: { [Op.like]: `%${moduleName}%` } },
        { code: { [Op.like]: `%${moduleName}%` } },
      ],
    },
  });

  if (!course) {
    const code = moduleName.replace(/\s+/g, "").slice(0, 20).toUpperCase() || "MOD";
    course = await Course.create({
      code: `${code}-${semesterId}`,
      name: moduleName,
      credit: 3,
      SemesterId: semesterId,
      AcademicYearId: yearId || null,
    });
  }

  return course;
}

async function resolveLectureHall(hallName) {
  if (!hallName) {
    const first = await LectureHall.findOne();
    return first;
  }

  let hall = await LectureHall.findOne({
    where: { name: { [Op.like]: `%${hallName}%` } },
  });

  if (!hall) {
    hall = await LectureHall.create({
      name: hallName,
      building: "General",
      capacity: 30,
    });
  }

  return hall;
}

export async function sendAssignmentNote(req, res) {
  try {
    const { recipientId, message, sessionDetails } = req.body;
    const senderId = req.user.id;
    const senderName = req.user.name;

    if (!recipientId || !message?.trim()) {
      return res.status(400).json({ message: "Recipient and message are required" });
    }

    const recipient = await Instructor.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const notification = await Notification.create({
      recipientId: Number(recipientId),
      senderId,
      senderName,
      message: message.trim(),
      type: "ASSIGNMENT_NOTE",
      status: "PENDING",
      sessionDetails: sessionDetails || null,
    });

    const fullNotification = await Notification.findByPk(notification.id, {
      include: [
        { model: Instructor, as: "sender", attributes: ["id", "name", "email"] },
        { model: Instructor, as: "recipient", attributes: ["id", "name", "email"] },
      ],
    });

    res.status(201).json(fullNotification);
  } catch (err) {
    console.error("Error sending assignment note:", err);
    res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
}

export async function getMyNotifications(req, res) {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.user.id },
      include: [
        { model: Instructor, as: "sender", attributes: ["id", "name", "email", "department"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications", error: err.message });
  }
}

export async function getSentNotifications(req, res) {
  try {
    const notifications = await Notification.findAll({
      where: {
        senderId: req.user.id,
        type: "ASSIGNMENT_NOTE",
      },
      include: [
        { model: Instructor, as: "recipient", attributes: ["id", "name", "email", "department"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching sent notifications:", err);
    res.status(500).json({ message: "Failed to fetch sent notifications", error: err.message });
  }
}

export async function acceptAssignment(req, res) {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        recipientId: req.user.id,
        type: "ASSIGNMENT_NOTE",
        status: "PENDING",
      },
      include: [
        { model: Instructor, as: "sender", attributes: ["id", "name", "email"] },
      ],
    });

    if (!notification) {
      return res.status(404).json({ message: "Pending assignment request not found" });
    }

    const details = notification.sessionDetails || {};
    const semesterId = details.semesterId;
    const dayOfWeek = mapDayToEnum(details.day);
    const startTime = details.startTime;
    const endTime = details.endTime;
    const sessionType = details.sessionType;

    if (!semesterId || !dayOfWeek || !startTime || !endTime || !sessionType) {
      return res.status(400).json({
        message: "Assignment is missing required session details (semester, day, times, type)",
      });
    }

    const course = await resolveCourse(details.module, Number(semesterId), details.yearId);
    const lectureHall = await resolveLectureHall(details.lectureHall);

    if (!course || !lectureHall) {
      return res.status(400).json({ message: "Could not resolve course or lecture hall for this assignment" });
    }

    const slot = await TimetableSlot.create({
      dayOfWeek,
      startTime,
      endTime,
      sessionType: sessionType.toUpperCase(),
      SemesterId: Number(semesterId),
      CourseId: course.id,
      InstructorId: notification.senderId,
      LectureHallId: lectureHall.id,
    });

    await slot.addSupportiveInstructors([req.user.id]);

    notification.status = "ACCEPTED";
    notification.isRead = true;
    notification.timetableSlotId = slot.id;
    await notification.save();

    const accepter = await Instructor.findByPk(req.user.id);

    await Notification.create({
      recipientId: notification.senderId,
      senderId: req.user.id,
      senderName: accepter?.name || req.user.name,
      message: `${accepter?.name || "Instructor"} accepted your assignment request for ${details.module || "the session"}.`,
      type: "ASSIGNMENT_ACCEPTED",
      status: "ACCEPTED",
      sessionDetails: details,
      relatedNotificationId: notification.id,
      timetableSlotId: slot.id,
    });

    const updatedSlot = await TimetableSlot.findByPk(slot.id, {
      include: [
        { model: Course },
        { model: Instructor },
        { model: Instructor, as: "SupportiveInstructors", through: { attributes: [] } },
        { model: LectureHall },
      ],
    });

    res.json({
      notification,
      slot: updatedSlot,
      message: "Assignment accepted and timetable slot created",
    });
  } catch (err) {
    console.error("Error accepting assignment:", err);
    res.status(500).json({ message: "Failed to accept assignment", error: err.message });
  }
}

export async function rejectAssignment(req, res) {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        recipientId: req.user.id,
        type: "ASSIGNMENT_NOTE",
        status: "PENDING",
      },
    });

    if (!notification) {
      return res.status(404).json({ message: "Pending assignment request not found" });
    }

    notification.status = "REJECTED";
    notification.isRead = true;
    await notification.save();

    const rejecter = await Instructor.findByPk(req.user.id);
    const details = notification.sessionDetails || {};

    await Notification.create({
      recipientId: notification.senderId,
      senderId: req.user.id,
      senderName: rejecter?.name || req.user.name,
      message: `${rejecter?.name || "Instructor"} declined your assignment request for ${details.module || "the session"}.`,
      type: "ASSIGNMENT_REJECTED",
      status: "REJECTED",
      sessionDetails: details,
      relatedNotificationId: notification.id,
    });

    res.json({ notification, message: "Assignment declined" });
  } catch (err) {
    console.error("Error rejecting assignment:", err);
    res.status(500).json({ message: "Failed to reject assignment", error: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, recipientId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error("Error marking notification as read:", err);
    res.status(500).json({ message: "Failed to update notification", error: err.message });
  }
}

export async function markAllAsRead(req, res) {
  try {
    await Notification.update(
      { isRead: true },
      { where: { recipientId: req.user.id, isRead: false } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
    res.status(500).json({ message: "Failed to update notifications", error: err.message });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const count = await Notification.count({
      where: { recipientId: req.user.id, isRead: false },
    });

    res.json({ count });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Failed to fetch unread count", error: err.message });
  }
}
