
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    stem: { type: String, trim: true },
    question: { type: String, trim: true },
    options: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (options) => options.length === 4,
        message: "A question must have exactly four options.",
      },
    },
    correctIndex: {
      type: Number,
      min: 0,
      max: 3,
    },
    answer: { type: String, trim: true },
    topic: { type: String, trim: true },
    category: { type: String, trim: true, default: "Quant" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    explanation: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

questionSchema.pre("validate", function () {
  if (!this.stem && this.question) this.stem = this.question;
  if (!this.question && this.stem) this.question = this.stem;
  if (!this.topic && this.category) this.topic = this.category;
  if (!this.category && this.topic) this.category = this.topic;

  if (
    Number.isInteger(this.correctIndex) &&
    this.options?.[this.correctIndex]
  ) {
    this.answer = this.options[this.correctIndex];
  } else if (this.answer && this.options?.length === 4) {
    const index = this.options.findIndex(
      (option) => option === this.answer
    );
    if (index !== -1) this.correctIndex = index;
  }
});

module.exports =
  mongoose.models.Question || mongoose.model("Question", questionSchema);
