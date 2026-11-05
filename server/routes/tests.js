const express = require("express");
const router = express.Router();
const AptitudeTest = require("../models/AptitudeTest");
const Question = require("../models/Question");
const TestHistory = require("../models/TestHistory");
const TestAttempt = require("../models/TestAttempt");
const { calculateTestScore } = require("../utils/scoring");

function currentUserId(req) {
  return req.user?._id || req.user?.id || req.user?.userId;
}

// List available published aptitude tests for students
router.get("/", async (req, res) => {
  try {
    const tests = await AptitudeTest.find({ isPublished: true })
      .select("title description durationMinutes isPublished createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ tests });
  } catch (error) {
    console.error("Failed to load aptitude tests:", error);
    return res.status(500).json({ message: "Unable to load aptitude tests." });
  }
});

// Student preparation analytics (OIP-F-023)
router.get("/analytics/me", async (req, res) => {
  try {
    const studentId = currentUserId(req);
    if (!studentId) return res.status(401).json({ message: "Authentication required." });

    const attempts = await TestHistory.find({ student: studentId })
      .populate("test", "title")
      .sort({ createdAt: -1 })
      .lean();

    if (attempts.length === 0) {
      return res.status(200).json({
        totalAttempts: 0,
        averageScore: 0,
        overallAccuracy: 0,
        categoryBreakdown: {},
        strongTopics: [],
        weakTopics: [],
        scoreHistory: [],
        recentAttempts: [],
      });
    }

    let totalScore = 0;
    let totalQuestions = 0;
    const categoryTotals = {};

    for (const attempt of attempts) {
      totalScore += attempt.score;
      totalQuestions += attempt.totalQuestions;

      for (const item of attempt.topicBreakdown || []) {
        if (!categoryTotals[item.topic]) {
          categoryTotals[item.topic] = { total: 0, correct: 0 };
        }
        categoryTotals[item.topic].total += item.totalQuestions;
        categoryTotals[item.topic].correct += item.correctAnswers;
      }
    }

    const categoryBreakdown = {};
    const strongTopics = [];
    const weakTopics = [];

    for (const [cat, data] of Object.entries(categoryTotals)) {
      const accuracy = data.total > 0 ? Number(((data.correct / data.total) * 100).toFixed(2)) : 0;
      categoryBreakdown[cat] = {
        total: data.total,
        correct: data.correct,
        accuracy,
      };
      if (accuracy >= 75.0) strongTopics.push(cat);
      else if (accuracy < 50.0) weakTopics.push(cat);
    }

    return res.status(200).json({
      totalAttempts: attempts.length,
      averageScore: Number((totalScore / attempts.length).toFixed(2)),
      overallAccuracy: totalQuestions > 0 ? Number(((totalScore / totalQuestions) * 100).toFixed(2)) : 0,
      categoryBreakdown,
      strongTopics,
      weakTopics,
      // Oldest first, so the chart reads left to right (latest 20 attempts)
      scoreHistory: attempts
        .slice(0, 20)
        .reverse()
        .map((attempt) => ({
          title: attempt.test?.title || "Aptitude test",
          percentage: attempt.percentage ?? 0,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
          date: attempt.createdAt,
        })),
      recentAttempts: attempts.slice(0, 5),
    });
  } catch (error) {
    console.error("Failed to load preparation analytics:", error);
    return res.status(500).json({ message: "Unable to load preparation analytics." });
  }
});

// Student test attempt history (OIP-F-022)
router.get("/history/me", async (req, res) => {
  try {
    const studentId = currentUserId(req);
    if (!studentId) return res.status(401).json({ message: "Authentication required." });

    const history = await TestHistory.find({ student: studentId })
      .populate("test", "title durationMinutes")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ history });
  } catch (error) {
    console.error("Failed to load test history:", error);
    return res.status(500).json({ message: "Unable to load test history." });
  }
});

