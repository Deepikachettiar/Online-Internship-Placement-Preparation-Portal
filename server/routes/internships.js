const express = require("express");
const router = express.Router();
const Internship = require("../models/Internship");
const { checkEligibility } = require("../utils/eligibility");

// Authentication middleware is expected to populate req.user.
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