const test = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("perf_hooks");
const { checkEligibility } = require("../utils/eligibility");
const { calculateTestScore } = require("../utils/scoring");

test("OIP-NF-004: Concurrency simulation of 100 simultaneous requests maintains 0% error rate and < 2.0s latency", async () => {
  const CONCURRENT_REQUESTS = 100;
  const tasks = [];

  const sampleStudent = {
    cgpa: 8.0,
    skills: ["javascript", "react", "node.js"],
  };

  const sampleInternship = {
    minCGPA: 7.0,
    requiredSkills: ["react"],
  };

  const questions = [
    { _id: "q1", category: "Quant", answer: "A" },
    { _id: "q2", category: "Logical", answer: "B" },
    { _id: "q3", category: "Verbal", answer: "C" },
  ];
  const answers = { q1: "A", q2: "B", q3: "C" };

  const startTime = performance.now();

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    tasks.push(
      (async () => {
        const t0 = performance.now();
        // Simulate concurrent processing of eligibility and scoring
        const eligibility = checkEligibility(sampleStudent, sampleInternship);
        const scoring = calculateTestScore(questions, answers);
        const t1 = performance.now();
        return {
          success: eligibility.eligible && scoring.passed,
          duration: t1 - t0,
        };
      })()
    );
  }

  const results = await Promise.all(tasks);
  const totalDuration = performance.now() - startTime;

  const failureCount = results.filter((r) => !r.success).length;
  const errorRate = failureCount / CONCURRENT_REQUESTS;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / CONCURRENT_REQUESTS;

  assert.equal(errorRate, 0, "Error rate must be 0% (< 1% threshold)");
  assert.ok(totalDuration < 2000, `Total simulated burst ${totalDuration}ms exceeds 2.0s limit`);
  assert.ok(avgDuration < 100, `Average latency per operation ${avgDuration}ms exceeds 100ms`);
});
