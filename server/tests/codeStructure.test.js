const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("OIP-NF-005: Codebase maintains modular architecture across models, routes, utils, and middleware", () => {
  const serverDir = path.resolve(__dirname, "..");
  const expectedDirs = ["models", "routes", "utils", "middleware"];

  for (const dir of expectedDirs) {
    const fullPath = path.join(serverDir, dir);
    assert.ok(fs.existsSync(fullPath), `Directory '${dir}' must exist for modular MVC structure`);
    assert.ok(fs.statSync(fullPath).isDirectory(), `'${dir}' must be a directory`);
  }
});

test("OIP-NF-005: All Mongoose models export valid models", () => {
  const models = [
    require("../models/User"),
    require("../models/Internship"),
    require("../models/Application"),
    require("../models/Notification"),
    require("../models/Question"),
    require("../models/AptitudeTest"),
    require("../models/TestHistory"),
  ];

  for (const model of models) {
    assert.ok(model.modelName, `Expected exported object to be a Mongoose model`);
    assert.ok(model.schema, `Expected model to possess a schema`);
  }
});

test("OIP-NF-005: All route files export an Express router", () => {
  const routes = [
    require("../routes/auth"),
    require("../routes/internships"),
    require("../routes/applications"),
    require("../routes/companies"),
    require("../routes/students"),
    require("../routes/skills"),
    require("../routes/notifications"),
    require("../routes/tests"),
    require("../routes/health"),
  ];

  for (const router of routes) {
    assert.equal(typeof router, "function", "Router must be an Express router function");
    assert.ok(router.stack || typeof router.use === "function", "Must possess router internals");
  }
});
