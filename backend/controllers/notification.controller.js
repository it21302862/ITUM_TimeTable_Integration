import { Notification, Instructor } from "../models/index.js";

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
