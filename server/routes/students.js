
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { validateProfile } = require("../utils/profileValidation");
const { authenticateToken } = require("../middleware/auth");

const PROFILE_FIELDS =
  "name email department graduationYear cgpa skills resumeUrl";

// View my academic profile (issue #8).
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const student = await User.findById(req.user._id).select(PROFILE_FIELDS);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({ profile: student });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load profile." });
  }
});

// Create or update my academic profile.
router.put("/me", authenticateToken, async (req, res) => {
  try {
    const { department, graduationYear, cgpa } = req.body;

    const error = validateProfile({ department, graduationYear, cgpa });
    if (error) {
      return res.status(400).json({ message: error });
    }

    const updates = {};

    if (department !== undefined) {
      updates.department = department.trim();
    }

    if (graduationYear !== undefined) {
      updates.graduationYear = Number(graduationYear);
    }

    if (cgpa !== undefined) {
      updates.cgpa = Number(cgpa);
    }

    const student = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select(PROFILE_FIELDS);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    return res.status(200).json({
      message: "Profile saved.",
      profile: student,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save profile." });
  }
});

module.exports = router;
