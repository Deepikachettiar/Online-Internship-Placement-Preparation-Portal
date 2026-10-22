
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const applicationRoutes = require("./routes/applications");


const healthRoutes = require("./routes/health");
const internshipRoutes = require("./routes/internships");
const studentRoutes = require("./routes/students");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check route
app.use("/api/health", healthRoutes);

// Application routes
app.use("/api/applications", applicationRoutes);

// Internship routes, including eligibility check
app.use("/api/internships", internshipRoutes);

// Student profile routes
app.use("/api/students", studentRoutes);

const PORT =process.env.PORT || 5000;

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

