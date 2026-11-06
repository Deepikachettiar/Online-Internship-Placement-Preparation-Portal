
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const AptitudeTest = require("../models/AptitudeTest");
const Question = require("../models/Question");
const adminTestRoutes = require("./adminTests");

process.env.JWT_SECRET = "test-admin-tests-secret";

const app = express();
app.use(express.json());
app.use("/api/admin/tests", adminTestRoutes);

const adminToken = jwt.sign(
  { id: "admin123", role: "admin" },
  process.env.JWT_SECRET
);

const studentToken = jwt.sign(
  { id: "student123", role: "student" },
  process.env.JWT_SECRET
);

const originalFind = AptitudeTest.find;
const originalCreate = AptitudeTest.create;
const originalFindById = AptitudeTest.findById;
const originalFindByIdAndUpdate = AptitudeTest.findByIdAndUpdate;
const originalCountDocuments = Question.countDocuments;

test.afterEach(() => {
  AptitudeTest.find = originalFind;
  AptitudeTest.create = originalCreate;
  AptitudeTest.findById = originalFindById;
  AptitudeTest.findByIdAndUpdate = originalFindByIdAndUpdate;
  Question.countDocuments = originalCountDocuments;
});

const questionId = "64b7f0c2a1b2c3d4e5f60740";
const testId = "64b7f0c2a1b2c3d4e5f60750";

const validTest = {
  title: "Quantitative Aptitude Test",
  description: "Basic quantitative assessment",
  category: "Quantitative Aptitude",
  durationMinutes: 30,
  questions: [questionId],
};

test("admin can list all tests", async () => {
  AptitudeTest.find = () => ({
    populate: () => ({
      sort: async () => [{ _id: testId, ...validTest }],
    }),
  });

  const response = await request(app)
    .get("/api/admin/tests")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.tests.length, 1);
  assert.equal(response.body.tests[0].title, validTest.title);
});

test("admin can create a test as a draft", async () => {
  Question.countDocuments = async () => 1;
  AptitudeTest.create = async (data) => ({
    _id: testId,
    ...data,
  });

  const response = await request(app)
    .post("/api/admin/tests")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(validTest);

  assert.equal(response.status, 201);
  assert.equal(response.body.test.title, validTest.title);
  assert.equal(response.body.test.status, "draft");
  assert.equal(response.body.test.isPublished, false);
});

test("test creation rejects invalid configuration", async () => {
  const response = await request(app)
    .post("/api/admin/tests")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      ...validTest,
      durationMinutes: 0,
    });

  assert.equal(response.status, 400);
});

test("admin can update test configuration", async () => {
  const mockTest = {
    _id: testId,
    title: "Old Test",
    description: "",
    category: "General",
    durationMinutes: 20,
    questions: [questionId],
    save: async function () {
      return this;
    },
  };

  AptitudeTest.findById = async () => mockTest;
  Question.countDocuments = async () => 1;

  const response = await request(app)
    .patch(`/api/admin/tests/${testId}`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: "Updated Test",
      durationMinutes: 45,
      questions: [questionId],
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.test.title, "Updated Test");
  assert.equal(response.body.test.durationMinutes, 45);
});

test("admin can publish a test", async () => {
  const mockTest = {
    _id: testId,
    questions: [questionId],
    status: "draft",
    isPublished: false,
    save: async function () {
      return this;
    },
  };

  AptitudeTest.findById = async () => mockTest;

  const response = await request(app)
    .patch(`/api/admin/tests/${testId}/publish`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.test.status, "published");
  assert.equal(response.body.test.isPublished, true);
});

test("publishing a test without questions is rejected", async () => {
  AptitudeTest.findById = async () => ({
    _id: testId,
    questions: [],
  });

  const response = await request(app)
    .patch(`/api/admin/tests/${testId}/publish`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 400);
});

test("admin can deactivate a test", async () => {
  AptitudeTest.findByIdAndUpdate = async (id, update) => ({
    _id: id,
    ...update,
  });

  const response = await request(app)
    .patch(`/api/admin/tests/${testId}/deactivate`)
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.test.status, "draft");
  assert.equal(response.body.test.isPublished, false);
});

test("non-admin users receive 403", async () => {
  const response = await request(app)
    .get("/api/admin/tests")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(response.status, 403);
});

test("unauthenticated users receive 401", async () => {
  const response = await request(app).get("/api/admin/tests");

  assert.equal(response.status, 401);
});
