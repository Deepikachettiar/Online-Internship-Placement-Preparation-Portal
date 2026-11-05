const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const request = require("supertest");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Application = require("../models/Application");
const adminRoutes = require("./admin");

process.env.JWT_SECRET = "test-admin-secret";

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoutes);

const adminToken = jwt.sign(
  { id: "admin123", role: "admin" },
  process.env.JWT_SECRET
);

const studentToken = jwt.sign(
  { id: "student123", role: "student" },
  process.env.JWT_SECRET
);

const originalCountDocuments = User.countDocuments;
const originalFindOneAndUpdate = User.findOneAndUpdate;
const originalApplicationCount = Application.countDocuments;

test.afterEach(() => {
  User.countDocuments = originalCountDocuments;
  User.findOneAndUpdate = originalFindOneAndUpdate;
  Application.countDocuments = originalApplicationCount;
});

test("admin dashboard returns all four counts", async () => {
  User.countDocuments = async (query) =>
    query.role === "student"
      ? 10
      : query.companyApprovalStatus === "pending"
        ? 2
        : 5;

  Application.countDocuments = async () => 20;

  const response = await request(app)
    .get("/api/admin/dashboard")
    .set("Authorization", `Bearer ${adminToken}`);

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    students: 10,
    companies: 5,
    pendingApprovals: 2,
    applications: 20,
  });
});

test("admin can approve a company", async () => {
  User.findOneAndUpdate = () => ({
    select: async () => ({
      _id: "company123",
      role: "company",
      companyApproved: true,
      companyApprovalStatus: "approved",
    }),
  });

  const response = await request(app)
    .patch("/api/admin/companies/company123/approval")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ approved: true });

  assert.equal(response.status, 200);
  assert.equal(response.body.company.companyApproved, true);
  assert.equal(response.body.company.companyApprovalStatus, "approved");
});

test("admin can reject a company", async () => {
  User.findOneAndUpdate = () => ({
    select: async () => ({
      _id: "company123",
      role: "company",
      companyApproved: false,
      companyApprovalStatus: "rejected",
    }),
  });

  const response = await request(app)
    .patch("/api/admin/companies/company123/approval")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ approved: false });

  assert.equal(response.status, 200);
  assert.equal(response.body.company.companyApproved, false);
  assert.equal(response.body.company.companyApprovalStatus, "rejected");
});

test("admin can deactivate a user", async () => {
  User.findOneAndUpdate = () => ({
    select: async () => ({
      _id: "student123",
      isActive: false,
    }),
  });

  const response = await request(app)
    .patch("/api/admin/users/student123/status")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ isActive: false });

  assert.equal(response.status, 200);
  assert.equal(response.body.user.isActive, false);
});

test("non-admin users receive 403", async () => {
  const response = await request(app)
    .get("/api/admin/dashboard")
    .set("Authorization", `Bearer ${studentToken}`);

  assert.equal(response.status, 403);
});

test("unauthenticated users receive 401", async () => {
  const response = await request(app).get("/api/admin/dashboard");

  assert.equal(response.status, 401);
});