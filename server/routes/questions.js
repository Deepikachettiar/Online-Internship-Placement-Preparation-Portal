const express = require("express");
const Question = require("../models/Question");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("admin"));

// List all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json({ questions });
  } catch {
    res.status(500).json({ message: "Unable to load questions." });
  }
});

// Create a question
router.post("/", async (req, res) => {
  try {
    const { stem, options, correctIndex, topic, difficulty, explanation } =
      req.body;

    if (
      typeof stem !== "string" ||
      !stem.trim() ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((option) => typeof option !== "string" || !option.trim()) ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex > 3 ||
      typeof topic !== "string" ||
      !topic.trim() ||
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({ message: "Invalid question details." });
    }

    const question = await Question.create({
      stem: stem.trim(),
      question: stem.trim(),
      options: options.map((option) => option.trim()),
      correctIndex,
      answer: options[correctIndex].trim(),
      topic: topic.trim(),
      category: topic.trim(),
      difficulty,
      explanation: explanation || "",
    });

    res.status(201).json({ message: "Question created.", question });
  } catch (error) {
    res.status(500).json({ message: "Unable to create question." });
  }
});

// Update a question
router.patch("/:id", async (req, res) => {
  try {
    const { stem, options, correctIndex, topic, difficulty, explanation } =
      req.body;

    if (
      typeof stem !== "string" ||
      !stem.trim() ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((option) => typeof option !== "string" || !option.trim()) ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex > 3 ||
      typeof topic !== "string" ||
      !topic.trim() ||
      !["easy", "medium", "hard"].includes(difficulty)
    ) {
      return res.status(400).json({ message: "Invalid question details." });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        stem: stem.trim(),
        question: stem.trim(),
        options: options.map((option) => option.trim()),
        correctIndex,
        answer: options[correctIndex].trim(),
        topic: topic.trim(),
        category: topic.trim(),
        difficulty,
        explanation: explanation || "",
      },
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json({ message: "Question updated.", question });
  } catch {
    res.status(500).json({ message: "Unable to update question." });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }

    res.json({ message: "Question deleted." });
  } catch {
    res.status(500).json({ message: "Unable to delete question." });
  }
});

module.exports = router;