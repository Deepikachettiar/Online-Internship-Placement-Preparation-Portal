const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-applications";

const Application = require("../models/Application");
const Internship = require("../models/Internship");
const applicationRoutes = require("./applications");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/applications", applicationRoutes);

const studentId = "64b7f0c2a1b2c3d4e5f60790";
const companyId = "64b7f0c2a1b2c3d4e5f60780";
const internshipId = "64b7f0c2a1b2c3d4e5f60795";
const applicationId = "64b7f0c2a1b2c3d4e5f60799";

const studentToken = jwt.sign(
  { _id: studentId, id: studentId, role: "student" },
  process.env.JWT_SECRET
);

const companyToken = jwt.sign(
  { _id: companyId, id: companyId, role: "company", companyId: companyId },
  process.env.JWT_SECRET
);

test("POST /api/applications rejects unauthenticated user with 401", async () => {
  const res = await request(app).post("/api/applications").send({});
  assert.equal(res.status, 401);
});

test("POST /api/applications rejects missing resumeUrl with 400", async () => {
  const res = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ internshipId });

  assert.equal(res.status, 400);
});

test("POST /api/applications rejects inactive internship with 400", async () => {
  Internship.findById = async () => ({
    _id: internshipId,
    status: "Inactive",
  });

  const res = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      internshipId,
      resumeUrl: "/uploads/resumes/my-resume.pdf",
    });

  assert.equal(res.status, 400);
});

test("POST /api/applications creates application with status 'Applied' (OIP-F-014)", async () => {
  Internship.findById = async () => ({
    _id: internshipId,
    status: "Active",
  });

  Application.create = async (doc) => ({
    _id: applicationId,
    ...doc,
  });

  const res = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      internshipId,
      resumeUrl: "/uploads/resumes/my-resume.pdf",
      coverLetter: "Excited to apply!",
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.application.status, "Applied");
});

test("POST /api/applications detects and rejects duplicate application with 400", async () => {
  Internship.findById = async () => ({
    _id: internshipId,
    status: "Active",
  });

  Application.create = async () => {
    const err = new Error("E11000 duplicate key error");
    err.code = 11000;
    throw err;
  };

  const res = await request(app)
    .post("/api/applications")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      internshipId,
      resumeUrl: "/uploads/resumes/my-resume.pdf",
    });

  assert.equal(res.status, 400);
  assert.ok(res.body.message.includes("already applied"));
});

test("GET /api/applications/me returns student applications (OIP-F-015)", async () => {
  Application.find = () => ({
    populate: () => ({
      sort: async () => [
        {
          _id: applicationId,
          status: "Applied",
          internship: { title: "Frontend Intern" },
        },
      ],
    }),
  });

  const res = await request(app)
    .get("/api/applications/me")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.applications.length, 1);
  assert.equal(res.body.applications[0].status, "Applied");
});

test("PATCH /api/applications/:id/status rejects invalid transition status with 400", async () => {
  const res = await request(app)
    .patch(`/api/applications/${applicationId}/status`)
    .set("Authorization", `Bearer ${companyToken}`)
    .send({ status: "InvalidStatus" });

  assert.equal(res.status, 400);
});

test("PATCH /api/applications/:id/status updates status to Shortlisted (OIP-F-017)", async () => {
  const mockAppDoc = {
    _id: applicationId,
    status: "Applied",
    internship: {
      company: { _id: companyId },
    },
    schema: {
      path: () => true,
    },
    save: async function () { return this; },
  };

  Application.findById = () => ({
    populate: async () => mockAppDoc,
  });

  const res = await request(app)
    .patch(`/api/applications/${applicationId}/status`)
    .set("Authorization", `Bearer ${companyToken}`)
    .send({
      status: "Shortlisted",
      note: "Strong academic credentials and React skills.",
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.application.status, "Shortlisted");
});
