const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-jwt-companies-api";

const User = require("../models/User");
const companyRoutes = require("./companies");
const { attachUser } = require("../middleware/auth");

const app = express();
app.use(express.json());
app.use(attachUser);
app.use("/api/companies", companyRoutes);

const companyId = "64b7f0c2a1b2c3d4e5f60780";
const companyToken = jwt.sign(
  { _id: companyId, id: companyId, role: "company" },
  process.env.JWT_SECRET
);

const sampleCompany = {
  _id: companyId,
  name: "Recruiter One",
  email: "recruiter@techcorp.example",
  companyName: "TechCorp Global",
  companyDescription: "Leading enterprise tech firm.",
  location: "Bengaluru",
  industry: "Information Technology",
  website: "https://techcorp.example",
  companyApproved: true,
  save: async function () { return this; },
};

test("GET /api/companies/me rejects unauthenticated request with 401", async () => {
  const res = await request(app).get("/api/companies/me");
  assert.equal(res.status, 401);
});

test("GET /api/companies/me returns profile for authenticated company (OIP-F-008)", async () => {
  User.findById = () => ({
    select: async () => sampleCompany,
  });

  const res = await request(app)
    .get("/api/companies/me")
    .set("Authorization", `Bearer ${companyToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.companyName, "TechCorp Global");
});

test("GET /api/companies/me returns 404 if company not found", async () => {
  User.findById = () => ({
    select: async () => null,
  });

  const res = await request(app)
    .get("/api/companies/me")
    .set("Authorization", `Bearer ${companyToken}`);

  assert.equal(res.status, 404);
});

test("PUT /api/companies/me rejects invalid data with 400", async () => {
  const res = await request(app)
    .put("/api/companies/me")
    .set("Authorization", `Bearer ${companyToken}`)
    .send({
      companyName: "", // missing required companyName
    });

  assert.equal(res.status, 400);
});

test("PUT /api/companies/me updates profile successfully (OIP-F-008)", async () => {
  User.findByIdAndUpdate = () => ({
    select: async () => sampleCompany,
  });

  const res = await request(app)
    .put("/api/companies/me")
    .set("Authorization", `Bearer ${companyToken}`)
    .send({
      companyName: "TechCorp Global",
      location: "Bengaluru, India",
      industry: "Software",
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.companyName, "TechCorp Global");
});

test("GET /api/companies/:id returns public company details", async () => {
  User.findOne = () => ({
    select: async () => sampleCompany,
  });

  const res = await request(app).get(`/api/companies/${companyId}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.company.companyName, "TechCorp Global");
});

test("GET /api/companies/:id returns 404 for non-existent company", async () => {
  User.findOne = () => ({
    select: async () => null,
  });

  const res = await request(app).get("/api/companies/unknown_id");
  assert.equal(res.status, 404);
});
