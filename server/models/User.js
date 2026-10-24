const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "company", "admin"], default: "student" },
    department: { type: String, default: "", trim: true },
    graduationYear: { type: Number },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    resumeUrl: { type: String, default: "" },
    companyName: { type: String, default: "", trim: true },
    websiteDomain: { type: String, default: "", trim: true },
    contactDetails: { type: String, default: "", trim: true },
    companyApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);