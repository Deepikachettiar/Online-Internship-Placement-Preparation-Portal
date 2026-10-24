const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-for-attach-user";

const { attachUser } = require("./middleware/auth");

const app = express();
app.use(attachUser);
app.get("/who", (req, res) => res.status(200).json({ user: req.user || null }));

test("sets req.user when a valid token is sent", async () => {
  const token = jwt.sign({ id: "abc123", role: "student" }, process.env.JWT_SECRET);
  const res = await request(app).get("/who").set("Authorization", `Bearer ${token}`);
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.user, { _id: "abc123", role: "student" });
});

test("continues without a user when there is no token", async () => {
  const res = await request(app).get("/who");
  assert.equal(res.status, 200);
  assert.equal(res.body.user, null);
});

test("continues without a user when the token is invalid", async () => {
  const res = await request(app).get("/who").set("Authorization", "Bearer not-a-real-token");
  assert.equal(res.status, 200);
  assert.equal(res.body.user, null);
});
