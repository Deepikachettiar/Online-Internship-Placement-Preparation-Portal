/**
 * Auto-scoring and topic diagnostics utility.
 */

function normalizeAnswer(ans) {
  if (ans === undefined || ans === null) return "";
  return String(ans).trim().toLowerCase();
}

function calculateTestScore(questions = [], submittedAnswers = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return {
      score: 0,
      totalQuestions: 0,
      percentage: 0,
      passed: false,
      answers: [],
      topicBreakdown: [],
      strongTopics: [],
      weakTopics: [],
    };
  }

  const answerMap = new Map();

  if (Array.isArray(submittedAnswers)) {
    for (const item of submittedAnswers) {
      if (item?.questionId) {
        answerMap.set(String(item.questionId), item.answer);
      }
    }
  } else if (submittedAnswers && typeof submittedAnswers === "object") {
    for (const [qid, ans] of Object.entries(submittedAnswers)) {
      answerMap.set(String(qid), ans);
    }
  }

  let totalScore = 0;
  const detailedAnswers = [];
  const topicStats = {};

  for (const q of questions) {
    const qid = String(q._id || q.id || "");
    const selected = answerMap.get(qid) ?? "";

    const options = q.options || [];
    const correctIndex = Number.isInteger(q.correctIndex)
      ? q.correctIndex
      : options.findIndex(
          (option) => normalizeAnswer(option) === normalizeAnswer(q.answer)
        );

    const correct =
      correctIndex >= 0 && options[correctIndex] !== undefined
        ? options[correctIndex]
        : q.answer || "";

    const topic = q.topic || q.category || "General";

    const isCorrect =
      normalizeAnswer(selected) !== "" &&
      normalizeAnswer(selected) === normalizeAnswer(correct);

    if (isCorrect) totalScore += 1;

    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0 };
    }

    topicStats[topic].total += 1;
    if (isCorrect) topicStats[topic].correct += 1;

    detailedAnswers.push({
      question: q._id || qid,
      selectedOption: String(selected),
      correctOption: String(correct),
      isCorrect,
      category: topic,
    });
  }

  const totalQuestions = questions.length;
  const percentage = Number(((totalScore / totalQuestions) * 100).toFixed(2));
  const passed = percentage >= 50;

  const topicBreakdown = [];
  const strongTopics = [];
  const weakTopics = [];

  for (const [topic, stats] of Object.entries(topicStats)) {
    const accuracy = Number(
      ((stats.correct / stats.total) * 100).toFixed(2)
    );

    topicBreakdown.push({
      topic,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      accuracy,
    });

    if (accuracy >= 75) strongTopics.push(topic);
    else if (accuracy < 50) weakTopics.push(topic);
  }

  return {
    score: totalScore,
    totalQuestions,
    percentage,
    passed,
    answers: detailedAnswers,
    topicBreakdown,
    strongTopics,
    weakTopics,
  };
}

module.exports = {
  calculateTestScore,
  normalizeAnswer,
};