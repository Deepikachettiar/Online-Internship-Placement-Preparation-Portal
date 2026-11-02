const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-for-resume-upload";
process.env.RESUME_UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "resumes-"));

const User = require("./models/User");
User.findByIdAndUpdate = async () => ({}); // no database needed for these tests

const studentResumeRoutes = require("./routes/studentResume");

const app = express();
app.use("/api/students/me/resume", studentResumeRoutes);

const userId = "64b7f0c2a1b2c3d4e5f60718";
const studentToken = jwt.sign({ id: userId, role: "student" }, process.env.JWT_SECRET);
const companyToken = jwt.sign({ id: userId, role: "company" }, process.env.JWT_SECRET);
const url = "/api/students/me/resume";
const pdf = Buffer.from("%PDF-1.4 sample resume");

test.after(() => {
  fs.rmSync(process.env.RESUME_UPLOAD_DIR, { recursive: true, force: true });
});

test("returns 401 without a token", async () => {
  const res = await request(app).post(url);
  assert.equal(res.status, 401);
});

test("returns 403 for a company user", async () => {
  const res = await request(app).post(url).set("Authorization", `Bearer ${companyToken}`);
  assert.equal(res.status, 403);
});

test("returns 400 when no file is sent", async () => {
  const res = await request(app).post(url).set("Authorization", `Bearer ${studentToken}`);
  assert.equal(res.status, 400);
});

test("returns 400 for a non-PDF file", async () => {
  const res = await request(app)
    .post(url)
    .set("Authorization", `Bearer ${studentToken}`)
    .attach("resume", Buffer.from("plain text"), { filename: "cv.txt", contentType: "text/plain" });
  assert.equal(res.status, 400);
});

test("returns 400 for a file over 5 MB", async () => {
  const big = Buffer.concat([pdf, Buffer.alloc(5 * 1024 * 1024)]);
  const res = await request(app)
    .post(url)
    .set("Authorization", `Bearer ${studentToken}`)
    .attach("resume", big, { filename: "cv.pdf", contentType: "application/pdf" });
  assert.equal(res.status, 400);
  assert.match(res.body.message, /5 MB/);
});

test("uploads, replaces and downloads a resume", async () => {
  const first = await request(app)
    .post(url)
    .set("Authorization", `Bearer ${studentToken}`)
    .attach("resume", pdf, { filename: "cv.pdf", contentType: "application/pdf" });
  assert.equal(first.status, 200);
  assert.equal(first.body.message, "Resume uploaded.");

  const second = await request(app)
    .post(url)
    .set("Authorization", `Bearer ${studentToken}`)
    .attach("resume", pdf, { filename: "cv2.pdf", contentType: "application/pdf" });
  assert.equal(second.status, 200);
  assert.equal(second.body.message, "Resume replaced.");

  const download = await request(app).get(url).set("Authorization", `Bearer ${studentToken}`);
  assert.equal(download.status, 200);
  assert.equal(download.headers["content-type"], "application/pdf");
});
