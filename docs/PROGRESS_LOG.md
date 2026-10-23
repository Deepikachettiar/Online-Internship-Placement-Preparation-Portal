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

## 2026-10-23 (student skills)
- Added student skills for issue #9: GET, POST, PUT and DELETE on /api/students/me/skills. Skills are trimmed, lowercased and stored as an array on the student. Duplicates and empty or unsafe values are rejected with 400. Added a skill tags section on the profile page (add, edit, delete).
- Routes use req.user from the auth middleware, same as the profile routes.
