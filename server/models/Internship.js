const mongoose = require("mongoose");
const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, default: "Bengaluru" },
    minCGPA: { type: Number, default: 0 },
    requiredSkills: [{ type: String, trim: true }],
    status: { type: String, default: "pending" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);
module.exports = mongoose.models.Internship || mongoose.model("Internship", internshipSchema);