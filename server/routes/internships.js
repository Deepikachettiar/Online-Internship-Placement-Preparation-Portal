const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const User = require("../models/User");
const Application = require("../models/Application");
const { checkEligibility } = require("../utils/eligibility");
const { validateInternshipPayload } = require("../utils/internshipValidation");

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildInternshipFilter(query, approvedCompanies) {
  const filter = {
    status: "Active",
    isPublished: true,
    company: { $in: approvedCompanies },
  };

  const rawSearch = typeof query.search === "string" ? query.search : (typeof query.q === "string" ? query.q : "");
  const searchTerm = rawSearch.trim();
  if (searchTerm) {
    const escaped = escapeRegex(searchTerm);
    filter.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
      { location: { $regex: escaped, $options: "i" } },
      { requiredSkills: { $regex: escaped, $options: "i" } },
    ];
  }

  if (typeof query.skill === "string" && query.skill.trim()) {
    filter.requiredSkills = { $regex: escapeRegex(query.skill.trim()), $options: "i" };
  }

  if (typeof query.location === "string" && query.location.trim()) {
    filter.location = { $regex: escapeRegex(query.location.trim()), $options: "i" };
  }

  if (typeof query.workMode === "string" && ["Remote", "On-site", "Hybrid"].includes(query.workMode)) {
    filter.workMode = query.workMode;
  }

  if (query.minStipend !== undefined && query.minStipend !== "") {
    const stipendNum = Number(query.minStipend);
    if (!Number.isNaN(stipendNum) && Number.isFinite(stipendNum) && stipendNum >= 0) {
      filter.stipend = { $gte: stipendNum };
    }
  }

  return filter;
}

function applyInternshipUpdates(internship, fields) {
  const {
    title,
    description,
    location,
    workMode,
    minCGPA,
    requiredSkills,
    stipend,
    duration,
    deadline,
    status,
  } = fields;

  if (typeof title === "string") internship.title = title.trim();
  if (typeof description === "string") internship.description = description.trim();
  if (typeof location === "string") internship.location = location.trim();
  if (typeof workMode === "string" && ["Remote", "On-site", "Hybrid"].includes(workMode)) {
    internship.workMode = workMode;
  }
  if (minCGPA !== undefined && minCGPA !== "") internship.minCGPA = Number(minCGPA);
  if (stipend !== undefined && stipend !== "") internship.stipend = Number(stipend);
  if (typeof duration === "string") internship.duration = duration.trim();
  if (deadline) internship.deadline = new Date(deadline);
  if (typeof status === "string" && ["Active", "Inactive", "Closed"].includes(status)) {
    internship.status = status;
  }
  if (Array.isArray(requiredSkills)) {
    internship.requiredSkills = requiredSkills.map((s) => String(s).trim()).filter(Boolean);
  }
}

// Search, filter, and browse internships (paginated, active listings from approved companies - issues #16 & #17)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Find all approved companies
    const approvedCompanies = await User.find({
      role: "company",
      companyApproved: true,
    }).distinct("_id");

    const filter = buildInternshipFilter(req.query, approvedCompanies);

    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .populate(
          "company",
          "name companyName companyDescription logoUrl location industry website companyApproved"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Internship.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      internships,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Unable to load internships:", error);
    return res.status(500).json({ message: "Unable to load internships." });
  }
});

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
    console.error("Unable to post internship:", error);
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
    console.error("Unable to load company listings:", error);
    return res.status(500).json({ message: "Unable to load company listings." });
  }
});

// Edit an internship (issue #15, owner only)
router.put("/:id", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // Owner only check (AC-OIP-F-010)
    if (
      internship.company.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden: You can only edit your own listings." });
    }

    const error = validateInternshipPayload({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      minCGPA: req.body.minCGPA,
      stipend: req.body.stipend,
      workMode: req.body.workMode,
      requiredSkills: req.body.requiredSkills,
    });
    if (error) {
      return res.status(400).json({ message: error });
    }

    applyInternshipUpdates(internship, req.body);

    await internship.save();
    return res.status(200).json({ message: "Internship updated successfully.", internship });
  } catch (error) {
    console.error("Unable to update internship:", error);
    return res.status(500).json({ message: "Unable to update internship." });
  }
});

// Deactivate an internship (issue #15, owner only)
router.patch("/:id/deactivate", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    // Owner only check (AC-OIP-F-010)
    if (
      internship.company.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Forbidden: You can only deactivate your own listings." });
    }

    internship.status = "Inactive";
    await internship.save();

    return res.status(200).json({
      message: "Internship deactivated successfully.",
      internship,
    });
  } catch (error) {
    console.error("Unable to deactivate internship:", error);
    return res.status(500).json({ message: "Unable to deactivate internship." });
  }
});

// Company owners can view applicants for their own internship only (issue #21)
router.get("/:id/applications", async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Authentication required." });

    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found." });

    const role = String(req.user.role || "").toLowerCase();
    const isAdmin = role === "admin";
    const ownerId = internship.company?._id || internship.company;
    const isOwner = ownerId && String(ownerId) === String(req.user._id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "You cannot view applicants for this internship." });
    }

    const applications = await Application.find({ internship: internship._id })
      .populate("student", "name email cgpa skills")
      .sort({ createdAt: -1 });

    return res.status(200).json({ internship, applications });
  } catch (error) {
    console.error("Unable to load applicants:", error);
    return res.status(500).json({ message: "Unable to load applicants." });
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
    console.error("Unable to check eligibility:", error);
    return res.status(500).json({ message: "Unable to check eligibility." });
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
    console.error("Unable to retrieve internship:", error);
    return res.status(500).json({ message: "Unable to retrieve internship." });
  }
});

module.exports = router;
