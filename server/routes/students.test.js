const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-students-profile";

const User = require("../models/User");
const studentRoutes = require("./students");

const app = express();
app.use(express.json());
app.use("/api/students", studentRoutes);

const studentId = "64b7f0c2a1b2c3d4e5f60755";
const studentToken = jwt.sign(
  { id: studentId, role: "student" },
  process.env.JWT_SECRET
);

const sampleProfile = {
  _id: studentId,
  name: "Aarav Sharma",
  email: "aarav@example.com",
  department: "Computer Science",
  graduationYear: 2026,
  cgpa: 8.5,
  skills: ["javascript", "react"],
};

test("GET /api/students/me rejects unauthenticated request with 401", async () => {
  const res = await request(app).get("/api/students/me");
  assert.equal(res.status, 401);
});

test("GET /api/students/me returns student academic profile (OIP-F-005)", async () => {
  User.findById = () => ({
    select: async () => sampleProfile,
  });

  const res = await request(app)
    .get("/api/students/me")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.department, "Computer Science");
  assert.equal(res.body.profile.cgpa, 8.5);
});

test("PUT /api/students/me rejects invalid CGPA with 400", async () => {
  const res = await request(app)
    .put("/api/students/me")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      cgpa: 11.5, // CGPA > 10.0
    });

  assert.equal(res.status, 400);
});

test("PUT /api/students/me updates student profile successfully (OIP-F-005)", async () => {
  User.findByIdAndUpdate = () => ({
    select: async () => ({
      ...sampleProfile,
      department: "Information Science",
      cgpa: 9.0,
    }),
  });

  const res = await request(app)
    .put("/api/students/me")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      department: "Information Science",
      graduationYear: 2026,
      cgpa: 9.0,
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.department, "Information Science");
  assert.equal(res.body.profile.cgpa, 9.0);
});
