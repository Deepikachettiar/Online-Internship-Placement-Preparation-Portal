const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const Question = require("../models/Question");
const questionRoutes = require("./questions");

process.env.JWT_SECRET = "test-question-secret";

const app = express();
app.use(express.json());
app.use("/api/admin/questions", questionRoutes);

const adminToken = jwt.sign(
  { id: "admin123", role: "admin" },
  process.env.JWT_SECRET
);

const studentToken = jwt.sign(
  { id: "student123", role: "student" },
  process.env.JWT_SECRET
);

const originalFind = Question.find;
const originalCreate = Question.create;
const originalFindByIdAndUpdate = Question.findByIdAndUpdate;
const originalFindByIdAndDelete = Question.findByIdAndDelete;

test.afterEach(() => {
  Question.find = originalFind;
  Question.create = originalCreate;
  Question.findByIdAndUpdate = originalFindByIdAndUpdate;
  Question.findByIdAndDelete = originalFindByIdAndDelete;
});

const validQuestion = {
  stem: "What is 20% of 100?",
  options: ["10", "20", "30", "40"],
  correctIndex: 1,
  topic: "Quantitative Aptitude",
  difficulty: "easy",
  explanation: "20% of 100 is 20.",
};

test("admin can list questions", async () => {
  Question.find = () => ({
    sort: async () => [{ _id: "q1", ...validQuestion }],
  });

  const response = await request(app)
    .get("/api/admin/questions")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.questions.length, 1);
});

test("admin can create a question", async () => {
  Question.create = async (data) => ({ _id: "q1", ...data });

  const response = await request(app)
    .post("/api/admin/questions")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(validQuestion);

  assert.equal(response.status, 201);
  assert.equal(response.body.question.stem, validQuestion.stem);
  assert.equal(response.body.question.correctIndex, 1);
  assert.equal(response.body.question.explanation, validQuestion.explanation);
});

test("question creation rejects invalid data", async () => {
  const response = await request(app)
    .post("/api/admin/questions")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ ...validQuestion, options: ["Only two", "Options"] });

  assert.equal(response.status, 400);
});

test("admin can update a question", async () => {
  Question.findByIdAndUpdate = async (id, data) => ({
    _id: id,
    ...data,
  });

  const response = await request(app)
    .patch("/api/admin/questions/q1")
    .set("Authorization", `Bearer ${adminToken}`)
    .send(validQuestion);

  assert.equal(response.status, 200);
  assert.equal(response.body.question.stem, validQuestion.stem);
});

test("admin can delete a question", async () => {
  Question.findByIdAndDelete = async (id) => ({ _id: id });

  const response = await request(app)
    .delete("/api/admin/questions/q1")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
});

test("non-admin users receive 403", async () => {
  const response = await request(app)
    .get("/api/admin/questions")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(response.status, 403);
});

test("unauthenticated users receive 401", async () => {
  const response = await request(app).get("/api/admin/questions");

  assert.equal(response.status, 401);
});