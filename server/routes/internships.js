const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const Application = require("../models/Application");

// Company owners can view applicants for their own internship only.
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
    return res.status(500).json({ message: "Unable to load applicants." });
  }
});

module.exports = router;
