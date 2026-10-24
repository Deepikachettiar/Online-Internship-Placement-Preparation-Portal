
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-for-rbac-additional";

const { authenticateToken } = require("./middleware/auth");

const app = express();

app.get("/protected", authenticateToken, (req, res) => {
  res.status(200).json({ user: req.user });
});

test("rejects an expired JWT", async () => {
  const token = jwt.sign(
    { id: "user123", role: "student" },
    process.env.JWT_SECRET,
    { expiresIn: -1 }
  );

  const response = await request(app)
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Invalid or expired token.");
});

test("rejects a JWT without a user ID", async () => {
  const token = jwt.sign(
    { role: "student" },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get("/protected")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 401);
  assert.equal(response.body.message, "Invalid authentication token.");
});

test("rejects a token sent without the Bearer scheme", async () => {
  const token = jwt.sign(
    { id: "user123", role: "student" },
    process.env.JWT_SECRET
  );

  const response = await request(app)
    .get("/protected")
    .set("Authorization", token);

  assert.equal(response.status, 401);
});
