const express = require("express");
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

module.exports = router;
