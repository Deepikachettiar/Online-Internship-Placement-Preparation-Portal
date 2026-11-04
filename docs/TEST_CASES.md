# Software Test Case Document (Updated Specification)

**Project:** CareerBridge — Online Internship & Placement Preparation Portal  
**Institution:** PES University, Department of Computer Science & Engineering  
**Course:** Software Engineering (Academic Year 2025–2026, Fifth Semester B.Tech)  
**Deliverable:** Mini-Project Deliverables Part-3 (Test Cases Updation)  
**Author / Responsible Engineer:** Darshan R Mali (USN: PES2UG24CS144, GitHub: `darshan-mali-17`)  
**Team 4 Members:**  
- Deepika K (PES2UG24CS148) — Team Lead & Architect (`Deepikachettiar`)  
- Gunavathi M (PES2UG24CS172) — Frontend & UI/UX Lead (`Guna-meda`)  
- Darshan R Mali (PES2UG24CS144) — Backend & Database Architect (`darshan-mali-17`)  
- Dhanush Rao (PES2UG24CS153) — Full-Stack & QA/DevOps Lead (`dhanushrao-max`)  

**Document Version:** 2.0 (Post-Sprint Implementation Baseline)  
**Date:** 02 November 2026  

---

## 1. Document Overview & Sprint Updation Rationale

In accordance with **Mini-Project Deliverables Part-3 (Item 1)**, this document provides the formal update to the test cases originally outlined in the Software Test Plan (STP Specification v1.0) and Software Requirements Specification (SRS v1.0). 

During the development sprints (Sprint 1, Sprint 2, and Sprint 3), several architectural refinements and scope consolidations were implemented (documented in `docs/DEVIATIONS.md`):
1. **Test Case ID Standardization:** Replaced legacy STP IDs (`TC-LIST-01`, `TC-DASH-01`, etc.) with the standardized SRS Section 6.3 Test Case IDs (`TC-AUTH-*`, `TC-PROF-*`, `TC-COMP-*`, `TC-INT-*`, `TC-SRCH-*`, `TC-APP-*`, `TC-TEST-*`, `TC-NOTIF-*`, `TC-AN-*`, `TC-ADMIN-*`, `TC-PERF-*`, `TC-LOAD-*`, `TC-SEC-*`).
2. **Unified Node.js/Express Backend Architecture:** Eliminated external Python microservice dependencies for scoring and analytics; all scoring, readiness metrics, and diagnostics are implemented natively in Node.js/Express with MongoDB.
3. **In-Portal Alert Delivery:** Substituted external Twilio/SMTP SMS/email infrastructure with native in-portal notification streams (`/api/notifications`) and badge counters.
4. **Enhanced 5-State Application Lifecycle:** Application transitions adhere strictly to `Applied` -> `Under Review` -> `Shortlisted` -> `Rejected` / `Selected`.
5. **Strict File Security:** Resume handling enforces MIME inspection, magic byte verification (`%PDF-`), and a strict 5 MB ceiling via Multer middleware.
6. **Compound Key Data Integrity:** Implemented unique indexing on `(student, internship)` to natively prevent duplicate applications with HTTP 400.

---

## 2. Updated Functional Test Cases Matrix

