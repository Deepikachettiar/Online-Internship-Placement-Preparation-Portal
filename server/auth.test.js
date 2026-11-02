
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");

const {
  authenticateToken,
  authorizeRoles,
} = require("./middleware/auth");

const app = express();

process.env.JWT_SECRET = "test-secret-for-auth-middleware";

app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.get(
  "/admin",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({ message: "Admin access granted." });
  }
);

const jwt = require("jsonwebtoken");

test("rejects requests without a token", async () => {
  const response = await request(app).get("/protected");

  assert.equal(response.status, 401);
});

test("rejects an invalid token", async () => {
  const response = await request(app)
    .get("/protected")
    .set("Authorization", "Bearer invalid-token");

  assert.equal(response.status, 401);
});

test("accepts a valid token and populates req.user", async () => {
  const token = jwt.sign(
    { id: "user123", role: "student" },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.user._id, "user123");
  assert.equal(response.body.user.role, "student");
});

test("rejects a student from an admin-only route", async () => {
  const token = jwt.sign(
    { id: "student123", role: "student" },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get("/admin")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 403);
});

test("allows an admin into an admin-only route", async () => {
  const token = jwt.sign(
    { id: "admin123", role: "admin" },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get("/admin")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 200);
});
