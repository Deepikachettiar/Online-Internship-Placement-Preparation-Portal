const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-secret-tests-api";

const AptitudeTest = require("../models/AptitudeTest");
const TestHistory = require("../models/TestHistory");
const TestAttempt = require("../models/TestAttempt");
const testRoutes = require("./tests");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/tests", testRoutes);

const studentId = "64b7f0c2a1b2c3d4e5f60740";
const testId = "64b7f0c2a1b2c3d4e5f60750";

const studentToken = jwt.sign(
  { _id: studentId, id: studentId, role: "student" },
  process.env.JWT_SECRET
);

const sampleTest = {
  _id: testId,
  title: "General Aptitude Assessment",
  description: "Assessment covering Quant and Logical Reasoning",
  durationMinutes: 20,
  isPublished: true,
  questions: [
    { _id: "q1", category: "Quant", question: "10 + 20?", options: ["20", "30", "40"], answer: "30" },
    { _id: "q2", category: "Logical", question: "Next: 2, 4, 6, ?", options: ["7", "8", "9"], answer: "8" },
  ],
};

test("GET /api/tests returns published tests", async () => {
  AptitudeTest.find = () => ({
    select: () => ({
      sort: () => ({
        lean: async () => [sampleTest],
      }),
    }),
  });

  const res = await request(app).get("/api/tests");
  assert.equal(res.status, 200);
  assert.equal(res.body.tests.length, 1);
  assert.equal(res.body.tests[0].title, "General Aptitude Assessment");
});

