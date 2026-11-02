const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["Quant", "Logical", "Verbal"], required: true },
    question: { type: String, required: true, unique: true, trim: true },
    options: [{ type: String }],
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Question || mongoose.model("Question", questionSchema);
