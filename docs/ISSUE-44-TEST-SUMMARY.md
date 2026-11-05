# Issue #44 - Test Summary Report

## 1. Test execution details

| Item | Details |
|---|---|
| Project | CareerBridge - Online Internship & Placement Preparation Portal |
| Sprint | Sprint 3 |
| Issue | #44 - Test Summary |
| Test date | 05 November 2026 |
| Tester(s) | Deepika K (`Deepikachettiar`) |
| Environment | Local development environment; Windows 11; Node.js v24; backend automated tests |
| Backend URL | `http://localhost:5000` |
| Frontend URL | `http://localhost:5173` |
| Commit / branch tested | `59459e60b17b439af47eb4e5687df9104cc53eb8`; `docs/44-test-summary` |

## 2. Scope

The following areas were included in the test cycle.

- [x] Student registration / sign-in
- [x] Student application submission
- [x] Student viewing their applications
- [x] Company viewing applicants
- [x] Company updating application status
- [x] In-portal notifications
- [ ] Browser / mobile layout
- [x] Authentication, validation, performance, data integrity, and architecture checks

## 3. Test results

| Metric | Count |
|---|---:|
| Total tests identified by the runner | 117 |
| Passed | 111 |
| Failed | 0 |
| Blocked | 0 |
| Skipped / not run | 6 |

**Overall result:** Pass with limitations

## 4. Detailed findings

| Test ID | Feature / scenario | Expected result | Actual result | Status | Evidence |
|---|---|---|---|---|---|
| T-01 | Student submits an application | Application is saved and confirmation is shown | Automated application submission checks passed; live credential-backed API flow was skipped. | Pass (automated) | `server/routes/applications.test.js`, `server/tests/application-flow.test.js` |
| T-02 | Student views submitted applications | Student sees only their applications | Automated tests confirmed that the authenticated applications endpoint returns the student's application list; live credential flow was skipped. | Pass (automated) | `server/routes/applications.test.js`, `server/tests/application-flow.test.js` |
| T-03 | Company views applicants | Company sees applicants for its internships | Automated applicant-list checks passed; the live credential-backed flow was skipped. | Pass (automated) | `server/routes/applications.test.js`, `server/tests/application-flow.test.js` |
| T-04 | Company changes application status | Valid status is saved and reflected in the portal | Status updates and notification behavior passed automated tests. | Pass | `server/routes/applications.test.js`, `server/tests/notifications.test.js` |
| T-05 | Notification is created and displayed | Relevant notification appears for the intended user | Notification retrieval, unread count, and read operations passed automated tests. | Pass | `server/tests/notifications.test.js`, `server/routes/applications.test.js` |
| T-06 | Unauthenticated access | Protected endpoint rejects unauthenticated request | Protected application, notification, profile, and student endpoints returned HTTP 401 without authentication. | Pass | `server/auth.test.js`, `server/routes/applications.test.js`, `server/tests/notifications.test.js` |
| T-07 | Invalid status value | API rejects unsupported status | Unsupported application statuses were rejected with HTTP 400 in automated tests. | Pass | `server/routes/applications.test.js`, `server/models/Application.js` |
| T-08 | Mobile / narrow viewport | Main user flows remain usable without horizontal overflow | No fresh browser or responsive run was executed for this report; existing mobile-check evidence is marked illustrative and pending verification. | Not run | `docs/BROWSER-MOBILE-CHECK.md` |

## 5. Defects and observations

| Defect ID | Description | Severity | Steps to reproduce | Current status / issue link |
|---|---|---|---|---|
| N/A | No defects were observed in the automated tests that executed successfully. | N/A | N/A | Closed / no defect recorded |

## 6. Limitations

- Six live API-flow tests were skipped because `RUN_API_TESTS` was not enabled and live student/company credentials and application data were not configured.
- The mobile/narrow-viewport flow was not executed in a browser for this report.
- Cross-browser testing, Safari testing, staging testing, screenshots, and production-data testing were not performed.

## 7. Conclusion

The backend automated suite was executed successfully at commit `59459e60b17b439af47eb4e5687df9104cc53eb8`: 111 of 117 tests passed, 6 were skipped, and 0 failed. Application lifecycle, authentication, authorization, notification, validation, performance, integrity, and architecture checks passed the available automated coverage. The build is suitable to proceed to live-environment and browser validation, subject to enabling the credential-dependent API-flow tests and completing responsive testing.

## 8. Evidence

- Test-run output: `npm test` executed on 05 November 2026; 117 tests identified, 111 passed, 0 failed, and 6 skipped.
- Automated test report: `docs/UNIT_TEST_REPORT.md`
- Browser/mobile evidence: Not collected; pending verification in `docs/BROWSER-MOBILE-CHECK.md`
- Related issue: https://github.com/Deepikachettiar/Online-Internship-Placement-Preparation-Portal/issues/44
