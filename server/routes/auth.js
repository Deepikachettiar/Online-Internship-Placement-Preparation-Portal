
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const isNonEmptyString = (value) =>
  typeof value === "string" && Boolean(value.trim());

async function findExistingUser(email) {
  return User.findOne({ email: email.trim().toLowerCase() });
}

function handleRegistrationError(error, res, type) {
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

  console.error(`${type} registration failed:`, error.message);
  return res.status(500).json({
    message: `Unable to register ${type.toLowerCase()}.`,
  });
}

// Login with JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isNonEmptyString(email) ||
        typeof password !== "string" ||
        !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const user = await findExistingUser(email);

    // Use the same response for unknown emails and incorrect passwords.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({
      message: "Unable to log in.",
    });
  }
});

// Student registration
router.post("/register/student", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      typeof password !== "string" ||
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

    if (await findExistingUser(normalizedEmail)) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
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
    return handleRegistrationError(error, res, "Student");
  }
});

// Company registration
router.post("/register/company", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      websiteDomain,
      contactDetails,
    } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      typeof password !== "string" ||
      !password ||
      !isNonEmptyString(companyName) ||
      !isNonEmptyString(websiteDomain) ||
      !isNonEmptyString(contactDetails)
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, company name, website domain, and contact details are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const personalEmailDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "icloud.com",
      "proton.me",
    ];
    const emailDomain = normalizedEmail.split("@")[1];

    if (!emailDomain || personalEmailDomains.includes(emailDomain)) {
      return res.status(400).json({
        message: "Please use a corporate email address.",
      });
    }

    if (await findExistingUser(normalizedEmail)) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const company = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      role: "company",
      companyName: companyName.trim(),
      websiteDomain: websiteDomain.trim(),
      contactDetails: contactDetails.trim(),
      companyApproved: false,
    });

    return res.status(201).json({
      message: "Company registered successfully. Pending Approval.",
      user: {
        id: company._id,
        name: company.name,
        email: company.email,
        role: company.role,
        companyName: company.companyName,
        websiteDomain: company.websiteDomain,
        contactDetails: company.contactDetails,
        approvalStatus: "Pending Approval",
      },
    });
  } catch (error) {
    return handleRegistrationError(error, res, "Company");
  }
});

module.exports = router;
