# Response Time Check (OIP-NF-001, Issue #34)

**Assignee:** Darshan R Mali (`darshan-mali-17`)  
**Requirement:** OIP-NF-001 (API response time <= 1.5s, page load <= 2.5s)  
**Test Ref:** TC-PERF-01  
**Verification Suite:** `server/tests/performance.test.js`  
**Date:** 05 November 2026  

---

## 1. Overview & Setup

To verify non-functional requirement OIP-NF-001 under realistic conditions for a college project, response times were recorded across 10 consecutive iterations for the three most common API operations:
1. User Authentication / Login (`POST /api/auth/login`)
2. Internship Catalog Browsing (`GET /api/internships?page=1&limit=10`)
3. Multi-Criteria Filtered Search (`GET /api/internships?search=React&skill=react&location=Bengaluru`)
4. Candidate Eligibility Evaluation (`GET /api/internships/:id/eligibility`)

---

## 2. Database Indexes Verified

Compound and single-field indexes were confirmed on MongoDB collections to ensure query execution does not perform table scans:
- `Internship.title`, `Internship.description`, `Internship.location`, `Internship.requiredSkills` (Compound text search index and regex acceleration)
- `Internship.status` and `Internship.isPublished` (Compound index for active catalog filtering)
- `Application.student` + `Application.internship` (Compound unique index)
- `TestHistory.student` + `TestHistory.createdAt` (Descending compound index for analytics lookups)

---

## 3. Measured Response Time Results (10 Recorded Calls)

| Call # | Login (`/api/auth/login`) | Browse (`/api/internships`) | Filtered Search (`/api/internships?search=...`) | Eligibility Evaluation |
|---|---|---|---|---|
| 1 | 82 ms | 34 ms | 28 ms | 4.2 ms |
| 2 | 45 ms | 21 ms | 19 ms | 2.1 ms |
| 3 | 42 ms | 18 ms | 16 ms | 1.8 ms |
| 4 | 46 ms | 19 ms | 17 ms | 1.9 ms |
| 5 | 41 ms | 17 ms | 15 ms | 1.7 ms |
| 6 | 44 ms | 18 ms | 16 ms | 1.8 ms |
| 7 | 43 ms | 17 ms | 15 ms | 1.6 ms |
| 8 | 40 ms | 19 ms | 14 ms | 1.8 ms |
| 9 | 42 ms | 18 ms | 16 ms | 1.7 ms |
| 10 | 41 ms | 17 ms | 15 ms | 1.6 ms |
| **Average** | **46.6 ms** | **19.8 ms** | **17.1 ms** | **2.02 ms** |
| **95th %ile** | **78.2 ms** | **31.4 ms** | **26.2 ms** | **3.8 ms** |
| **SLA Limit**| **<= 1,500 ms** | **<= 1,500 ms** | **<= 1,500 ms** | **<= 1,500 ms** |
| **Result** | **PASS** | **PASS** | **PASS** | **PASS** |

---

## 4. Findings & Query Optimization

- **Bcrypt Work Factor (10 rounds):** Initial login requires ~45–80ms due to cryptographic password verification, safely below the 1.5s threshold.
- **Indexed Search Query:** Query planning leverages index scans. Search results execute within ~17ms, orders of magnitude faster than the 1.5s SLA.
- **Frontend Page Load:** Production Vite bundle loaded in browser within ~0.4s to 0.9s across modern browsers (well within the 2.5s page load criteria).
- **Conclusion:** No slow queries identified. All response times satisfy OIP-NF-001.
