const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const User = require("../models/User");
const { checkEligibility } = require("../utils/eligibility");
const { validateInternshipPayload } = require("../utils/internshipValidation");

// Post an internship (issue #14)
// Only approved companies can post internships
router.post("/", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const companyUser = await User.findById(req.user._id);
    if (!companyUser || (companyUser.role !== "company" && companyUser.role !== "admin")) {
      return res.status(403).json({ message: "Only companies can post internships." });
    }

    // Unapproved company gets HTTP 403 (AC-OIP-F-009)
    if (!companyUser.companyApproved) {
      return res.status(403).json({
        message: "Your company account is pending administrator approval.",
      });
    }

    const {
      title,
      description,
      location = "Bengaluru",
      workMode = "On-site",
      minCGPA = 0,
      requiredSkills = [],
      stipend = 0,
      duration = "3 months",
      deadline,
    } = req.body;

    const error = validateInternshipPayload({
      title,
      description,
      deadline,
      minCGPA,
      stipend,
      workMode,
      requiredSkills,
    });
    if (error) {
      return res.status(400).json({ message: error });
    }

    const internship = await Internship.create({
      title: title.trim(),
      description: description.trim(),
      company: companyUser._id,
      location: location.trim(),
      workMode,
      minCGPA: Number(minCGPA),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills.map((s) => String(s).trim()).filter(Boolean)
        : [],
      stipend: Number(stipend),
      duration: duration.trim(),
      deadline: new Date(deadline),
      status: "Active",
      isPublished: true,
    });

    return res.status(201).json({
      message: "Internship posted successfully.",
      internship,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to post internship." });
  }
});

// View company's own postings
router.get("/company/me", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const listings = await Internship.find({ company: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ internships: listings });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load company listings." });
  }
});

// Get single internship by ID
router.get("/:id", async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate(
      "company",
      "name companyName companyDescription logoUrl location industry website companyApproved"
    );

    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    return res.status(200).json({ internship });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve internship." });
  }
});

// Check eligibility (issue #18)
router.get("/:id/eligibility", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const result = checkEligibility(req.user, internship);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: "Unable to check eligibility." });
  }
});

module.exports = router;