| Test Case ID | Target Feature / Module | SRS Req Ref | Preconditions / Setup | Test Steps / Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| **TC-AUTH-01** | Student Registration | OIP-F-001 | Database online; unique institutional email | POST `/api/auth/register` with valid student payload (email, roll number, password >= 8 chars) | HTTP 201 Created; student record persisted with role `student` | Record created with role `student` | **PASS** |
| **TC-AUTH-02** | Company Registration | OIP-F-002 | Database online; corporate domain | POST `/api/auth/register/company` with corporate email and company profile metadata | HTTP 201 Created; company created with `companyApproved: false` | Record saved with `companyApproved: false` | **PASS** |
| **TC-AUTH-03** | User Authentication | OIP-F-003 | Registered user in database | POST `/api/auth/login` with correct password, then with incorrect password | Valid credentials return HTTP 200 + signed JWT; invalid credentials return HTTP 401 | JWT issued on valid login; HTTP 401 on invalid | **PASS** |
| **TC-AUTH-04** | User Logout | OIP-F-004 | Authenticated session | Invoke `logout()` client helper; clear token from localStorage; make subsequent protected API call | Subsequent protected API calls return HTTP 401 Unauthorized | Token invalidated; protected calls return HTTP 401 | **PASS** |
| **TC-PROF-01** | Student Academic Profile | OIP-F-005 | Logged in as student | PUT `/api/students/me` with department, graduation year, CGPA = 8.5; Test boundary CGPA = 11.0 | CGPA = 8.5 returns HTTP 200; CGPA > 10.0 returns HTTP 400 Bad Request | Valid updates saved; out-of-range CGPA rejected with HTTP 400 | **PASS** |
| **TC-PROF-02** | Student Skills Inventory | OIP-F-006 | Logged in as student | POST `/api/students/me/skills` with skill `"React"`; submit duplicate `"react"` | Skill normalized to lowercase `"react"`; duplicate rejected with HTTP 400 | Normalized skill saved; duplicate rejected with HTTP 400 | **PASS** |
| **TC-PROF-03** | Resume Upload & Inspection | OIP-F-007 | Logged in as student | POST `/api/students/me/resume` with valid PDF <= 5MB; attempt non-PDF and file > 5MB | Valid PDF stored under `server/uploads/resumes`; non-PDF/oversized rejected with HTTP 400 | Valid PDF saved; invalid MIME/size rejected with HTTP 400 | **PASS** |
| **TC-COMP-01** | Company Profile Management | OIP-F-008 | Logged in as company recruiter | PUT `/api/companies/me` with company description, location, industry, website URL | Profile details saved to MongoDB; public listing reflects updated company details | Profile updated and verified via `/api/companies/:id` | **PASS** |
| **TC-INT-01** | Internship Posting Creation | OIP-F-009 | Company verified (`companyApproved: true`) | POST `/api/internships` with title, description, stipend, minCGPA, deadline | HTTP 201 Created; listing saved with status `Active` and `isPublished: true` | Listing created with `Active` status | **PASS** |
| **TC-INT-02** | Internship Deactivation & Edit | OIP-F-010 | Active internship owned by company | PATCH `/api/internships/:id/deactivate`; verify from non-owner account | Owner returns HTTP 200 and status `Inactive`; unauthorized company returns HTTP 403 | Status changed to `Inactive`; non-owner blocked with HTTP 403 | **PASS** |
| **TC-INT-03** | Browse Internships (Pagination) | OIP-F-011 | Seeded active internships | GET `/api/internships?page=1&limit=10` | HTTP 200 with paginated array, total count, page counter, and totalPages | Returns paginated list sorted newest first | **PASS** |
| **TC-SRCH-01** | Search & Multi-criteria Filter | OIP-F-012 | Seeded internships with diverse tags | GET `/api/internships?search=React&skill=react&location=Bengaluru&workMode=Hybrid&minStipend=20000` | Results matching all filter parameters returned within 1.5 seconds | Exact filtered subset returned in < 25ms | **PASS** |
| **TC-APP-01** | Eligibility Check | OIP-F-013 | Student profile with CGPA and skills | GET `/api/internships/:id/eligibility`; test with eligible student vs ineligible CGPA | Eligible student receives `eligible: true`; ineligible student receives breakdown of missing criteria | Correct eligibility status and missing skills returned | **PASS** |
| **TC-APP-02** | Application Submission & Duplication | OIP-F-014 | Student with uploaded resume | POST `/api/applications` with internship ID; immediately re-submit same application | First submission succeeds (status `Applied`); second attempt rejected with HTTP 400 | First application saved; duplicate rejected with HTTP 400 | **PASS** |
| **TC-APP-03** | Student Application Tracking | OIP-F-015 | Student with submitted applications | GET `/api/applications/me` | HTTP 200 returning submitted applications with current status badges | List returned chronologically with status badges | **PASS** |
| **TC-APP-04** | Company Applicant Review | OIP-F-016 | Company owner of internship | GET `/api/internships/:id/applications`; access applicant resume | Recruiter accesses candidate dossier and authorized resume; non-owner blocked with HTTP 403 | Applicant list and resume accessible; 403 on non-owner | **PASS** |
| **TC-APP-05** | Application Status Transition | OIP-F-017 | Existing applicant record | PATCH `/api/applications/:id/status` with `status: "Shortlisted"`, decision note | Status updated in DB; in-portal notification created for candidate | Status transitioned to `Shortlisted`; notification dispatched | **PASS** |
| **TC-NOTIF-01**| In-Portal Notification Stream | OIP-F-018 | Triggered status update / alert | GET `/api/notifications`; PATCH `/api/notifications/:id/read` | Returns notifications with unread counter; patch marks as read and decrements unread count | Notifications listed; unread count decrements on read | **PASS** |
| **TC-TEST-01** | Aptitude Question Bank | OIP-F-019 | Admin authenticated session | GET/POST `/api/questions` across Quant, Logical, and Verbal categories | Question records stored with stem, options, correct answer, and explanation | Question records verified in database | **PASS** |
| **TC-TEST-02** | Aptitude Test Configuration | OIP-F-020 | Admin authenticated session | Configure test with title, duration, and question associations; publish test | Test document saved with status `published` and `isPublished: true` | Test listed under `/api/tests` for students | **PASS** |
| **TC-TEST-03** | Timed Test Engine & Countdown | OIP-F-021 | Active published test | Client timer synchronized with test start; submit test on timeout | Client locks input on expiry; test payload automatically dispatched to server | Automatic submission handled cleanly | **PASS** |
| **TC-TEST-04** | Auto-Scoring & Test History | OIP-F-022 | Student answers submitted | POST `/api/tests/:id/submit` with answers object | Instant deterministic score calculation, percentage, answer explanations; saved to TestHistory | Score returned with explanations; record saved to TestHistory | **PASS** |
| **TC-AN-01**   | Preparation Analytics & Diagnostics | OIP-F-023 | Completed test history in DB | GET `/api/tests/analytics/me` | Category-wise accuracy breakdown; classifies topics with accuracy >= 75% as Strong, < 50% as Weak | Accurate category breakdown, strong & weak topic categorization | **PASS** |
| **TC-ADMIN-01**| Admin Account Governance | OIP-F-024 | Admin authenticated session | PATCH `/api/admin/companies/:id/approve` | Company verification status toggled; enables internship posting permissions | Approval toggled; allows verified company posting | **PASS** |

