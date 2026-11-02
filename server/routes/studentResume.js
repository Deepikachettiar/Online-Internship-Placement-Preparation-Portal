const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const User = require("../models/User");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const { MAX_RESUME_SIZE, validateResumeFile } = require("../utils/resume");

const router = express.Router();

const RESUME_URL = "/api/students/me/resume";

// Files are kept outside the public folder, one PDF per student.
function uploadDir() {
  return (
    process.env.RESUME_UPLOAD_DIR ||
    path.join(__dirname, "..", "uploads", "resumes")
  );
}

function resumeFile(userId) {
  return path.join(uploadDir(), `${userId}.pdf`);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_SIZE, files: 1 },
}).single("resume");

router.use(authenticateToken, authorizeRoles("student"));

// The id comes from the token, but we still check it before using it in a file name.
function hasSafeId(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(String(req.user._id))) {
    return res.status(401).json({ message: "Invalid authentication token." });
  }
  next();
}

router.use(hasSafeId);

// Upload or replace my resume (issue #10).
router.post("/", (req, res) => {
  upload(req, res, async (uploadError) => {
    if (uploadError) {
      const tooBig = uploadError.code === "LIMIT_FILE_SIZE";
      return res.status(400).json({
        message: tooBig
          ? "Resume must be 5 MB or smaller."
          : "Unable to read the uploaded file.",
      });
    }

    const error = validateResumeFile(req.file);
    if (error) return res.status(400).json({ message: error });

    try {
      const filePath = resumeFile(req.user._id);
      const replacing = fs.existsSync(filePath);

      fs.mkdirSync(uploadDir(), { recursive: true });
      fs.writeFileSync(filePath, req.file.buffer);

      await User.findByIdAndUpdate(req.user._id, { resumeUrl: RESUME_URL });

      return res.status(200).json({
        message: replacing ? "Resume replaced." : "Resume uploaded.",
        resumeUrl: RESUME_URL,
      });
    } catch (err) {
      return res.status(500).json({ message: "Unable to save resume." });
    }
  });
});

// Download my own resume.
router.get("/", (req, res) => {
  const filePath = resumeFile(req.user._id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "No resume uploaded yet." });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="resume.pdf"');
  return res.sendFile(filePath);
});

module.exports = router;
