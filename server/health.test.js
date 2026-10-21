
const test = require("node:test");
const assert = require("node:assert/strict");

test("health endpoint response has the expected status and message", () => {
  const response = {
    status: "ok",
    message: "Online Internship Portal API is healthy",
  };

  assert.equal(response.status, "ok");
  assert.equal(
    response.message,
    "Online Internship Portal API is healthy"
  );
});
