const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const Application = require("../models/Application");
const Internship = require("../models/Internship");

// Access is granted only to the applicant, the internship owner, or an admin.
// The endpoint returns the stored resume URL; the client can open it in a new tab.
router.get("/:applicationId", async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Authentication required." });

    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found." });

    const internship = await Internship.findById(application.internship);
    if (!internship) return res.status(404).json({ message: "Internship not found." });

    const userId = String(req.user._id);
    const applicantId = String(application.student);
    const ownerId = String(internship.company?._id || internship.company || "");
    const role = String(req.user.role || "").toLowerCase();
    const allowed = userId === applicantId || userId === ownerId || role === "admin";

    if (!allowed) return res.status(403).json({ message: "You are not allowed to access this resume." });

    return res.status(200).json({ resumeUrl: application.resumeUrl });
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve resume." });
  }
});

// Streams the resume PDF for an application (same access rules as above).
router.get("/:applicationId/file", async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Authentication required." });

    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found." });

    const internship = await Internship.findById(application.internship);
    if (!internship) return res.status(404).json({ message: "Internship not found." });

    const userId = String(req.user._id);
    const ownerId = String(internship.company?._id || internship.company || "");
    const role = String(req.user.role || "").toLowerCase();
    const allowed =
      userId === String(application.student) || userId === ownerId || role === "admin";
    if (!allowed) return res.status(403).json({ message: "You are not allowed to access this resume." });

    const dir =
      process.env.RESUME_UPLOAD_DIR || path.join(__dirname, "..", "uploads", "resumes");
    const filePath = path.join(dir, `${application.student}.pdf`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Resume file not found." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="resume.pdf"');
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: "Unable to retrieve resume." });
  }
});

module.exports = router;
