const express = require("express");
const User = require("../models/User");
const Application = require("../models/Application");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("admin"));

// Dashboard counts
router.get("/dashboard", async (req, res) => {
  try {
    const [students, companies, pendingApprovals, applications] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "company" }),
        User.countDocuments({
          role: "company",
          companyApprovalStatus: "pending",
        }),
        Application.countDocuments(),
      ]);

    res.json({ students, companies, pendingApprovals, applications });
  } catch {
    res.status(500).json({ message: "Unable to load dashboard counts." });
  }
});

// Get pending company approvals
router.get("/companies/pending", async (req, res) => {
  try {
    const companies = await User.find({
      role: "company",
      companyApprovalStatus: "pending",
    }).select("-password");

    res.json({ companies });
  } catch {
    res.status(500).json({ message: "Unable to load pending companies." });
  }
});

// Get users for admin management
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ["student", "company"] } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch {
    res.status(500).json({ message: "Unable to load users." });
  }
});

// Approve or reject a company
router.patch("/companies/:id/approval", async (req, res) => {
  try {
    const { approved } = req.body;

    if (typeof approved !== "boolean") {
      return res.status(400).json({ message: "approved must be true or false." });
    }

    const company = await User.findOneAndUpdate(
      { _id: req.params.id, role: "company" },
      {
        companyApproved: approved,
        companyApprovalStatus: approved ? "approved" : "rejected",
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    res.json({
      message: approved ? "Company approved." : "Company rejected.",
      company,
    });
  } catch {
    res.status(500).json({ message: "Unable to update company approval." });
  }
});

// Activate or deactivate a user
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ message: "isActive must be true or false." });
    }

    if (req.params.id === req.user._id) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: { $in: ["student", "company"] } },
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: isActive ? "User activated." : "User deactivated.",
      user,
    });
  } catch {
    res.status(500).json({ message: "Unable to update user status." });
  }
});

module.exports = router;