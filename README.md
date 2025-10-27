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

Need to lock the dev server to loopback only (so your LAN IP stays hidden)? Run `npm run dev -- --hostname 127.0.0.1` instead—Next.js will bind to the loopback interface and you can still visit `http://127.0.0.1:3000`.

Environment variables live in workspace-specific files; copy the `.env*.example` templates before running anything that depends on them.

- `frontend/.env.local` needs your Firebase **Web app** config (API key, auth domain, project ID, storage bucket, messaging sender ID, and app ID). Create the file from `frontend/.env.local.example` and paste the exact values from your Firebase console.
- `backend/.env.local` (copy from `backend/.env.example`) will hold AWS + Firebase service account secrets when we start implementing Lambda endpoints.
