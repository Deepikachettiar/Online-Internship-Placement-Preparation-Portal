
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Student registration
router.post("/register/student", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Student registered successfully.",
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid registration details.",
      });
    }

    console.error("Student registration failed:", error.message);

    return res.status(500).json({
      message: "Unable to register student.",
    });
  }
});

module.exports = router;
