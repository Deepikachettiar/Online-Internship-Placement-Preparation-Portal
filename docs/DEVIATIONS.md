# Deviations

Where the SRS, SAD and STP disagree or where we build something different. The SRS is the source of truth.

| # | Topic | Documents say | We do | Reason |
|---|---|---|---|---|
| 1 | Requirement IDs and name | SRS uses OIP-F/NF-xxx (24 FR, 8 NFR). SAD and STP use CB-F/NF-xxx (8 FR, 6 NFR) and the name CareerBridge | Use OIP IDs | SRS has the full list |
| 2 | Python/Flask service | SAD and STP need it for the test engine and analytics | Everything in Node/Express | SRS says MERN only |
| 3 | Notifications | SAD and STP: email and SMS | In-portal only | SRS 4.10 and OIP-F-018 |
| 4 | External integrations | SAD lists LinkedIn OAuth and a job-portal API | Not built | Not in the SRS |
| 5 | Extra features | SAD and STP: adaptive difficulty, readiness score, PDF/CSV export, progressSnapshots, graceful degradation | Not built. We build strong/weak topic analytics (OIP-F-023) | Not in the SRS |
| 6 | Roles | SAD: placement-cell role | Student, Company, Admin | SRS 2.3 |
| 7 | Application statuses | SAD/STP: applied, shortlisted, rejected, offered | Applied, Under Review, Shortlisted, Rejected, Selected | SRS OIP-F-015 |
| 8 | Error codes and rules | SAD: 403 for reapply lockout, 422 for validation | 400 for duplicates and invalid input, no lockout | SRS acceptance criteria |
| 9 | Resume | SAD: resumeUrl in apply request, virus scan. STP: PDF or DOCX | Resume linked from the student profile, PDF only, 5 MB, no virus scan | SRS OIP-F-007 |
| 10 | API shape | SAD: /api/applications/:studentId | Student taken from the JWT (/api/applications/me) | Access control (OIP-SR-002, SR-006) |
| 11 | Data model | SAD: users, internships, applications, testResults, progressSnapshots, database/schema.js | Models in server/models: users, companies, internships, applications, questions, tests, TestHistory, notifications | SRS needs more entities |
| 12 | Performance numbers | SAD/STP: search under 2 s, 500 listing records | Search 1.5 s. 500 students, 50 companies | SRS OIP-NF-001, NF-004 |
| 13 | NFR checks scaled down | SRS: 99.5% uptime, 100 concurrent test takers, 10 student study, full WCAG AA | Backup script and health check, about 20 concurrent users, 3-5 classmate usability test, axe/Lighthouse on 3 pages | Realistic for a college project |
| 14 | Browsers | SAD/STP: Chrome, Firefox, Edge | Same plus mobile width. Safari only if a device is available | SRS lists Safari |
| 15 | Test case IDs | STP uses TC-LIST, TC-DASH, TC-AVAIL etc. and different meanings for TC-APP-01/02 | Use SRS section 6.3 test case IDs | Consistent with SRS |
| 16 | Folder layout and database | SAD/STP use src/ paths and MongoDB Atlas | client/ and server/ folders. Local MongoDB or Atlas | Simpler setup |
| 17 | TLS | SAD: TLS everywhere. SRS: production only | HTTP in local development | SRS OIP-SR-004 |
| 18 | Schedule | STP dates (testing from 5 Oct, UAT 20 Oct) | Follow the Part-2 sprint dates | Implementation had not started |

## SRS section 4.4 extras (optional, if time allows)
SRS 4.4 mentions things that the functional requirement OIP-F-009 does not list. We follow OIP-F-009 and add these only if time allows:
- Admin can also create or moderate listings (OIP-F-009 is company only).
- Extra listing fields: eligible graduation batches, duration, openings.
- Notify students when a new aptitude test is published (OIP-F-018 only covers status changes and new applications).
