const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const resumeRoutes = require("./routes/resumes");

const healthRoutes = require("./routes/health");
const internshipRoutes = require("./routes/internships");
const studentRoutes = require("./routes/students");
const skillRoutes = require("./routes/skills");
const companyRoutes = require("./routes/companies");
const studentResumeRoutes = require("./routes/studentResume");
const { attachUser } = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Sets req.user from the login token (if any) for every route below
app.use(attachUser);

// Health check route
app.use("/api/health", healthRoutes);

// Authentication and student registration routes
app.use("/api/auth", authRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Internship routes, including eligibility check
app.use("/api/internships", internshipRoutes);

// Student skills and resume routes (mounted before the profile routes)
app.use("/api/students/me/skills", skillRoutes);
app.use("/api/students/me/resume", studentResumeRoutes);

// Student profile routes
app.use("/api/students", studentRoutes);
// Resume routes
app.use("/api/resumes", resumeRoutes);

// Company profile routes
app.use("/api/companies", companyRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
