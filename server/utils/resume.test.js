const test = require("node:test");
const assert = require("node:assert/strict");
const { MAX_RESUME_SIZE, validateResumeFile } = require("./resume");

const pdf = Buffer.from("%PDF-1.4 test");

test("accepts a valid PDF", () => {
  const file = { originalname: "cv.pdf", mimetype: "application/pdf", size: 100, buffer: pdf };
  assert.equal(validateResumeFile(file), null);
});

test("rejects a missing file", () => {
  assert.match(validateResumeFile(undefined), /choose a PDF/);
});

test("rejects non-PDF types", () => {
  const file = { originalname: "cv.docx", mimetype: "application/msword", size: 100, buffer: pdf };
  assert.match(validateResumeFile(file), /Only PDF/);
});

test("rejects files over 5 MB", () => {
  const file = { originalname: "cv.pdf", mimetype: "application/pdf", size: MAX_RESUME_SIZE + 1, buffer: pdf };
  assert.match(validateResumeFile(file), /5 MB/);
});

test("rejects a renamed file that is not a real PDF", () => {
  const file = { originalname: "cv.pdf", mimetype: "application/pdf", size: 10, buffer: Buffer.from("hello world") };
  assert.match(validateResumeFile(file), /not a valid PDF/);
});
