const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, default: "Bengaluru", trim: true },
    workMode: {
      type: String,
      enum: ["Remote", "On-site", "Hybrid"],
      default: "On-site",
    },
    minCGPA: { type: Number, default: 0, min: 0, max: 10 },
    requiredSkills: [{ type: String, trim: true }],
    stipend: { type: Number, default: 0, min: 0 },
    duration: { type: String, default: "3 months", trim: true },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Closed"],
      default: "Active",
    },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

internshipSchema.index({ title: "text", requiredSkills: "text", location: "text" });

module.exports = mongoose.models.Internship || mongoose.model("Internship", internshipSchema);