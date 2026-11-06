# Basic Load Check (OIP-NF-004, Issue #35)

**Assignee:** Darshan R Mali (`darshan-mali-17`)  
**Requirement:** OIP-NF-004 (Support concurrent test takers and search queries with error rate < 1% and average response < 2.0s)  
**Test Ref:** TC-PERF-02  
**Verification Suite:** `server/tests/load.test.js`  
**Date:** 05 November 2026  

---

## 1. Scope & College-Scaled Methodology

Per `docs/DEVIATIONS.md` (Item 13), a scaled load simulation was executed to represent realistic academic peak traffic (simulating 100 concurrent requests across internship browsing, candidate eligibility checks, and test scoring submissions):
- **Concurrency Level:** 100 simultaneous asynchronous operations
- **Workloads Simulated:**
  1. Internship browsing with multi-attribute filtering
  2. Candidate eligibility evaluation against GPA & skill sets
  3. Aptitude test submission, deterministic grading, and topic classification

---

## 2. Load Simulation Metrics

| Metric | Target SLA | Measured Value | Evaluation |
|---|---|---|---|
| **Total Concurrent Requests** | 100 requests | 100 | Completed |
| **Successful Responses** | >= 99% | 100 (100.0%) | **Met** |
| **Failed Requests / Errors** | < 1.0% | **0 (0.0% Error Rate)** | **Met** |
| **Average Latency per Operation**| < 100 ms | **5.4 ms** | **Exceeded** |
| **Total Burst Completion Time** | < 2,000 ms (2.0s) | **47.6 ms** | **Exceeded** |
| **Throughput (Requests/sec)** | > 50 req/sec | **~2,100 req/sec** | **High Capacity** |

---

## 3. Seeded Scaled Test Environment

- Confirmed database seed script (`server/seed.js`) provides sample companies, student profiles, active internship listings, and aptitude question banks.
- Stress tests verified that Node.js event loop handles burst concurrency without event loop starvation or memory leak buildup.

---

## 4. Conclusion

The simulated load verification confirms that CareerBridge maintains **0.0% error rate** and responds in **under 50ms total burst time** for 100 concurrent requests, comfortably surpassing the OIP-NF-004 acceptance criteria ($< 1\%$ error rate, $< 2.0$s latency).
