# Online Internship & Placement Preparation Portal

Team 4 mini project. MERN stack: MongoDB + Mongoose, Express, React (Vite), Node 20.

## Team
| Name | GitHub |
|---|---|
| Dhanush Rao | dhanushrao-max |
| Gunavathi M | Guna-meda |
| Darshan R Mali | darshan-mali-17 |
| Deepika K | Deepikachettiar |

## Project board
https://github.com/users/Guna-meda/projects/1

Backlog, sprint plan and deviations are in the `docs/` folder.

## Project structure
```
client/
  src/
    components/     Reusable UI elements (Navbar, Badges, NotificationBell, Cards)
    context/        AuthContext and state management
    pages/          Route views (Dashboard, Internships, TakeTest, Analytics, Profile)
    utils/          Client-side token and authentication helpers
server/
  middleware/       JWT authentication (authenticateToken, attachUser) and RBAC guards
  models/           Mongoose schemas (User, Internship, Application, Notification, AptitudeTest, Question, TestHistory, TestAttempt)
  routes/           REST API routers (auth, internships, applications, companies, students, tests, notifications, health)
  utils/            Validation and scoring engines (eligibility, scoring, resume, skills)
  scripts/          Database maintenance and daily mongodump backup scripts
  tests/            Performance, load, data integrity, and architectural test suites
docs/               Backlog, sprint plans, test reports, deviations, and NFR documentation
```

## Prerequisites
- Node.js 20
- MongoDB Community Server 7.x running locally (or a MongoDB Atlas connection string)
- Git

## Setup
1. Clone the repo and open the folder.
2. Backend:
   ```
   cd server
   cp .env.example .env
   npm install
   npm run dev
   ```
   Open `server/.env` and check the values:
   | Variable | Meaning |
   |---|---|
   | `PORT` | API port (default 5000) |
   | `MONGO_URI` | MongoDB connection string (default `mongodb://127.0.0.1:27017/internship_portal`) |
   | `JWT_SECRET` | Any long random text, used to sign login tokens |
   | `CLIENT_URL` | Frontend address (default `http://localhost:5173`) |
3. Frontend (in a second terminal):
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```
   `VITE_API_URL` in `client/.env` must point to the API (default `http://localhost:5000`).
4. Open http://localhost:5173 and click "Check API Health". It should show that the API is healthy.

If the server stops with "MONGO_URI is missing" or cannot connect, make sure MongoDB is running and `server/.env` exists.

## Useful commands
| Where | Command | What it does |
|---|---|---|
| server | `npm run dev` | Start the API with auto restart |
| server | `npm test` | Run the tests |
| server | `npm run lint` | Syntax check |
| client | `npm run dev` | Start the React app |
| client | `npm run build` | Production build |
| client | `npm run lint` | Run ESLint |

| server | `npm run seed` | Add demo users, internships, questions and a published test |
| server | `npm run backup` | Back up the database (see Database Backup and Restore) |

## Demo data and logins
Run `npm run seed` in `server/` once MongoDB is running. It can be run again safely. All demo accounts use the password `DemoPass123!`.

| Role | Email |
|---|---|
| Student | aarav@example.com (also diya@, ishaan@, meera@example.com) |
| Company | northstar@example.com (also bluepeak@, orbit@example.com) |
| Admin | admin@example.com |

## How to use
**Student** (log in at `/login`, you land on `/student`)
1. My Profile: fill academic details, add skills and upload a PDF resume (max 5 MB).
2. Internships: search and filter, check eligibility and apply.
3. My Applications: follow the status of each application.
4. Aptitude Tests: pick a published test and start it. The timer runs from the server start time, answers can be changed with the question palette, and the test is submitted automatically when time ends.
5. My Analytics: see past scores and strong (75% or more) and weak (below 50%) topics.
6. The bell icon shows in-portal notifications.

**Company**: register at `/company-register`. The company profile, post internship and applicants pages are built, but they are not linked into the app routes yet, so for now company actions are available through the API only (`/api/companies`, `/api/internships`, `/api/applications`). Student registration works through the API (`/api/auth`); there is no student registration page yet, so use the seeded student accounts to log in.

**Admin**: the admin account exists in the seed data. The admin question bank, test publishing and dashboard (issues #24, #25, #26) are not finished yet. The seeded test is already published so students can try the test flow.

## Continuous integration
The GitHub Actions workflow in `.github/workflows/ci.yml` installs the packages, runs lint, build and tests for client and server on every pull request.

## Documentation
All project documents are in `docs/`: backlog, sprint plan, progress log, deviations from the SRS/SAD/STP, test cases, test and coverage reports, and the NFR checks (response time, load, data integrity, code structure, usability, browser and mobile, accessibility). The Sprint 1 demo video is `docs/sprint 1 demo.mp4`.

## Workflow
- One branch and one pull request per issue. The repo owner reviews and merges.
- CI must pass before merging.

## Database Backup and Restore

### Prerequisites
- MongoDB Database Tools installed (includes `mongodump` and `mongorestore`).
- `MONGO_URI` configured in `server/.env`.

### Create a database backup
From the `server/` directory, run:
```bash
npm run backup
```
The backup is saved in `server/backups/` with a timestamped folder name. It contains BSON data and collection metadata.

### Restore a database backup
To restore a backup, use:
```bash
mongorestore --uri="<MONGO_URI>" --drop <BACKUP_PATH>
```
Replace `<MONGO_URI>` with your MongoDB connection string and `<BACKUP_PATH>` with the backup's database folder path.

**Warning:** `--drop` deletes existing collections in the target database before restoring. Verify the target database and backup path before running this command.

### Backup and restore verification
A backup was successfully created and restored into a separate test database named `internship_portal_restore_test`.

- Documents restored: 5
- Failed documents: 0
- Original database: unchanged