---

## 3. Updated Non-Functional & Security Test Cases Matrix

| Test Case ID | Quality Category | Requirement Ref | Test Target & Method | Acceptance Criteria | Execution Result | Status |
|---|---|---|---|---|---|---|
| **TC-PERF-01** | Performance | OIP-NF-001 | Benchmark search/filter and eligibility endpoints under 1,000 simulated iterations | 95th percentile response time <= 1.5s; eligibility check < 100ms | Search filtered in < 25ms; 1,000 eligibility checks in 6.2ms | **PASS** |
| **TC-REL-01**  | Reliability & Backup | OIP-NF-002 | Automated health check endpoint GET `/api/health` and database backup script | Uptime check returns 200 OK with server timestamp; backup script executes | `/api/health` returns status `ok`; mongodump operational | **PASS** |
| **TC-UX-01**   | Usability | OIP-NF-003 | First-time student flow: registration, profile completion, browse, and application | End-to-end task completed in under 3 minutes with clear UI validation | Streamlined form controls and 1-click apply finish in ~1.8 mins | **PASS** |
| **TC-PERF-02** | Scalability / Load | OIP-NF-004 | Simulated burst of 100 concurrent test submissions and eligibility evaluations | Error rate < 1.0%; average latency < 2.0s | 0.0% error rate across 100 concurrent requests; latency ~5.2ms | **PASS** |
| **TC-CODE-01** | Maintainability | OIP-NF-005 | Static code analysis, ESLint audit, and modular architecture check | Zero ESLint syntax errors; strict separation of routes, models, and utils | 0 ESLint errors; all models and routers pass validation | **PASS** |
| **TC-UX-02**   | Accessibility | OIP-NF-006 | Automated axe-core / WCAG 2.1 AA audit on all main pages | Zero critical or serious accessibility violations; color contrast >= 4.5:1 | Verified semantic tags, aria attributes, contrast compliant | **PASS** |
| **TC-APP-02B** | Data Integrity | OIP-NF-007 | Enforce Mongoose compound unique index on `{ student: 1, internship: 1 }` | Prevents duplicate applications at database layer with code 11000 | Compound unique index active; duplicate rejected with HTTP 400 | **PASS** |
| **TC-UX-03**   | Cross-Browser Portability | OIP-NF-008 | Cross-browser rendering on Chromium, Firefox, WebKit, and mobile viewport (360px) | Layout responsive without horizontal scrolling or broken flex layouts | Responsive CSS grid and flexbox render cleanly across viewports | **PASS** |
| **TC-SEC-01**  | Cryptography | OIP-SR-001 | Inspect stored password hashes in User collection | Passwords hashed using bcrypt with salt rounds >= 10; zero plaintext passwords | Bcrypt work factor 10 confirmed; zero plaintext credentials | **PASS** |
| **TC-SEC-02**  | RBAC Middleware | OIP-SR-002 | Student account attempts access to admin and company endpoints | HTTP 403 Forbidden returned on unauthorized role access | Role authorization rejects invalid roles with HTTP 403 | **PASS** |
| **TC-SEC-03**  | JWT Session Security | OIP-SR-003 | Send expired token, malformed signature, or non-Bearer token to protected route | HTTP 401 Unauthorized returned; token lifetime limited to 4 hours | Expired and tampered tokens rejected with HTTP 401 | **PASS** |
| **TC-SEC-04**  | Transport Security | OIP-SR-004 | Enforce TLS 1.2+ configuration in deployment and environment | Unencrypted HTTP traffic redirected to HTTPS; secure cookie attributes | HTTPS configuration verified | **PASS** |
| **TC-SEC-05**  | Input Sanitization | OIP-SR-005 | Inject XSS payloads (`<script>`, `onerror=`) and MongoDB query operators (`$gt`) | Payloads sanitized; inputs escaped via React JSX; queries strongly typed | Script tags escaped; NoSQL injection prevented | **PASS** |
| **TC-SEC-06**  | Secure Document Access | OIP-SR-006 | Direct URL access attempt to candidate PDF resumes by unauthorized third parties | HTTP 403 Forbidden returned; access restricted to owner student and hiring company | Anti-IDOR check validates ownership before serving file | **PASS** |

---

## 4. Test Updation Summary & Traceability

All 24 Functional Requirements, 8 Non-Functional Requirements, and 6 Security Requirements are mapped directly to updated test specifications. The test suite has been fully automated and validated in the codebase with **106 passing unit and integration tests** and **0 defects open**.
