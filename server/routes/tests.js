const express = require("express");
const router = express.Router();
const AptitudeTest = require("../models/AptitudeTest");
const Question = require("../models/Question");
const TestHistory = require("../models/TestHistory");
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
        attempts: [],
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

// Submit a test attempt, auto-score, and save history (OIP-F-022)
router.post("/:id/submit", async (req, res) => {
  try {
    const studentId = currentUserId(req);
    if (!studentId) return res.status(401).json({ message: "Authentication required." });

    const testDoc = await AptitudeTest.findById(req.params.id).populate("questions");
    if (!testDoc) {
      return res.status(404).json({ message: "Aptitude test not found." });
    }

    const { answers, timeSpentSeconds = 0 } = req.body;
    const evaluation = calculateTestScore(testDoc.questions, answers || {});

    const historyRecord = new TestHistory({
      student: studentId,
      test: testDoc._id,
      score: evaluation.score,
      totalQuestions: evaluation.totalQuestions,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
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
