# Data Integrity Checks (OIP-NF-007, Issue #37)

**Assignee:** Darshan R Mali (`darshan-mali-17`)  
**Requirement:** OIP-NF-007 (Database schema relational and referential integrity, duplicate prevention, schema constraints)  
**Test Ref:** TC-APP-02, TC-APP-02B  
**Verification Suite:** `server/tests/dataIntegrity.test.js`, `server/routes/applications.test.js`  
**Date:** 05 November 2026  

---

## 1. Scope & Verification Goals

To ensure the integrity of the recruitment domain data, database-level and application-level constraints were validated across MongoDB Mongoose schemas:
1. Prevention of duplicate internship applications by the same student for the same listing.
2. Verification of required fields and referential ObjectId pointers.
3. Enum boundary enforcement across roles, work modes, and recruitment lifecycle states.
4. Clean error handling when unique constraints are violated (returning HTTP 400 instead of 500).

---

## 2. Integrity Verification Matrix

| Check / Constraint | Implementation | Verification Suite | Result |
|---|---|---|---|
| **Duplicate Application Prevention** | Compound unique index: `Application.index({ student: 1, internship: 1 }, { unique: true })` | `server/routes/applications.test.js`, `server/tests/dataIntegrity.test.js` | **PASS (HTTP 400 returned on duplicate)** |
| **Application Lifecycle Status** | Enforced Mongoose enum: `["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"]` | `server/tests/dataIntegrity.test.js` | **PASS (Invalid status strings rejected)** |
| **Internship Work Mode** | Enforced Mongoose enum: `["Remote", "On-site", "Hybrid"]` | `server/tests/dataIntegrity.test.js` | **PASS (Disallows invalid arrangements)** |
| **User Role Bounds** | Enforced Mongoose enum: `["student", "company", "admin"]` | `server/tests/dataIntegrity.test.js` | **PASS (Disallows arbitrary role escalation)** |
| **Academic Bounds (CGPA)** | Profile validation logic ensures $0.00 \le \text{CGPA} \le 10.00$ | `server/utils/profileValidation.test.js` | **PASS (Rejects negative or >10 numbers)** |
| **Aptitude Question Categories**| Enforced enum: `["Quant", "Logical", "Verbal"]` | `server/models/Question.js` | **PASS (Enforces 3 standard placement categories)** |
| **TestHistory Analytics Index** | Compound index: `TestHistory.index({ student: 1, createdAt: -1 })` | `server/tests/dataIntegrity.test.js` | **PASS (Accelerates student preparation analytics)** |

---

## 3. Duplicate Prevention Behavior

When a student attempts to re-apply to an internship listing:
1. MongoDB immediately flags violation code `11000` (Duplicate Key Error).
2. The controller catches the code `11000` and dispatches a clean, user-friendly JSON response:
   ```json
   { "message": "You have already applied to this internship." }
   ```
   with status code `400 Bad Request`.
3. Verified via automated unit and integration tests.

---

## 4. Conclusion

Data integrity and referential constraints are verified at both the database indexing layer and application validation layer.
