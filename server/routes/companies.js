const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { validateCompanyProfile } = require("../utils/companyValidation");

// Fields exposed for company profile
const COMPANY_FIELDS =
  "name email companyName companyApproved companyDescription logoUrl location industry website";

// View current company profile (issue #13)
router.get("/me", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const company = await User.findById(req.user._id).select(COMPANY_FIELDS);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({ profile: company });
  } catch (error) {
    console.error("Error retrieving company profile:", error);
    return res.status(500).json({ message: "Unable to load company profile." });
  }
});

// Update current company profile (issue #13)
router.put("/me", async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const { companyName, companyDescription, location, industry, logoUrl, website } = req.body;
    const error = validateCompanyProfile({
      companyName,
      companyDescription,
      location,
      industry,
      logoUrl,
      website,
    });

    if (error) {
      return res.status(400).json({ message: error });
    }

    const updates = {};
    if (companyName !== undefined) updates.companyName = companyName.trim();
    if (companyDescription !== undefined) updates.companyDescription = companyDescription.trim();
    if (location !== undefined) updates.location = location.trim();
    if (industry !== undefined) updates.industry = industry.trim();
    if (logoUrl !== undefined) updates.logoUrl = logoUrl.trim();
    if (website !== undefined) updates.website = website.trim();

    const company = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select(COMPANY_FIELDS);

    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({
      message: "Company profile updated successfully.",
      profile: company,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return res.status(500).json({ message: "Unable to update company profile." });
  }
});

// Public company details by company user id
router.get("/:id", async (req, res) => {
  try {
    const company = await User.findOne({
      _id: req.params.id,
      role: "company",
    }).select("name companyName companyDescription logoUrl location industry website companyApproved");

    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    return res.status(200).json({ company });
  } catch (error) {
    console.error("Error loading public company profile:", error);
    return res.status(500).json({ message: "Unable to load company." });
  }
});

module.exports = router;
