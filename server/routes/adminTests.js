const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const AptitudeTest = require("../models/AptitudeTest");
const Question = require("../models/Question");

const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/auth");

router.use(authenticateToken, authorizeRoles("admin"));

// Get all tests for admin
router.get("/", async (req, res) => {
  try {
    const tests = await AptitudeTest.find()
      .populate("questions", "stem topic difficulty")
      .sort({ createdAt: -1 });

    return res.status(200).json({ tests });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve tests." });
  }
});

// Create a test
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      durationMinutes,
      questions,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Test title is required." });
    }

    if (
      !Number.isInteger(Number(durationMinutes)) ||
      Number(durationMinutes) < 1
    ) {
      return res.status(400).json({
        message: "Duration must be a positive whole number.",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        message: "Select at least one question.",
      });
    }

    if (!questions.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        message: "One or more question IDs are invalid.",
      });
    }

    const validQuestions = await Question.countDocuments({
      _id: { $in: questions },
    });

    if (validQuestions !== new Set(questions).size) {
      return res.status(400).json({
        message: "One or more selected questions do not exist.",
      });
    }

    const test = await AptitudeTest.create({
      title: title.trim(),
      description: description || "",
      category: category || "General",
      durationMinutes: Number(durationMinutes),
      questions,
      status: "draft",
      isPublished: false,
    });

    return res.status(201).json({
      message: "Test created successfully.",
      test,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A test with this title already exists.",
      });
    }

    return res.status(500).json({ message: "Unable to create test." });
  }
});

// Update test configuration
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid test ID." });
    }

    const test = await AptitudeTest.findById(id);

    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    const {
      title,
      description,
      category,
      durationMinutes,
      questions,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Title cannot be empty." });
      }
      test.title = title.trim();
    }

    if (description !== undefined) test.description = description;
    if (category !== undefined) test.category = category;

    if (durationMinutes !== undefined) {
      if (
        !Number.isInteger(Number(durationMinutes)) ||
        Number(durationMinutes) < 1
      ) {
        return res.status(400).json({
          message: "Duration must be a positive whole number.",
        });
      }

      test.durationMinutes = Number(durationMinutes);
    }

    if (questions !== undefined) {
      if (
        !Array.isArray(questions) ||
        questions.length === 0 ||
        !questions.every((qid) => mongoose.isValidObjectId(qid))
      ) {
        return res.status(400).json({
          message: "Select valid questions.",
        });
      }

      const validQuestions = await Question.countDocuments({
        _id: { $in: questions },
      });

      if (validQuestions !== new Set(questions).size) {
        return res.status(400).json({
          message: "One or more selected questions do not exist.",
        });
      }

      test.questions = questions;
    }

    await test.save();

    return res.status(200).json({
      message: "Test configuration updated.",
      test,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A test with this title already exists.",
      });
    }

    return res.status(500).json({ message: "Unable to update test." });
  }
});

// Publish a test
router.patch("/:id/publish", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid test ID." });
    }

    const test = await AptitudeTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    if (!test.questions.length) {
      return res.status(400).json({
        message: "Add at least one question before publishing.",
      });
    }

    test.status = "published";
    test.isPublished = true;

    await test.save();

    return res.status(200).json({
      message: "Test published successfully.",
      test,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to publish test." });
  }
});

// Deactivate a test
router.patch("/:id/deactivate", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid test ID." });
    }

    const test = await AptitudeTest.findByIdAndUpdate(
      req.params.id,
      {
        status: "draft",
        isPublished: false,
      },
      { new: true }
    );

    if (!test) {
      return res.status(404).json({ message: "Test not found." });
    }

    return res.status(200).json({
      message: "Test deactivated successfully.",
      test,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to deactivate test." });
  }
});

module.exports = router;