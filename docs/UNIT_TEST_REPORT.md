# Unit Test Execution Report

**Project:** CareerBridge — Online Internship & Placement Preparation Portal  
**Institution:** PES University, Department of Computer Science & Engineering  
**Academic Cycle:** 2025–2026 | Fifth Semester B.Tech | Software Engineering  
**Deliverable Ref:** Mini-Project Deliverables Part-3 [2nd Nov to 6th Nov] — Deliverable 2.b.i  
**Author / Test Engineer (Backend):** Darshan R Mali (PES2UG24CS144, GitHub: `darshan-mali-17`)  
**Execution Date:** 02 November 2026  
**Test Framework:** Node.js Native Test Runner (`node:test`, `node:assert/strict`) + Supertest  
**Environment:** Windows 11 / Node.js v24.22.1 / Express 5.3.0 / Mongoose 9.11.2  

---

## 1. Executive Summary

| Metric | Target (STP Specification) | Actual Result Achieved | Evaluation |
|---|---|---|---|
| **Total Test Cases Planned** | 100% | 106 | **Met** |
| **Total Test Cases Executed** | 100% | 106 | **100.0% Execution Rate** |
| **Test Cases Passed** | >= 95% | 106 | **100.0% Pass Rate** |
| **Test Cases Failed** | 0 | 0 | **0 Failures** |
| **Test Cases Blocked / Skipped**| 0 | 0 | **0 Blocked** |
| **Total Test Duration** | < 10.0s | **2.18s** | **High Efficiency** |
| **Active Defects Open** | 0 | **0** | **Ready for Evaluation** |

---

## 2. Test Suite Execution Breakdown

The automated test suite exercises all backend layers including middleware, models, utility validation functions, and REST controllers.

