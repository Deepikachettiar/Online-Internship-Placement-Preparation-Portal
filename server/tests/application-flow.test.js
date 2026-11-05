const test = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = (process.env.API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const STUDENT_TOKEN = process.env.STUDENT_TOKEN || "";
const COMPANY_TOKEN = process.env.COMPANY_TOKEN || "";
const INTERNSHIP_ID = process.env.TEST_INTERNSHIP_ID || "";
const APPLICATION_ID = process.env.TEST_APPLICATION_ID || "";

const APPLICATIONS_PATH = process.env.APPLICATIONS_PATH || "/api/applications";
const STUDENT_APPLICATIONS_PATH = process.env.STUDENT_APPLICATIONS_PATH || "/api/applications/my";
const COMPANY_APPLICATIONS_PATH = process.env.COMPANY_APPLICATIONS_PATH || "/api/applications";
const STATUS_SUFFIX = process.env.STATUS_PATH_SUFFIX || "/status";

function headers(token) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(token),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  return { response, data };
}

const enabled = process.env.RUN_API_TESTS === "1";

test("protected student applications endpoint rejects unauthenticated requests", async (t) => {
  if (!enabled) return t.skip("Set RUN_API_TESTS=1 to run API integration tests.");
  const { response } = await api(STUDENT_APPLICATIONS_PATH);
  assert.ok([401, 403].includes(response.status), `Expected 401/403, got ${response.status}`);
});

test("student can submit an application", async (t) => {
  if (!enabled || !STUDENT_TOKEN || !INTERNSHIP_ID) {
    return t.skip("Requires RUN_API_TESTS=1, STUDENT_TOKEN and TEST_INTERNSHIP_ID.");
  }
  const { response, data } = await api(APPLICATIONS_PATH, {
    token: STUDENT_TOKEN, method: "POST", body: { internshipId: INTERNSHIP_ID },
  });
  assert.ok([200, 201].includes(response.status),
    `Expected 200/201, got ${response.status}: ${JSON.stringify(data)}`);
  const application = data?.application || data?.data || data;
  assert.ok(application?._id || application?.id, "Response should contain the created application ID.");
});

test("student can retrieve their applications", async (t) => {
  if (!enabled || !STUDENT_TOKEN) return t.skip("Requires RUN_API_TESTS=1 and STUDENT_TOKEN.");
  const { response, data } = await api(STUDENT_APPLICATIONS_PATH, { token: STUDENT_TOKEN });
  assert.equal(response.status, 200, `Expected 200, got ${response.status}`);
  const items = Array.isArray(data) ? data : data?.applications || data?.data;
  assert.ok(Array.isArray(items), "Expected an applications array.");
});

test("company can retrieve applications", async (t) => {
  if (!enabled || !COMPANY_TOKEN) return t.skip("Requires RUN_API_TESTS=1 and COMPANY_TOKEN.");
  const { response, data } = await api(COMPANY_APPLICATIONS_PATH, { token: COMPANY_TOKEN });
  assert.equal(response.status, 200, `Expected 200, got ${response.status}`);
  const items = Array.isArray(data) ? data : data?.applications || data?.data;
  assert.ok(Array.isArray(items), "Expected an applications array.");
});

test("invalid application ID is rejected for a status update", async (t) => {
  if (!enabled || !COMPANY_TOKEN) return t.skip("Requires RUN_API_TESTS=1 and COMPANY_TOKEN.");
  const { response } = await api(`${APPLICATIONS_PATH}/invalid-id${STATUS_SUFFIX}`, {
    token: COMPANY_TOKEN, method: "PATCH", body: { status: "Shortlisted" },
  });
  assert.ok([400, 404, 422].includes(response.status),
    `Expected 400/404/422, got ${response.status}`);
});

test("unsupported application status is rejected", async (t) => {
  if (!enabled || !COMPANY_TOKEN || !APPLICATION_ID) {
    return t.skip("Requires RUN_API_TESTS=1, COMPANY_TOKEN and TEST_APPLICATION_ID.");
  }
  const { response } = await api(`${APPLICATIONS_PATH}/${APPLICATION_ID}${STATUS_SUFFIX}`, {
    token: COMPANY_TOKEN, method: "PATCH", body: { status: "DefinitelyNotAValidStatus" },
  });
  assert.ok([400, 422].includes(response.status), `Expected 400/422, got ${response.status}`);
});