// Get a single test with questions (answers omitted during test attempt)
router.get("/:id", async (req, res) => {
  try {
    const testDoc = await AptitudeTest.findById(req.params.id)
      .populate("questions", "category question options")
      .lean();

    if (!testDoc) {
      return res.status(404).json({ message: "Aptitude test not found." });
    }

    return res.status(200).json({ test: testDoc });
  } catch (error) {
    console.error("Failed to retrieve test:", error);
    return res.status(500).json({ message: "Unable to retrieve aptitude test." });
  }
});

// Start an attempt: saves the server start time used by the countdown timer (OIP-F-021)
router.post("/:id/start", async (req, res) => {
  try {
    const studentId = currentUserId(req);
    if (!studentId) return res.status(401).json({ message: "Authentication required." });

    const testDoc = await AptitudeTest.findById(req.params.id).select("durationMinutes isPublished").lean();
    if (!testDoc || !testDoc.isPublished) {
      return res.status(404).json({ message: "Aptitude test not found." });
    }

    const durationSeconds = (testDoc.durationMinutes || 30) * 60;

    // Resume the running attempt if there is one, so a refresh does not reset the timer
    let attempt = await TestAttempt.findOne({
      student: studentId,
      test: testDoc._id,
      submittedAt: null,
    });

    if (attempt && Date.now() - new Date(attempt.startedAt).getTime() >= durationSeconds * 1000) {
      // The old attempt already ran out, so close it and begin a new one
      attempt.submittedAt = new Date();
      await attempt.save();
      attempt = null;
    }

    if (!attempt) {
      attempt = await TestAttempt.create({ student: studentId, test: testDoc._id });
    }

    const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    return res.status(201).json({
      attemptId: attempt._id,
      startedAt: attempt.startedAt,
      durationSeconds,
      remainingSeconds: Math.max(durationSeconds - elapsed, 0),
    });
  } catch (error) {
    console.error("Failed to start test:", error);
    return res.status(500).json({ message: "Unable to start test." });
  }
});

// Submit a test attempt, auto-score, and save history (OIP-F-022)
router.post("/:id/submit", async (req, res) => {
  try {
    const studentId = currentUserId(req);
    if (!studentId) return res.status(401).json({ message: "Authentication required." });

    const testDoc = await AptitudeTest.findById(req.params.id).populate("questions");
    if (!testDoc) {
      return res.status(404).json({ message: "Aptitude test not found." });
    }

    const { answers } = req.body;
    let timeSpentSeconds = Number(req.body.timeSpentSeconds) || 0;

    // Close the running attempt and take the time from the server start time
    const attempt = await TestAttempt.findOneAndUpdate(
      { student: studentId, test: testDoc._id, submittedAt: null },
      { submittedAt: new Date() },
      { sort: { startedAt: -1 } }
    );
    if (attempt) {
      const limit = (testDoc.durationMinutes || 30) * 60;
      const spent = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      timeSpentSeconds = Math.min(spent, limit);
    }

    const evaluation = calculateTestScore(testDoc.questions, answers || {});

    const historyRecord = new TestHistory({
      student: studentId,
      test: testDoc._id,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      timeSpentSeconds,
      answers: evaluation.answers,
      topicBreakdown: evaluation.topicBreakdown,
      strongTopics: evaluation.strongTopics,
      weakTopics: evaluation.weakTopics,
    });

    await historyRecord.save();

    return res.status(201).json({
      message: "Test submitted and evaluated successfully.",
      result: {
        historyId: historyRecord._id,
        score: evaluation.score,
        totalQuestions: evaluation.totalQuestions,
        percentage: evaluation.percentage,
        passed: evaluation.passed,
        topicBreakdown: evaluation.topicBreakdown,
        strongTopics: evaluation.strongTopics,
        weakTopics: evaluation.weakTopics,
        detailedAnswers: evaluation.answers,
      },
    });
  } catch (error) {
    console.error("Failed to submit test:", error);
    return res.status(500).json({ message: "Unable to submit test." });
  }
});

module.exports = router;
