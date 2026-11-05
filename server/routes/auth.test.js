const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authRoutes = require("./auth");

process.env.JWT_SECRET = "test-auth-api-secret";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const originalFindOne = User.findOne;
const originalCreate = User.create;

test.afterEach(() => {
  User.findOne = originalFindOne;
  User.create = originalCreate;
});

test("TC-AUTH-01: student registration succeeds", async () => {
  User.findOne = async () => null;
  User.create = async (data) => ({
    ...data,
    _id: "student123",
  });

  const response = await request(app)
    .post("/api/auth/register/student")
    .send({
      name: "Test Student",
      email: "student@example.com",
      password: "strongpass123",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.role, "student");
  assert.equal(response.body.user.email, "student@example.com");
});

test("TC-AUTH-02: company registration succeeds", async () => {
  User.findOne = async () => null;
  User.create = async (data) => ({
    ...data,
    _id: "company123",
  });

  const response = await request(app)
    .post("/api/auth/register/company")
    .send({
      name: "Company Admin",
      email: "admin@acme.example",
      password: "strongpass123",
      companyName: "Acme Corp",
      websiteDomain: "acme.example",
      contactDetails: "admin@acme.example",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.user.role, "company");
  assert.equal(response.body.user.approvalStatus, "Pending Approval");
});

test("TC-AUTH-03: login succeeds with valid credentials", async () => {
  const hashedPassword = await bcrypt.hash("strongpass123", 10);

  User.findOne = async () => ({
    _id: "student123",
    name: "Test Student",
    email: "student@example.com",
    password: hashedPassword,
    role: "student",
  });

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "student@example.com",
      password: "strongpass123",
    });

  assert.equal(response.status, 200);
  assert.ok(response.body.token);

  const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
  assert.equal(decoded.role, "student");
});

test("TC-AUTH-04: login rejects incorrect credentials", async () => {
  User.findOne = async () => null;

  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "unknown@example.com",
      password: "wrongpassword",
    });

  assert.equal(response.status, 401);
});