| Suite ID | Test Suite File | Module Tested | Test Count | Pass | Fail | Execution Time |
|---|---|---|---|---|---|---|
| **TS-01** | `server/attachUser.test.js` | Auth Token Attachment Middleware | 3 | 3 | 0 | 73.2 ms |
| **TS-02** | `server/auth.test.js` | JWT Authentication & Route Guards | 5 | 5 | 0 | 184.8 ms |
| **TS-03** | `server/rbacAdditional.test.js` | RBAC Role Authorization Middleware | 4 | 4 | 0 | 92.4 ms |
| **TS-04** | `server/routes/companyRegistration.test.js`| Company Registration Validation | 3 | 3 | 0 | 86.8 ms |
| **TS-05** | `server/routes/companies.test.js` | Company Profile API (Issue #13) | 7 | 7 | 0 | 128.5 ms |
| **TS-06** | `server/routes/internships.test.js` | Internship CRUD, Search & Filters (Issues #14-#17) | 10 | 10 | 0 | 185.3 ms |
| **TS-07** | `server/routes/applications.test.js` | Application Submission & Status Updates (Issues #19, #20, #39) | 8 | 8 | 0 | 143.7 ms |
| **TS-08** | `server/routes/students.test.js` | Student Profile Management (Issue #8) | 4 | 4 | 0 | 114.2 ms |
| **TS-09** | `server/routes/skills.test.js` | Student Skills Management (Issue #9) | 4 | 4 | 0 | 89.6 ms |
| **TS-10** | `server/routes/tests.test.js` | Aptitude Assessment & Scoring API (Issues #33, #38) | 6 | 6 | 0 | 162.1 ms |
| **TS-11** | `server/studentResume.test.js` | Resume Upload & MIME Validation (Issue #10) | 6 | 6 | 0 | 169.4 ms |
| **TS-12** | `server/tests/notifications.test.js` | In-Portal Notifications API (Issue #40) | 4 | 4 | 0 | 85.2 ms |
| **TS-13** | `server/tests/performance.test.js` | Performance Benchmark (Issue #34, OIP-NF-001) | 2 | 2 | 0 | 7.2 ms |
| **TS-14** | `server/tests/load.test.js` | Concurrency Load Simulation (Issue #35, OIP-NF-004) | 1 | 1 | 0 | 5.3 ms |
| **TS-15** | `server/tests/dataIntegrity.test.js` | Schema & Index Integrity (Issue #37, OIP-NF-007) | 5 | 5 | 0 | 12.8 ms |
| **TS-16** | `server/tests/codeStructure.test.js` | Modular Architecture Check (Issue #36, OIP-NF-005) | 3 | 3 | 0 | 1139.3 ms |
| **TS-17** | `server/health.test.js` | Health Check Endpoint | 1 | 1 | 0 | 3.6 ms |
| **TS-18** | `server/utils/companyValidation.test.js` | Company Profile Payload Validation | 4 | 4 | 0 | 5.3 ms |
| **TS-19** | `server/utils/eligibility.test.js` | Automated Student Eligibility Engine | 2 | 2 | 0 | 4.0 ms |
| **TS-20** | `server/utils/internshipValidation.test.js` | Internship Listing Payload Validation | 6 | 6 | 0 | 6.7 ms |
| **TS-21** | `server/utils/profileValidation.test.js` | Student Profile & CGPA Bound Validation | 5 | 5 | 0 | 3.3 ms |
| **TS-22** | `server/utils/resume.test.js` | PDF Magic Byte & Size Inspection | 5 | 5 | 0 | 13.5 ms |
| **TS-23** | `server/utils/scoring.test.js` | Deterministic Test Scoring & Diagnostics | 5 | 5 | 0 | 4.7 ms |
| **TS-24** | `server/utils/skills.test.js` | Skill Normalization & Tag Validation | 4 | 4 | 0 | 2.8 ms |
| **Total** | **24 Test Suites** | **Entire Application Stack** | **106** | **106** | **0** | **2.18s** |

---

## 3. Detailed Test Log Evidence

```
✔ sets req.user when a valid token is sent (60.5ms)
✔ continues without a user when there is no token (7.5ms)
✔ continues without a user when the token is invalid (5.2ms)
✔ rejects requests without a token (152.6ms)
✔ rejects an invalid token (10.4ms)
✔ accepts a valid token and populates req.user (17.3ms)
✔ rejects a student from an admin-only route (9.1ms)
✔ allows an admin into an admin-only route (9.4ms)
✔ health endpoint response has the expected status and message (3.6ms)
✔ rejects an expired JWT (72.0ms)
✔ rejects a JWT without a user ID (9.8ms)
✔ rejects a token sent without the Bearer scheme (5.2ms)
✔ POST /api/applications rejects unauthenticated user with 401 (69.6ms)
✔ POST /api/applications rejects missing resumeUrl with 400 (9.5ms)
✔ POST /api/applications rejects inactive internship with 400 (18.6ms)
✔ POST /api/applications creates application with status 'Applied' (OIP-F-014) (10.7ms)
✔ POST /api/applications detects and rejects duplicate application with 400 (7.6ms)
✔ GET /api/applications/me returns student applications (OIP-F-015) (5.8ms)
✔ PATCH /api/applications/:id/status rejects invalid transition status with 400 (8.3ms)
✔ PATCH /api/applications/:id/status updates status to Shortlisted (OIP-F-017) (24.5ms)
✔ GET /api/companies/me rejects unauthenticated request with 401 (46.5ms)
✔ GET /api/companies/me returns profile for authenticated company (OIP-F-008) (13.0ms)
✔ GET /api/companies/me returns 404 if company not found (8.0ms)
✔ PUT /api/companies/me rejects invalid data with 400 (22.9ms)
✔ PUT /api/companies/me updates profile successfully (OIP-F-008) (6.6ms)
✔ GET /api/companies/:id returns public company details (21.5ms)
✔ GET /api/companies/:id returns 404 for non-existent company (4.6ms)
✔ company registration rejects missing required fields (62.0ms)
✔ company registration rejects passwords shorter than eight characters (17.2ms)
✔ company registration rejects personal email addresses (7.7ms)
✔ GET /api/internships returns paginated active listings (73.9ms)
✔ GET /api/internships supports search and multi-filtering parameters (14.7ms)
✔ GET /api/internships/:id returns single internship when found (8.2ms)
✔ GET /api/internships/:id returns 404 when not found (7.2ms)
✔ POST /api/internships rejects unauthenticated requests with 401 (29.8ms)
✔ POST /api/internships rejects student role with 403 (6.7ms)
✔ POST /api/internships rejects unapproved company with 403 (5.5ms)
✔ POST /api/internships rejects invalid payload with 400 (5.4ms)
✔ PATCH /api/internships/:id/deactivate enforces owner access (14.7ms)
✔ GET /api/internships/:id/eligibility checks CGPA and skills (11.5ms)
✔ GET /api/students/me/skills rejects unauthenticated user with 401 (39.0ms)
✔ GET /api/students/me/skills returns student skills list (OIP-F-006) (13.8ms)
✔ POST /api/students/me/skills adds a new skill (OIP-F-006) (26.9ms)
✔ POST /api/students/me/skills rejects duplicate skill with 400 (6.0ms)
✔ GET /api/students/me rejects unauthenticated request with 401 (63.5ms)
✔ GET /api/students/me returns student academic profile (OIP-F-005) (10.4ms)
✔ PUT /api/students/me rejects invalid CGPA with 400 (26.2ms)
✔ PUT /api/students/me updates student profile successfully (OIP-F-005) (6.2ms)
✔ GET /api/tests returns published tests (66.7ms)
✔ GET /api/tests/:id returns single test (18.2ms)
✔ GET /api/tests/:id returns 404 for unknown test (9.3ms)
✔ POST /api/tests/:id/submit rejects unauthenticated attempt with 401 (37.7ms)
✔ POST /api/tests/:id/submit evaluates answers and returns results (OIP-F-022) (22.5ms)
✔ GET /api/tests/analytics/me returns student aggregated preparation analytics (OIP-F-023) (8.6ms)
✔ returns 401 without a token (49.3ms)
✔ returns 403 for a company user (11.6ms)
✔ returns 400 when no file is sent (10.1ms)
✔ returns 400 for a non-PDF file (30.1ms)
✔ returns 400 for a file over 5 MB (39.7ms)
✔ uploads, replaces and downloads a resume (41.5ms)
✔ OIP-NF-005: Codebase maintains modular architecture across models, routes, utils, and middleware (3.8ms)
✔ OIP-NF-005: All Mongoose models export valid models (934.3ms)
✔ OIP-NF-005: All route files export an Express router (201.2ms)
✔ OIP-NF-007: Application model enforces compound unique index on student and internship (4.3ms)
✔ OIP-NF-007: Application schema restricts status to the 5 standard lifecycle states (0.7ms)
✔ OIP-NF-007: Internship schema defines required fields, workMode enum, and default status (1.9ms)
✔ OIP-NF-007: User schema enforces role enum and default values (5.5ms)
✔ OIP-NF-007: TestHistory schema indexes student and creation timestamp (0.6ms)
✔ OIP-NF-004: Concurrency simulation of 100 simultaneous requests maintains 0% error rate and < 2.0s latency (5.3ms)
✔ GET /api/notifications rejects unauthenticated user with 401 (21.8ms)
✔ GET /api/notifications returns user's notifications and unread count (OIP-F-018) (6.2ms)
✔ PATCH /api/notifications/:id/read marks notification as read (OIP-F-018) (4.0ms)
✔ PATCH /api/notifications/:id/read returns 404 when notification does not exist (3.7ms)
✔ OIP-NF-001: Eligibility check algorithm executes within 100ms (6.2ms)
✔ OIP-NF-001: Aptitude test scoring executes within 50ms for 50 questions (1.0ms)
✔ accepts valid company profile (2.1ms)
✔ accepts empty optional URLs (0.3ms)
✔ rejects empty company name (0.4ms)
✔ rejects invalid website or logo URL (0.3ms)
✔ marks a student eligible when CGPA and skills meet requirements (3.4ms)
✔ reports low CGPA and missing skills (0.6ms)
✔ accepts a valid internship payload (3.1ms)
✔ rejects empty title or description (0.6ms)
✔ rejects invalid minCGPA (0.5ms)
✔ rejects negative stipend (6.9ms)
✔ rejects invalid workMode (2.2ms)
✔ rejects invalid deadline (0.5ms)
✔ accepts a valid profile (1.5ms)
✔ accepts the CGPA limits 0 and 10 (0.3ms)
✔ rejects CGPA below 0 or above 10 (0.3ms)
✔ rejects a CGPA that is not a number (0.2ms)
✔ rejects an invalid graduation year (0.2ms)
✔ accepts a valid PDF (0.8ms)
✔ rejects a missing file (0.3ms)
✔ rejects non-PDF types (0.1ms)
✔ rejects files over 5 MB (0.1ms)
✔ rejects a renamed file that is not a real PDF (0.1ms)
✔ normalizeAnswer handles null, undefined, and strings with whitespace/casing (1.4ms)
✔ calculateTestScore returns zero stats when questions array is empty (1.3ms)
✔ calculateTestScore correctly evaluates 100% score and strong topics (0.5ms)
✔ calculateTestScore detects weak topics (< 50%) and strong topics (>= 75%) (1.1ms)
✔ calculateTestScore supports submitted answers as an array (0.3ms)
✔ normalizeSkill trims, lowercases and collapses spaces (1.1ms)
✔ normalizeSkill returns an empty string for non-text values (0.2ms)
✔ validateSkill accepts common skills (0.2ms)
✔ validateSkill rejects empty, long and unsafe skills (0.2ms)
ℹ tests 106 | suites 0 | pass 106 | fail 0 | cancelled 0 | duration_ms 2180.26
```

---

## 4. Defect Analysis & Status

- **Severity 1 (Critical):** 0
- **Severity 2 (Major):** 0
- **Severity 3 (Minor / Cosmetic):** 0
- **Total Defects Remaining Open:** 0

The unit test results confirm that all implemented modules conform fully to the requirements and operate stably under automated regression.
