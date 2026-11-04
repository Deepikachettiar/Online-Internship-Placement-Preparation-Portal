const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-secret-internships";

const User = require("../models/User");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const internshipRoutes = require("./internships");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/internships", internshipRoutes);

const companyId = "64b7f0c2a1b2c3d4e5f60718";
const otherCompanyId = "64b7f0c2a1b2c3d4e5f60799";
const studentId = "64b7f0c2a1b2c3d4e5f60720";
const internshipId = "64b7f0c2a1b2c3d4e5f60730";

const approvedCompanyToken = jwt.sign(
  { _id: companyId, id: companyId, role: "company", companyApproved: true },
  process.env.JWT_SECRET
);

const unapprovedCompanyToken = jwt.sign(
  { _id: companyId, id: companyId, role: "company", companyApproved: false },
  process.env.JWT_SECRET
);

const otherCompanyToken = jwt.sign(
  { _id: otherCompanyId, id: otherCompanyId, role: "company", companyApproved: true },
  process.env.JWT_SECRET
);

const studentToken = jwt.sign(
  { _id: studentId, id: studentId, role: "student", cgpa: 8.5, skills: ["javascript", "react", "node.js"] },
  process.env.JWT_SECRET
);

const sampleInternship = {
  _id: internshipId,
  title: "Frontend Developer Intern",
  description: "Work on responsive React user interfaces.",
  company: companyId,
  location: "Bengaluru",
  workMode: "Hybrid",
  minCGPA: 7.0,
  requiredSkills: ["react", "javascript"],
  stipend: 25000,
  duration: "3 months",
  deadline: new Date(Date.now() + 86400000),
  status: "Active",
  isPublished: true,
};

test("GET /api/internships returns paginated active listings", async () => {
  // Mock User.find distinct
  User.find = () => ({
    distinct: async () => [companyId],
  });

  // Mock Internship.find and countDocuments
  Internship.find = () => ({
    populate: () => ({
      sort: () => ({
        skip: () => ({
          limit: async () => [sampleInternship],
        }),
      }),
    }),
  });
  Internship.countDocuments = async () => 1;

  const res = await request(app).get("/api/internships?page=1&limit=10");
  assert.equal(res.status, 200);
  assert.equal(res.body.internships.length, 1);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.page, 1);
  assert.equal(res.body.totalPages, 1);
});

test("GET /api/internships supports search and multi-filtering parameters", async () => {
  let capturedFilter = null;
  User.find = () => ({
    distinct: async () => [companyId],
  });

  Internship.find = (filter) => {
    capturedFilter = filter;
    return {
      populate: () => ({
        sort: () => ({
          skip: () => ({
            limit: async () => [sampleInternship],
          }),
        }),
      }),
    };
  };
  Internship.countDocuments = async () => 1;

  const res = await request(app).get(
    "/api/internships?search=React&skill=react&location=Bengaluru&workMode=Hybrid&minStipend=20000"
  );

  assert.equal(res.status, 200);
  assert.ok(capturedFilter);
  assert.equal(capturedFilter.workMode, "Hybrid");
  assert.deepEqual(capturedFilter.stipend, { $gte: 20000 });
});

test("GET /api/internships/:id returns single internship when found", async () => {
  Internship.findById = () => ({
    populate: async () => sampleInternship,
  });

  const res = await request(app).get(`/api/internships/${internshipId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.internship.title, "Frontend Developer Intern");
});

test("GET /api/internships/:id returns 404 when not found", async () => {
  Internship.findById = () => ({
    populate: async () => null,
  });

  const res = await request(app).get(`/api/internships/nonexistent_id`);
  assert.equal(res.status, 404);
});

test("POST /api/internships rejects unauthenticated requests with 401", async () => {
  const res = await request(app).post("/api/internships").send({ title: "New Role" });
  assert.equal(res.status, 401);
});

test("POST /api/internships rejects student role with 403", async () => {
  User.findById = async () => ({ _id: studentId, role: "student" });

  const res = await request(app)
    .post("/api/internships")
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ title: "New Role" });
  assert.equal(res.status, 403);
});

test("POST /api/internships rejects unapproved company with 403", async () => {
  User.findById = async () => ({ _id: companyId, role: "company", companyApproved: false });

  const res = await request(app)
    .post("/api/internships")
    .set("Authorization", `Bearer ${unapprovedCompanyToken}`)
    .send({
      title: "Backend Intern",
      description: "Build APIs in Node.js",
      location: "Bengaluru",
      workMode: "Remote",
      minCGPA: 7.5,
      requiredSkills: ["Node.js"],
      stipend: 20000,
      deadline: "2026-12-31",
    });

  assert.equal(res.status, 403);
});

test("POST /api/internships rejects invalid payload with 400", async () => {
  User.findById = async () => ({ _id: companyId, role: "company", companyApproved: true });

  const res = await request(app)
    .post("/api/internships")
    .set("Authorization", `Bearer ${approvedCompanyToken}`)
    .send({
      title: "", // empty title invalid
      description: "Too short",
    });

  assert.equal(res.status, 400);
});

test("PATCH /api/internships/:id/deactivate enforces owner access", async () => {
  // Mock existing internship owned by companyId
  Internship.findById = async () => ({
    ...sampleInternship,
    company: companyId,
    save: async () => {},
  });

  // Attempt deactivate with different company token -> 403
  const resForbidden = await request(app)
    .patch(`/api/internships/${internshipId}/deactivate`)
    .set("Authorization", `Bearer ${otherCompanyToken}`);
  assert.equal(resForbidden.status, 403);

  // Attempt deactivate with owner token -> 200
  const resSuccess = await request(app)
    .patch(`/api/internships/${internshipId}/deactivate`)
    .set("Authorization", `Bearer ${approvedCompanyToken}`);
  assert.equal(resSuccess.status, 200);
});

test("GET /api/internships/:id/eligibility checks CGPA and skills", async () => {
  Internship.findById = async () => sampleInternship;
  User.findById = () => ({
    select: async () => ({
      _id: studentId,
      cgpa: 8.5,
      skills: ["react", "javascript", "node.js"],
    }),
  });

  // Student meets minCGPA 7.0 and requiredSkills react, javascript
  const res = await request(app)
    .get(`/api/internships/${internshipId}/eligibility`)
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.eligible, true);
});
