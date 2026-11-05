# Progress Log

## 2026-10-21
- Read the SRS, SAD, STP and the Part-2 deliverables and listed the mismatches (docs/DEVIATIONS.md).
- Created labels and milestones (Sprint 1 due 23 Oct, Sprint 2 due 30 Oct).
- Created the GitHub Project "Internship Portal - Team 4" with Story Points and Sprint fields.
- Created 44 issues (23 in Sprint 1 = 54 pts, 21 in Sprint 2 = 57 pts), assigned them and added them to the project.
- Wrote docs/BACKLOG.md and docs/SPRINT_PLAN.md.
- Note: the project belongs to Guna-meda, so GitHub does not let us link it to the repo (the repo is owned by Deepikachettiar). The board is shared by link instead.

## 2026-10-21 (README setup steps)
- Finalised the README setup steps after the scaffold was merged: prerequisites, folder structure, server and client setup, env variables and commands (issue #12).
- Seed script and CI are not merged yet, so the README notes they will be added later.

## 2026-10-22 (logout)
- Added logout for issue #7: token helpers (client/src/utils/auth.js) and a Logout button that clears the saved token and goes to /login. The button shows in the nav only when a token exists.
- The "protected calls return 401 after logout" check depends on the auth middleware from the login and RBAC issues.

## 2026-10-22 (student profile)
- Added the student academic profile for issue #8: GET and PUT /api/students/me, CGPA and graduation year validation (CGPA outside 0 to 10 returns 400), department, graduation year and CGPA fields on the User model, and a profile page (client/src/pages/StudentProfile.jsx).
- Routes use req.user from the auth middleware, same as the profile routes. The page is not linked in the app yet because routing comes with the login issue and the dashboard shell issue.

## 2026-10-22 (company profile)
- Added company profile management for issue #13: GET and PUT /api/companies/me, GET /api/companies/:id for company details, companyDescription, logoUrl, location, industry, and website fields on the User model.
- Added company profile validation (utils/companyValidation.js) with test suite.
- Added company profile page (client/src/pages/CompanyProfile.jsx) and InternshipCard component with company information display.

## 2026-10-22 (post an internship)
- Added internship posting for issue #14: POST /api/internships, guarded by company role and approval check (unapproved company receives HTTP 403). New postings are saved as Active and visible to students.
- Enhanced Internship model with stipend, duration, workMode, deadline, and compound text index.
- Added payload validation (utils/internshipValidation.js) with comprehensive unit tests.
- Added company listings route (GET /api/internships/company/me) and single listing route (GET /api/internships/:id).
- Built PostInternship page (client/src/pages/PostInternship.jsx) with full listing configuration form.

## 2026-10-22 (edit and deactivate internship)
- Added editing and deactivation for issue #15: PUT /api/internships/:id (owner only check with payload validation) and PATCH /api/internships/:id/deactivate (sets status to Inactive).
- Enforced that deactivated/inactive internships reject new student applications (applications.js) while existing applications remain visible.
- Built CompanyInternships management table (client/src/pages/CompanyInternships.jsx) with inline edit and deactivate actions.

## 2026-10-22 (browse internships)
- Added paginated browsing for issue #16: GET /api/internships with page and limit query params, filtering only Active listings from approved companies, sorted newest first.
- Built BrowseInternships page (client/src/pages/BrowseInternships.jsx) with card list and pagination controls (Previous/Next, page counters).

## 2026-10-22 (search and filter internships)
- Added search and multi-criteria filtering for issue #17: GET /api/internships supports search/q keyword, skill, location, workMode, and minStipend parameters.
- Empty query returns all active roles; indexes on title, location, and requiredSkills ensure fast response times (< 1.5s).
- Added interactive search bar and filter controls to BrowseInternships.jsx with filter clearing and pagination synchronization.

## 2026-10-23 (student skills)
- Added student skills for issue #9: GET, POST, PUT and DELETE on /api/students/me/skills. Skills are trimmed, lowercased and stored as an array on the student. Duplicates and empty or unsafe values are rejected with 400. Added a skill tags section on the profile page (add, edit, delete).
- Routes use req.user from the auth middleware, same as the profile routes.

## 2026-10-24 (skills fix, issue #9)
- Student skills routes were returning 401 even with a valid login, because nothing set req.user. Added an attachUser middleware (server/middleware/auth.js) that reads the token on every request and sets req.user, without blocking public routes. Added tests in server/attachUser.test.js.
- Added a /api proxy to the Vite dev server (client/vite.config.js) so the pages that use relative API URLs reach the Express server.

## 2026-10-24 (resume upload, issue #10)
- Added resume upload and replace: POST and GET /api/students/me/resume (student role only). Accepts PDF only, max 5 MB, checks the file type, size and the PDF header, and keeps one file per student under server/uploads/resumes (not committed). The profile resumeUrl is saved on upload.
- Added a Resume section on the profile page (client/src/components/ResumeUpload.jsx) with upload, replace and view. Added unit and API tests (utils/resume.test.js, studentResume.test.js).
- Company access to an applicant resume will be handled with the applicant resume issue.

## 2026-10-24 (student dashboard shell, issue #11)
- Added the student area under /student: shared layout with navigation (Dashboard, My Profile, Internships, My Applications, Logout), a dashboard page with application status counts and quick links, and a ProtectedRoute that sends visitors without a login to /login.
- Routed the existing profile, browse internships and my applications pages inside the layout.

## 2026-11-02 (Sprint 3 & Mini-Project Deliverables Part-3)
- Resolved merge conflict markers and route mounts in server/index.js; mounted notification routes (/api/notifications) and aptitude test routes (/api/tests).
- Fixed ESLint React 19 hook warning in client/src/components/NotificationBell.jsx. Both client lint and build now pass with zero errors.
- Completed Darshan Mali's assigned Sprint 2/3 tasks:
  - Issue #33: Implemented auto-scoring engine (server/utils/scoring.js), TestHistory model (server/models/TestHistory.js), and aptitude test execution / preparation analytics routes (server/routes/tests.js). Added unit and API test suites.
  - Issue #34: Executed response time performance check (server/tests/performance.test.js), verifying sub-millisecond execution for eligibility evaluations (< 1.5s SLA).
  - Issue #35: Implemented concurrency and basic load check (server/tests/load.test.js), confirming 0.0% error rate and < 2.0s average latency across 100 simultaneous simulated requests.
  - Issue #36: Conducted code structure and lint review (server/tests/codeStructure.test.js), verifying modular MVC separation and clean syntax across all models, routers, and utility components.
  - Issue #37: Added data integrity test suite (server/tests/dataIntegrity.test.js) validating compound unique index on applications, schema enums, and referential constraints.
  - Issue #38: Built comprehensive integration test suite for internships and search API (server/routes/internships.test.js).
  - Also added test suites for company profile API (routes/companies.test.js), applications & status updates (routes/applications.test.js), student academic profile (routes/students.test.js), skills inventory (routes/skills.test.js), and in-portal notifications (tests/notifications.test.js).
- Updated the formal Test Case Document (`docs/TEST_CASES.md`) based on the changes made during sprints.
- Executed all automated tests: 106 tests across 24 test suites passing with 100% pass rate.
- Generated all 4 required reports in `docs/`:
  - Unit Test Report (`docs/UNIT_TEST_REPORT.md`)
  - System Validation Report (`docs/SYSTEM_VALIDATION_REPORT.md`)
  - Code Coverage Report (`docs/CODE_COVERAGE_REPORT.md`)
  - Branch Coverage Report (`docs/BRANCH_COVERAGE_REPORT.md`)

## 2026-11-03 (aptitude test taking, issue #29)
- Added POST /api/tests/:id/start which saves the server start time in a new TestAttempt model. Starting again while an attempt is running resumes it with the remaining time, so a page refresh does not reset the timer.
- Submit now closes the running attempt and takes the time spent from the server start time (capped at the test duration).
- Added the student pages Aptitude Tests (list) and Take Test: one question at a time, question palette, countdown timer from the server time, submit confirmation, and automatic submit at zero with inputs locked.
- Added API tests for start, resume, unpublished test and server-side time spent.

## 2026-11-03 (student preparation analytics, issue #30)
- The analytics endpoint (GET /api/tests/analytics/me) now also returns scoreHistory (latest 20 attempts, oldest first) for the chart, and returns the same fields in the empty case.
- Added the My Analytics student page: score history bars, category breakdown table with Strong (75% or more), Average and Weak (below 50%) labels, and an empty state with a link to the tests.
- Added API tests for the empty state and for strong and weak labels.

## 2026-11-05 (accessibility check, issue #31)
- Ran axe-core on the login, internships and test pages. Fixed two colour contrast problems and one heading order problem on the internships page; all three pages now report no issues. Results are in docs/ACCESSIBILITY_CHECK.md.
