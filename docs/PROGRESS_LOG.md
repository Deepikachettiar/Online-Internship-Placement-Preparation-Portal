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
- Routes use req.user from the auth middleware, same as the other student routes. The page is not linked in the app yet because routing comes with the login issue and the dashboard shell issue.

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

## 2026-10-22 (browse internships with pagination)
- Added paginated browsing for issue #16: GET /api/internships with page and limit query params, filtering only Active listings from approved companies, sorted newest first.
- Built BrowseInternships page (client/src/pages/BrowseInternships.jsx) with card list and pagination controls (Previous/Next, page counters).

## 2026-10-22 (search and filter internships)
- Added search and multi-criteria filtering for issue #17: GET /api/internships supports search/q keyword, skill, location, workMode, and minStipend parameters.
- Empty query returns all active roles; indexes on title, location, and requiredSkills ensure fast response times (< 1.5s).
- Added interactive search bar and filter controls to BrowseInternships.jsx with filter clearing and pagination synchronization.





