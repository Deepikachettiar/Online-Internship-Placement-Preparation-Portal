const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateTestScore, normalizeAnswer } = require("./scoring");

test("normalizeAnswer handles null, undefined, and strings with whitespace/casing", () => {
  assert.equal(normalizeAnswer(null), "");
  assert.equal(normalizeAnswer(undefined), "");
  assert.equal(normalizeAnswer("  Option A  "), "option a");
  assert.equal(normalizeAnswer(42), "42");
});

test("calculateTestScore returns zero stats when questions array is empty", () => {
  const result = calculateTestScore([], {});
  assert.equal(result.score, 0);
  assert.equal(result.totalQuestions, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.passed, false);
  assert.deepEqual(result.answers, []);
  assert.deepEqual(result.topicBreakdown, []);
  assert.deepEqual(result.strongTopics, []);
  assert.deepEqual(result.weakTopics, []);
});

test("calculateTestScore correctly evaluates 100% score and strong topics", () => {
  const questions = [
    { _id: "q1", category: "Quant", answer: "₹100" },
    { _id: "q2", category: "Quant", answer: "70" },
    { _id: "q3", category: "Logical", answer: "32" },
    { _id: "q4", category: "Verbal", answer: "Brief" },
  ];

  const answers = {
    q1: "₹100",
    q2: "70",
    q3: "32",
    q4: "Brief",
  };

  const result = calculateTestScore(questions, answers);
  assert.equal(result.score, 4);
  assert.equal(result.totalQuestions, 4);
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
  assert.equal(result.answers.length, 4);
  assert.ok(result.strongTopics.includes("Quant"));
  assert.ok(result.strongTopics.includes("Logical"));
  assert.ok(result.strongTopics.includes("Verbal"));
  assert.equal(result.weakTopics.length, 0);
});

test("calculateTestScore detects weak topics (< 50%) and strong topics (>= 75%)", () => {
  const questions = [
    // Quant: 4 questions, 4 correct -> 100% (Strong >= 75%)
    { _id: "q1", category: "Quant", answer: "A" },
    { _id: "q2", category: "Quant", answer: "B" },
    { _id: "q3", category: "Quant", answer: "C" },
    { _id: "q4", category: "Quant", answer: "D" },
    // Logical: 2 questions, 1 correct -> 50% (Average, neither strong nor weak)
    { _id: "q5", category: "Logical", answer: "A" },
    { _id: "q6", category: "Logical", answer: "B" },
    // Verbal: 4 questions, 1 correct -> 25% (Weak < 50%)
    { _id: "q7", category: "Verbal", answer: "A" },
    { _id: "q8", category: "Verbal", answer: "B" },
    { _id: "q9", category: "Verbal", answer: "C" },
    { _id: "q10", category: "Verbal", answer: "D" },
  ];

  const answers = {
    q1: "A",
    q2: "B",
    q3: "C",
    q4: "D",
    q5: "A",
    q6: "WRONG",
    q7: "A",
    q8: "WRONG",
    q9: "WRONG",
    q10: "WRONG",
  };

  const result = calculateTestScore(questions, answers);
  assert.equal(result.score, 6);
  assert.equal(result.totalQuestions, 10);
  assert.equal(result.percentage, 60.0);
  assert.equal(result.passed, true);

  assert.ok(result.strongTopics.includes("Quant"));
  assert.ok(!result.strongTopics.includes("Logical"));
  assert.ok(!result.strongTopics.includes("Verbal"));

  assert.ok(result.weakTopics.includes("Verbal"));
  assert.ok(!result.weakTopics.includes("Logical"));
  assert.ok(!result.weakTopics.includes("Quant"));
});

test("calculateTestScore supports submitted answers as an array", () => {
  const questions = [
    { _id: "q1", category: "Quant", answer: "10" },
    { _id: "q2", category: "Verbal", answer: "Quick" },
  ];

  const answersArray = [
    { questionId: "q1", answer: "10" },
    { questionId: "q2", answer: "Wrong" },
  ];

  const result = calculateTestScore(questions, answersArray);
  assert.equal(result.score, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.percentage, 50);
});
