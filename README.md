# Expense Tracker Monorepo

This repository is split into clear front-end and back-end workspaces to keep concerns isolated as the MVP grows.

- `frontend/` — Next.js client with local expense entry UI (Day 1 MVP).
- `backend/` — Placeholder for upcoming AWS Lambda + DynamoDB implementation.
- `shared/` — Reusable TypeScript contracts shared across both sides.

## Getting Started

```
cd frontend
npm install
npm run dev
```

Environment variables live in workspace-specific files; copy the `.env*.example` templates before running anything that depends on them.
