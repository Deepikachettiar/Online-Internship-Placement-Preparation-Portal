const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-secret-notifs";

const Notification = require("../models/Notification");
const notificationRoutes = require("../routes/notifications");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/notifications", notificationRoutes);

const userId = "64b7f0c2a1b2c3d4e5f60760";
const notifId = "64b7f0c2a1b2c3d4e5f60770";

const userToken = jwt.sign(
  { _id: userId, id: userId, role: "student" },
  process.env.JWT_SECRET
);

const sampleNotif = {
  _id: notifId,
  recipient: userId,
  title: "Application Shortlisted",
  message: "Your application for Frontend Developer has been shortlisted.",
  type: "status_change",
  isRead: false,
  createdAt: new Date(),
};

test("GET /api/notifications rejects unauthenticated user with 401", async () => {
  const res = await request(app).get("/api/notifications");
  assert.equal(res.status, 401);
});

test("GET /api/notifications returns user's notifications and unread count (OIP-F-018)", async () => {
  Notification.find = () => ({
    sort: () => ({
      limit: () => ({
        lean: async () => [sampleNotif],
      }),
    }),
  });
  Notification.countDocuments = async () => 1;

  const res = await request(app)
    .get("/api/notifications")
    .set("Authorization", `Bearer ${userToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.notifications.length, 1);
  assert.equal(res.body.unreadCount, 1);
  assert.equal(res.body.notifications[0].title, "Application Shortlisted");
});

test("PATCH /api/notifications/:id/read marks notification as read (OIP-F-018)", async () => {
  Notification.findOneAndUpdate = async () => ({
    ...sampleNotif,
    isRead: true,
    readAt: new Date(),
  });

  const res = await request(app)
    .patch(`/api/notifications/${notifId}/read`)
    .set("Authorization", `Bearer ${userToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.notification.isRead, true);
});

test("PATCH /api/notifications/:id/read returns 404 when notification does not exist", async () => {
  Notification.findOneAndUpdate = async () => null;

  const res = await request(app)
    .patch(`/api/notifications/unknown_id/read`)
    .set("Authorization", `Bearer ${userToken}`);

  assert.equal(res.status, 404);
});
