
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const applicationRoutes = require("./routes/applications");
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const testRoutes = require("./routes/tests");
const resumeRoutes = require("./routes/resumes");
const healthRoutes = require("./routes/health");
const internshipRoutes = require("./routes/internships");
const studentRoutes = require("./routes/students");
const skillRoutes = require("./routes/skills");
const companyRoutes = require("./routes/companies");
const studentResumeRoutes = require("./routes/studentResume");
const questionRoutes = require("./routes/questions");
const adminTestRoutes = require("./routes/adminTests");

const { attachUser } = require("./middleware/auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Authentication context
app.use(attachUser);

// Health check
app.use("/api/health", healthRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Applications
app.use("/api/applications", applicationRoutes);

// Internships
app.use("/api/internships", internshipRoutes);

// Student routes
app.use("/api/students/me/skills", skillRoutes);
app.use("/api/students/me/resume", studentResumeRoutes);
app.use("/api/students", studentRoutes);

// Company routes
app.use("/api/companies", companyRoutes);

// Admin routes
app.use("/api/admin/questions", questionRoutes);
app.use("/api/admin/tests", adminTestRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Aptitude tests and analytics
app.use("/api/tests", testRoutes);

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