test("GET /api/tests/:id returns single test", async () => {
  AptitudeTest.findById = () => ({
    populate: () => ({
      lean: async () => sampleTest,
    }),
  });

  const res = await request(app).get(`/api/tests/${testId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.test.title, "General Aptitude Assessment");
});

test("GET /api/tests/:id returns 404 for unknown test", async () => {
  AptitudeTest.findById = () => ({
    populate: () => ({
      lean: async () => null,
    }),
  });

  const res = await request(app).get("/api/tests/unknown_id");
  assert.equal(res.status, 404);
});

test("POST /api/tests/:id/submit rejects unauthenticated attempt with 401", async () => {
  const res = await request(app).post(`/api/tests/${testId}/submit`).send({ answers: {} });
  assert.equal(res.status, 401);
});

test("POST /api/tests/:id/submit evaluates answers and returns results (OIP-F-022)", async () => {
  AptitudeTest.findById = () => ({
    populate: async () => sampleTest,
  });

  TestAttempt.findOneAndUpdate = async () => null;

  // Mock TestHistory save
  TestHistory.prototype.save = async function () {
    this._id = "history_record_123";
    return this;
  };

  const res = await request(app)
    .post(`/api/tests/${testId}/submit`)
    .set("Authorization", `Bearer ${studentToken}`)
    .send({
      answers: {
        q1: "30",
        q2: "8",
      },
      timeSpentSeconds: 180,
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.result.score, 2);
  assert.equal(res.body.result.totalQuestions, 2);
  assert.equal(res.body.result.percentage, 100);
  assert.equal(res.body.result.passed, true);
  assert.ok(res.body.result.strongTopics.includes("Quant"));
});

test("GET /api/tests/analytics/me returns student aggregated preparation analytics (OIP-F-023)", async () => {
  const mockAttempts = [
    {
      score: 2,
      totalQuestions: 2,
      topicBreakdown: [
        { topic: "Quant", totalQuestions: 1, correctAnswers: 1 },
        { topic: "Logical", totalQuestions: 1, correctAnswers: 1 },
      ],
    },
  ];

  TestHistory.find = () => ({
    populate: () => ({
      sort: () => ({
        lean: async () => mockAttempts,
      }),
    }),
  });

  const res = await request(app)
    .get("/api/tests/analytics/me")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.totalAttempts, 1);
  assert.equal(res.body.overallAccuracy, 100);
  assert.ok(res.body.strongTopics.includes("Quant"));
});

test("POST /api/tests/:id/start requires login", async () => {
  const res = await request(app).post(`/api/tests/${testId}/start`);
  assert.equal(res.status, 401);
});

test("POST /api/tests/:id/start saves the server start time (OIP-F-021)", async () => {
  AptitudeTest.findById = () => ({
    select: () => ({ lean: async () => sampleTest }),
  });
  TestAttempt.findOne = async () => null;
  let created = null;
  TestAttempt.create = async (data) => {
    created = data;
    return { _id: "attempt1", startedAt: new Date(), ...data };
  };

  const res = await request(app)
    .post(`/api/tests/${testId}/start`)
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 201);
  assert.equal(created.student, studentId);
  assert.equal(res.body.durationSeconds, 20 * 60);
  assert.ok(res.body.remainingSeconds > 1190 && res.body.remainingSeconds <= 1200);
});

test("POST /api/tests/:id/start resumes a running attempt with the remaining time", async () => {
  AptitudeTest.findById = () => ({
    select: () => ({ lean: async () => sampleTest }),
  });
  TestAttempt.findOne = async () => ({
    _id: "attempt2",
    startedAt: new Date(Date.now() - 300 * 1000),
  });

  const res = await request(app)
    .post(`/api/tests/${testId}/start`)
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 201);
  assert.equal(res.body.attemptId, "attempt2");
  assert.ok(res.body.remainingSeconds <= 900 && res.body.remainingSeconds > 890);
});

test("POST /api/tests/:id/start returns 404 for an unpublished test", async () => {
  AptitudeTest.findById = () => ({
    select: () => ({ lean: async () => ({ ...sampleTest, isPublished: false }) }),
  });

  const res = await request(app)
    .post(`/api/tests/${testId}/start`)
    .set("Authorization", `Bearer ${studentToken}`);
  assert.equal(res.status, 404);
});

test("POST /api/tests/:id/submit takes the time spent from the server start time", async () => {
  AptitudeTest.findById = () => ({ populate: async () => sampleTest });
  TestAttempt.findOneAndUpdate = async () => ({
    startedAt: new Date(Date.now() - 600 * 1000),
  });
  let saved = null;
  TestHistory.prototype.save = async function () {
    saved = this;
    this._id = "history_2";
    return this;
  };

  const res = await request(app)
    .post(`/api/tests/${testId}/submit`)
    .set("Authorization", `Bearer ${studentToken}`)
    .send({ answers: { q1: "30" }, timeSpentSeconds: 1 });

  assert.equal(res.status, 201);
  assert.ok(saved.timeSpentSeconds >= 599 && saved.timeSpentSeconds <= 601);
});

test("GET /api/tests/analytics/me returns empty state when no tests are done (TC-AN-01)", async () => {
  TestHistory.find = () => ({
    populate: () => ({
      sort: () => ({
        lean: async () => [],
      }),
    }),
  });

  const res = await request(app)
    .get("/api/tests/analytics/me")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.totalAttempts, 0);
  assert.deepEqual(res.body.scoreHistory, []);
});

test("GET /api/tests/analytics/me labels strong and weak topics and lists score history", async () => {
  const mockAttempts = [
    {
      score: 1,
      totalQuestions: 4,
      percentage: 25,
      createdAt: new Date("2026-10-30"),
      test: { title: "Test B" },
      topicBreakdown: [
        { topic: "Quant", totalQuestions: 2, correctAnswers: 2 },
        { topic: "Verbal", totalQuestions: 2, correctAnswers: 0 },
      ],
    },
    {
      score: 2,
      totalQuestions: 4,
      percentage: 50,
      createdAt: new Date("2026-10-28"),
      test: { title: "Test A" },
      topicBreakdown: [
        { topic: "Quant", totalQuestions: 2, correctAnswers: 2 },
        { topic: "Verbal", totalQuestions: 2, correctAnswers: 1 },
      ],
    },
  ];

  TestHistory.find = () => ({
    populate: () => ({
      sort: () => ({
        lean: async () => mockAttempts,
      }),
    }),
  });

  const res = await request(app)
    .get("/api/tests/analytics/me")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.strongTopics, ["Quant"]);
  assert.deepEqual(res.body.weakTopics, ["Verbal"]);
  assert.equal(res.body.scoreHistory[0].title, "Test A");
  assert.equal(res.body.scoreHistory[1].percentage, 25);
});
