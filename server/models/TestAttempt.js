const mongoose = require("mongoose");

// One started attempt of an aptitude test. The start time is saved on the
// server so the timer cannot be changed from the browser.
const testAttemptSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    test: { type: mongoose.Schema.Types.ObjectId, ref: "AptitudeTest", required: true },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

testAttemptSchema.index({ student: 1, test: 1, submittedAt: 1 });

module.exports = mongoose.models.TestAttempt || mongoose.model("TestAttempt", testAttemptSchema);
