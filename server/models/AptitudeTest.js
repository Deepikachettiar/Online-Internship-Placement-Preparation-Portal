const mongoose = require("mongoose");

const aptitudeTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isPublished: { type: Boolean, default: false },
    durationMinutes: { type: Number, default: 30 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AptitudeTest || mongoose.model("AptitudeTest", aptitudeTestSchema);
