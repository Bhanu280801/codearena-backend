# CodeArena Backend

Production-style backend for an online coding platform built with Node.js, Express, PostgreSQL, Prisma, Redis, BullMQ, Docker, and JWT auth.

## Architecture

Client -> Express API -> PostgreSQL/Prisma -> Redis Queue -> BullMQ Worker -> Judge Service -> Code Executor -> Verdict

The API creates submissions quickly and pushes judge work to Redis. The worker processes submissions asynchronously, executes code against problem test cases, and updates submission status for frontend polling.

## Core Features

- JWT signup, login, profile
- Admin-protected problem management
- Problem test cases with hidden-case support
- Async submission queue with BullMQ
- Submission status tracking: `pending`, `processing`, `completed`
- Verdicts: `accepted`, `wrong answer`, `runtime error`, `compilation error`, `time limit exceeded`
- Multi-language stdin execution: JavaScript, Python, C++, Java
- JavaScript/Python function-style execution for LeetCode-like problems
- Time limit handling
- Docker sandbox execution option
- Rate limiting for auth, submissions, and general API traffic
- Contest creation and joining
- Global leaderboard
- User statistics
- Docker Compose for API, worker, Redis, PostgreSQL
- CI syntax and Prisma generation checks

## Test Case Format

STDIN problem:

```json
[
  {
    "input": "2 3",
    "output": "5",
    "isHidden": false
  }
]
```

Function problem:

```json
[
  {
    "input": "[2,3]",
    "output": "5",
    "isHidden": false
  }
]
```

For function mode, set `executionMode` to `FUNCTION` and provide `functionName`.

## Scripts

```bash
npm run dev
npm start
npm run worker
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:generate
npm run seed:problems
npm test
npm run check
```

## Local Development

Run the API and frontend in separate terminals:

```bash
npm run dev
cd codearena-frontend
npm run dev
```

Seed the function-style starter problems:

```bash
npm run seed:problems
```

Local submissions are processed inline unless `USE_SUBMISSION_QUEUE=true` is set. This lets the app work without Redis while developing.

Backend environment variables live in `.env`. Start from `.env.example` and set:

```bash
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173,http://127.0.0.1:5173
USE_SUBMISSION_QUEUE=false
USE_DOCKER_SANDBOX=false
```

Frontend environment variables live in `codearena-frontend/.env`. Start from `codearena-frontend/.env.example` and set:

```bash
VITE_API_URL=http://localhost:5000
```

## Admin Access

Problem management is available at:

```text
/admin/problems
```

The route requires a user with `role = ADMIN`. Update a user in the database when you need admin access locally.

## Docker

```bash
docker compose up --build
```

For production sandboxing on Linux workers, set:

```bash
USE_DOCKER_SANDBOX=true
USE_SUBMISSION_QUEUE=true
```

The worker process must have Docker and Redis available. Keep API and worker as separate deployable services. In production, queue failures return a `503` instead of falling back to inline execution, and code execution requires `USE_DOCKER_SANDBOX=true`. Do not expose local, non-Docker code execution to untrusted public users.

## Main API Groups

- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/profile`
- `GET /problems`
- `POST /problems` admin
- `POST /submissions`
- `GET /submissions/me`
- `GET /submissions/:id`
- `GET /contests`
- `POST /contests` admin
- `POST /contests/:id/join`
- `GET /leaderboard`
- `GET /stats/me`
