# Backlog

Project board: https://github.com/users/Guna-meda/projects/1

44 issues, 111 story points (Sprint 1: 23 issues, 54 pts. Sprint 2: 21 issues, 57 pts).
Source: SRS FRs OIP-F-001..024 and NFRs OIP-NF-001..008, plus setup, test and docs issues.

## Sprint 1 (19-23 Oct 2026)

| Issue | Title | Owner | Pts |
|---|---|---|---|
| #1 | [SETUP] Repo scaffold (client, server, env example) | dhanushrao-max | 3 |
| #2 | [SETUP] GitHub Actions CI (install, lint, build, test) | dhanushrao-max | 2 |
| #3 | [OIP-F-001] Student registration | dhanushrao-max | 2 |
| #4 | [OIP-F-002] Company registration | dhanushrao-max | 2 |
| #5 | [OIP-F-003] Login with JWT | dhanushrao-max | 3 |
| #6 | [SETUP] RBAC and auth middleware | dhanushrao-max | 2 |
| #7 | [OIP-F-004] Logout | Guna-meda | 1 |
| #8 | [OIP-F-005] Student academic profile | Guna-meda | 3 |
| #9 | [OIP-F-006] Student skills | Guna-meda | 2 |
| #10 | [OIP-F-007] Resume upload (PDF, max 5 MB) | Guna-meda | 3 |
| #11 | [SETUP] Student dashboard shell and navigation | Guna-meda | 3 |
| #12 | [DOCS] Finalise README setup steps after scaffold is merged | Guna-meda | 1 |
| #13 | [OIP-F-008] Company profile | darshan-mali-17 | 2 |
| #14 | [OIP-F-009] Post an internship | darshan-mali-17 | 3 |
| #15 | [OIP-F-010] Edit and deactivate internship | darshan-mali-17 | 2 |
| #16 | [OIP-F-011] Browse internships (paginated) | darshan-mali-17 | 3 |
| #17 | [OIP-F-012] Search and filter internships | darshan-mali-17 | 3 |
| #18 | [OIP-F-013] Eligibility check | Deepikachettiar | 3 |
| #19 | [OIP-F-014] Apply to internship (no duplicates) | Deepikachettiar | 3 |
| #20 | [OIP-F-015] Student application tracking | Deepikachettiar | 2 |
| #21 | [OIP-F-016] Company applicant list and resume access | Deepikachettiar | 3 |
| #22 | [SETUP] Seed script (users, internships, questions, one published test) | Deepikachettiar | 2 |
| #23 | [DOCS] Record and upload Sprint 1 demo video | Deepikachettiar | 1 |

## Sprint 2 (26-30 Oct 2026)

| Issue | Title | Owner | Pts |
|---|---|---|---|
| #24 | [OIP-F-019] Admin question bank | dhanushrao-max | 3 |
| #25 | [OIP-F-020] Admin test configuration and publishing | dhanushrao-max | 3 |
| #26 | [OIP-F-024] Admin dashboard and approvals | dhanushrao-max | 3 |
| #27 | [TEST] Auth and RBAC API tests | dhanushrao-max | 3 |
| #28 | [OIP-NF-002] Backup script and health check | dhanushrao-max | 2 |
| #29 | [OIP-F-021] Aptitude test taking with timer | Guna-meda | 5 |
| #30 | [OIP-F-023] Student preparation analytics | Guna-meda | 3 |
| #31 | [OIP-NF-006] Accessibility check | Guna-meda | 3 |
| #32 | [DOCS] Final docs, Sprint 2 demo video and README pass | Guna-meda | 2 |
| #33 | [OIP-F-022] Auto scoring, results and test history | darshan-mali-17 | 3 |
| #34 | [OIP-NF-001] Response time check | darshan-mali-17 | 2 |
| #35 | [OIP-NF-004] Basic load check | darshan-mali-17 | 3 |
| #36 | [OIP-NF-005] Code structure and lint review | darshan-mali-17 | 2 |
| #37 | [OIP-NF-007] Data integrity checks | darshan-mali-17 | 2 |
| #38 | [TEST] Internship and search API tests | darshan-mali-17 | 3 |
| #39 | [OIP-F-017] Update application status | Deepikachettiar | 3 |
| #40 | [OIP-F-018] In-portal notifications | Deepikachettiar | 3 |
| #41 | [OIP-NF-003] Usability check | Deepikachettiar | 2 |
| #42 | [OIP-NF-008] Browser and mobile check | Deepikachettiar | 2 |
| #43 | [TEST] Application flow tests | Deepikachettiar | 3 |
| #44 | [DOCS] Test summary report | Deepikachettiar | 2 |

## Sprint 3 (2-6 Nov 2026) — Parallel Activity & Deliverables Part-3 Status

| Issue | Title | Owner | Pts | Status | Evidence / Verification |
|---|---|---|---|---|---|
| #13 | [OIP-F-008] Company profile | darshan-mali-17 | 2 | Done | `routes/companies.js`, `routes/companies.test.js` |
| #14 | [OIP-F-009] Post an internship | darshan-mali-17 | 3 | Done | `routes/internships.js`, `utils/internshipValidation.js` |
| #15 | [OIP-F-010] Edit and deactivate internship | darshan-mali-17 | 2 | Done | `routes/internships.js`, `routes/internships.test.js` |
| #16 | [OIP-F-011] Browse internships (paginated) | darshan-mali-17 | 3 | Done | `routes/internships.js`, `routes/internships.test.js` |
| #17 | [OIP-F-012] Search and filter internships | darshan-mali-17 | 3 | Done | `routes/internships.js`, `routes/internships.test.js` |
| #33 | [OIP-F-022] Auto scoring, results and test history | darshan-mali-17 | 3 | Done | `utils/scoring.js`, `models/TestHistory.js`, `routes/tests.js` |
| #34 | [OIP-NF-001] Response time check | darshan-mali-17 | 2 | Done | `tests/performance.test.js` (< 1.5s SLA) |
| #35 | [OIP-NF-004] Basic load check | darshan-mali-17 | 3 | Done | `tests/load.test.js` (100 concurrent requests, 0% errors) |
| #36 | [OIP-NF-005] Code structure and lint review | darshan-mali-17 | 2 | Done | `tests/codeStructure.test.js` (Modular MVC, 0 lint errors) |
| #37 | [OIP-NF-007] Data integrity checks | darshan-mali-17 | 2 | Done | `tests/dataIntegrity.test.js` (Compound unique index) |
| #38 | [TEST] Internship and search API tests | darshan-mali-17 | 3 | Done | `routes/internships.test.js` (10/10 tests passing) |
| — | [DELIV] Updated Test Cases Document | darshan-mali-17 | — | Done | `docs/TEST_CASES.md` |
| — | [DELIV] Unit Test Report | darshan-mali-17 | — | Done | `docs/UNIT_TEST_REPORT.md` (106 tests passing) |
| — | [DELIV] System Validation Report | darshan-mali-17 | — | Done | `docs/SYSTEM_VALIDATION_REPORT.md` (24 FRs, 8 NFRs, 6 SRs) |
| — | [DELIV] Code Coverage Report | darshan-mali-17 | — | Done | `docs/CODE_COVERAGE_REPORT.md` (76.69% Lines, 96.2% Utils) |
| — | [DELIV] Branch Coverage Report | darshan-mali-17 | — | Done | `docs/BRANCH_COVERAGE_REPORT.md` (75.91% Branches, 94.1% Auth) |

