const test = require("node:test");
const assert = require("node:assert/strict");
const { validateProfile } = require("./profileValidation");

test("accepts a valid profile", () => {
  assert.equal(
    validateProfile({ department: "CSE", graduationYear: 2027, cgpa: 8.5 }),
    null
  );
});

test("accepts the CGPA limits 0 and 10", () => {
  assert.equal(validateProfile({ cgpa: 0 }), null);
  assert.equal(validateProfile({ cgpa: 10 }), null);
});

test("rejects CGPA below 0 or above 10", () => {
  assert.ok(validateProfile({ cgpa: -0.1 }));
  assert.ok(validateProfile({ cgpa: 10.01 }));
});

test("rejects a CGPA that is not a number", () => {
  assert.ok(validateProfile({ cgpa: "abc" }));
  assert.ok(validateProfile({ cgpa: "" }));
});

test("rejects an invalid graduation year", () => {
  assert.ok(validateProfile({ graduationYear: "soon" }));
  assert.ok(validateProfile({ graduationYear: 1800 }));
});
