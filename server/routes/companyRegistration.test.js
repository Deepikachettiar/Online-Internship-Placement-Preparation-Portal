
const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const authRoutes = require("./auth");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

test("company registration rejects missing required fields", async () => {
  const response = await request(app)
    .post("/api/auth/register/company")
    .send({});

  assert.equal(response.status, 400);
});

test("company registration rejects passwords shorter than eight characters", async () => {
  const response = await request(app)
    .post("/api/auth/register/company")
    .send({
      name: "Acme Admin",
      email: "admin@acme.example",
      password: "short",
      companyName: "Acme Corp",
      websiteDomain: "acme.example",
      contactDetails: "admin@acme.example",
    });

  assert.equal(response.status, 400);
});

test("company registration rejects personal email addresses", async () => {
  const response = await request(app)
    .post("/api/auth/register/company")
    .send({
      name: "Acme Admin",
      email: "admin@gmail.com",
      password: "strongpass123",
      companyName: "Acme Corp",
      websiteDomain: "acme.example",
      contactDetails: "admin@gmail.com",
    });

  assert.equal(response.status, 400);
});
