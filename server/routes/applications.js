const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Internship = require("../models/Internship");

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
    if (!internship) {
      return res.status(404).json({ message: "Internship not found." });
    }

    const application = await Application.create({
      student: req.user._id,
      internship: internship._id,
      resumeUrl: String(resumeUrl).trim(),
      coverLetter,
      status: "Applied",
    });

    return res.status(201).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "You have already applied to this internship.",
      });
    }
    return res.status(500).json({ message: "Unable to submit application." });
  }
});

module.exports = router;
