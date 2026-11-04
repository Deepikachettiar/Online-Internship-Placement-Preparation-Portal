const test = require("node:test");
const assert = require("node:assert/strict");

const Application = require("../models/Application");
const Internship = require("../models/Internship");
const User = require("../models/User");
const TestHistory = require("../models/TestHistory");

test("OIP-NF-007: Application model enforces compound unique index on student and internship", () => {
  const indexes = Application.schema.indexes();
  const compoundUniqueIndex = indexes.find(([fields, options]) => {
    return fields.student === 1 && fields.internship === 1 && options?.unique === true;
  });

  assert.ok(compoundUniqueIndex, "Application schema must define a compound unique index on { student: 1, internship: 1 }");
});

test("OIP-NF-007: Application schema restricts status to the 5 standard lifecycle states", () => {
  const statusField = Application.schema.path("status");
  assert.ok(statusField, "Application schema must include a status field");
  assert.ok(statusField.enumValues, "Status field must be an enum");

  const expectedStatuses = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"];
  for (const s of expectedStatuses) {
    assert.ok(statusField.enumValues.includes(s), `Status enum must include '${s}'`);
  }
});

test("OIP-NF-007: Internship schema defines required fields, workMode enum, and default status", () => {
  const workModeField = Internship.schema.path("workMode");
  assert.ok(workModeField.enumValues.includes("Remote"));
  assert.ok(workModeField.enumValues.includes("On-site"));
  assert.ok(workModeField.enumValues.includes("Hybrid"));

  const statusField = Internship.schema.path("status");
  assert.ok(statusField.enumValues.includes("Active"));
  assert.ok(statusField.enumValues.includes("Inactive"));
});

test("OIP-NF-007: User schema enforces role enum and default values", () => {
  const roleField = User.schema.path("role");
  assert.ok(roleField.enumValues.includes("student"));
  assert.ok(roleField.enumValues.includes("company"));
  assert.ok(roleField.enumValues.includes("admin"));
});

test("OIP-NF-007: TestHistory schema indexes student and creation timestamp", () => {
  const indexes = TestHistory.schema.indexes();
  const studentIndex = indexes.find(([fields]) => fields.student === 1 && fields.createdAt === -1);
  assert.ok(studentIndex, "TestHistory schema must index { student: 1, createdAt: -1 } for fast query response");
});
