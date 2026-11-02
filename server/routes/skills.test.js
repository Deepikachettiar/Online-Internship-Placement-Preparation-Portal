const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-skills-api";

const User = require("../models/User");
const skillRoutes = require("./skills");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/students/me/skills", skillRoutes);

const studentId = "64b7f0c2a1b2c3d4e5f60755";
const studentToken = jwt.sign(
  { id: studentId, role: "student" },
  process.env.JWT_SECRET
);

test("GET /api/students/me/skills rejects unauthenticated user with 401", async () => {
  const res = await request(app).get("/api/students/me/skills");
  assert.equal(res.status, 401);
});

test("GET /api/students/me/skills returns student skills list (OIP-F-006)", async () => {
  User.findById = async () => ({
    _id: studentId,
    skills: ["javascript", "react"],
  });

  const res = await request(app)
    .get("/api/students/me/skills")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.skills, ["javascript", "react"]);
});

test("POST /api/students/me/skills adds a new skill (OIP-F-006)", async () => {
  const mockStudent = {
    _id: studentId,
    skills: ["javascript"],
    save: async function () { return this; },
  };

  User.findById = async () => mockStudent;

  const res = await request(app)
    .post("/api/students/me/skills")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ skill: "Docker" });

  assert.equal(res.status, 201);
  assert.ok(mockStudent.skills.includes("docker"));
});

test("POST /api/students/me/skills rejects duplicate skill with 400", async () => {
  User.findById = async () => ({
    _id: studentId,
    skills: ["javascript", "docker"],
    save: async function () { return this; },
  });

  const res = await request(app)
    .post("/api/students/me/skills")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ skill: "docker" });

  assert.equal(res.status, 400);
  assert.ok(res.body.message.includes("already added"));
});
