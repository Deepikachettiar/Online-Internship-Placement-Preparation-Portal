// Integration starter: merge into a notifications router and mount at /api/notifications.
// Add the existing authentication middleware before these handlers.
// Adapt req.user ID extraction to the project's auth implementation.
const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

function currentUserId(req) {
  return req.user?._id || req.user?.id || req.user?.userId;
}

router.get("/", /* requireAuth, */ async (req, res) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Failed to list notifications:", error);
    return res.status(500).json({ message: "Failed to load notifications." });
  }
});

router.patch("/:id/read", /* requireAuth, */ async (req, res) => {
  try {
    const userId = currentUserId(req);
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    return res.json({ notification });
  } catch (error) {
    console.error("Failed to mark notification read:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
});

module.exports = router;
