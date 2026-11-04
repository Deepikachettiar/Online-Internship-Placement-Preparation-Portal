const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Internship = require("../models/Internship");

// Submit an application (issue #19).
router.post("/", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { internshipId, resumeUrl, coverLetter = "" } = req.body;
    if (!internshipId || !resumeUrl || !String(resumeUrl).trim()) {
      return res.status(400).json({
        message: "internshipId and an uploaded resume URL are required.",
      });
    }

    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ message: "Internship not found." });

    if (internship.status && internship.status !== "Active") {
      return res.status(400).json({
        message: "This internship is no longer active and does not accept new applications.",
      });
    }

    const application = await Application.create({
      student: req.user._id,
      internship: internship._id,
      resumeUrl: String(resumeUrl).trim(),
      coverLetter,
      status: "Applied",
    });

    return res.status(201).json({ message: "Application submitted successfully.", application });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "You have already applied to this internship." });
    }
    return res.status(500).json({ message: "Unable to submit application." });
  }
});

// Student's own applications, newest first.
router.get("/me", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const applications = await Application.find({ student: req.user._id })
      .populate("internship", "title company location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load applications." });
  }
});

// Issue #39: Update application status

const ALLOWED_DECISIONS = new Set([
  "Shortlisted",
  "Rejected",
  "Selected",
]);

router.patch("/:id/status", async (req, res) => {
  try {
    const { status, note = "" } = req.body || {};

    // Validate the requested status
    if (!ALLOWED_DECISIONS.has(status)) {
      return res.status(400).json({
        message: "Status must be Shortlisted, Rejected, or Selected.",
      });
    }

    // Find the application and its associated internship
    const application = await Application.findById(req.params.id)
      .populate("internship");

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Get the authenticated user and company information
    const companyId =
      req.user?.companyId ||
      req.user?.company?._id ||
      (req.user?.role === "company" ? req.user?._id : null);

    const internshipCompanyId =
      application.internship?.company?._id ||
      application.internship?.companyId;

    if (!req.user || !companyId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Only the company that owns the internship may update its applications
    if (
      !internshipCompanyId ||
      String(companyId) !== String(internshipCompanyId)
    ) {
      return res.status(403).json({
        message: "Only the owning company can update this application.",
      });
    }

    // Update the application status
    application.status = status;

    // Save the optional note if the model supports it
    if (application.schema.path("decisionNote")) {
      application.decisionNote = String(note).trim();
    }

    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully.",
      application: {
        _id: application._id,
        status: application.status,
        decisionNote: application.decisionNote || "",
      },
    });
  } catch (error) {
    console.error("Failed to update application status:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid application ID.",
      });
    }

    return res.status(500).json({
      message: "Failed to update application status.",
    });
  }
});

module.exports = router;
