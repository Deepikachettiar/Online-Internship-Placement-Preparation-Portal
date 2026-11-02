const mongoose = require("mongoose");

const testAnswerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOption: { type: String, default: "" },
    correctOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    category: { type: String, enum: ["Quant", "Logical", "Verbal"], default: "Quant" },
  },
  { _id: false }
);

const topicScoreSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    accuracy: { type: Number, required: true }, // percentage 0-100
  },
  { _id: false }
);

const testHistorySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "AptitudeTest", required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 },
    answers: [testAnswerSchema],
    topicBreakdown: [topicScoreSchema],
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
  },
  { timestamps: true }
);

testHistorySchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.models.TestHistory || mongoose.model("TestHistory", testHistorySchema);
