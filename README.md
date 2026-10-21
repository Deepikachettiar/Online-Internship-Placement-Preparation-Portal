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

## Folder structure
```
client/   React app (Vite)
server/   Express API (controllers, routes, models, middleware)
docs/     Backlog, sprint plan, deviations, progress log, reference documents
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

Seed data (`npm run seed`) and the GitHub Actions CI workflow are separate issues; this section will be updated when they are merged.

## Workflow
- One branch and one pull request per issue. The repo owner reviews and merges.
- CI must pass before merging.
