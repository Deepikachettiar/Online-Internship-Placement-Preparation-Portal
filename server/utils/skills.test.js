const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeSkill, validateSkill } = require("./skills");

test("normalizeSkill trims, lowercases and collapses spaces", () => {
  assert.equal(normalizeSkill("  React   JS "), "react js");
  assert.equal(normalizeSkill("Node.js"), "node.js");
});

test("normalizeSkill returns an empty string for non-text values", () => {
  assert.equal(normalizeSkill(undefined), "");
  assert.equal(normalizeSkill(42), "");
});

test("validateSkill accepts common skills", () => {
  assert.equal(validateSkill("c++"), null);
  assert.equal(validateSkill("c#"), null);
  assert.equal(validateSkill("node.js"), null);
  assert.equal(validateSkill("machine learning"), null);
});

test("validateSkill rejects empty, long and unsafe skills", () => {
  assert.ok(validateSkill(""));
  assert.ok(validateSkill("a".repeat(31)));
  assert.ok(validateSkill("<script>"));
  assert.ok(validateSkill("a/b"));
});
