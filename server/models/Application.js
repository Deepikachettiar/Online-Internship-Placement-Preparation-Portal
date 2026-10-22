const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
      index: true,
    },
    resumeUrl: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"],
      default: "Applied",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications even if two requests arrive simultaneously.
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
