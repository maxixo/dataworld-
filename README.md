# DataWorld

DataWorld is a full-stack web app for uploading tabular data, exploring it visually, and keeping analysis notes in the same workspace. It combines a React/Vite frontend with an Express/TypeScript API backed by PostgreSQL.

## What It Does

- Authenticates users with email/password or Google sign-in
- Uploads and stores CSV, JSON, `.xlsx`, and `.xls` datasets
- Parses uploaded files into normalized rows and columns for analysis
- Supports encrypted file uploads for protected datasets
- Lets users explore datasets with bar, line, and pie charts
- Includes filters, chart customization, fullscreen charts, and export tools
- Provides autosaved drafts, locked notes, and trash/restore workflows

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit
- Data visualization: Recharts
- File parsing: Papa Parse, SheetJS (`xlsx`)
- Auth client: Firebase Auth for Google sign-in
- Backend: Node.js, Express 5, TypeScript
- Database: PostgreSQL via `pg`
- Security: JWT auth, bcrypt, rate limiting, CORS allowlists

## Repository Layout

```text
.
|-- client/   # React frontend
|-- server/   # Express API and PostgreSQL access
|-- package.json
`-- README.md
```

## Main Product Areas

### Dataset Workspace

- Drag-and-drop upload flow
- Support for CSV, JSON, Excel (`.xlsx`, `.xls`)
- Safer parsing for mixed headers, blank rows, and irregular tabular input
- Dataset list, recent activity, and upload history
- Dataset detail page with chart controls and data preview

### Visual Analysis

- Bar, line, and pie charts
- X/Y axis selection
- Client-side data filtering
- Chart customization options
- Export support for charts and data

### Drafts And Locked Notes

- Rich draft editing flow with autosave
- Word-count guardrails
- Locked notes backed by client-side encryption before save
- Draft, locked-note, and trash views

### Authentication

- Email/password signup and login
- Google auth via Firebase on the client and API verification on the server
- JWT-protected API routes

## Local Development

### Prerequisites

- Node.js 20.x
- npm
- PostgreSQL

### 1. Install Dependencies

Install dependencies in the root, client, and server workspaces:

```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Configure Environment Variables

Create local env files from the examples:

```bash
copy client\.env.example client\.env
copy server\.env.example server\.env
```

Required server variables:

- `DATABASE_URL`
- `JWT_SECRET`

Common server variables:

- `PORT`
- `PG_SSL`
- `PG_POOL_MAX`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOWED_ORIGIN_PATTERNS`
- `TRUST_PROXY`

Client variables:

- `VITE_API_BASE_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### 3. Create The Database Schema

Run the PostgreSQL schema before starting the app:

```bash
psql "%DATABASE_URL%" -f server/sql/postgresql/schema.sql
```

The schema creates:

- `users`
- `datasets`
- `drafts`

### 4. Start The App

Start the API:

```bash
npm --prefix server run dev
```

Start the frontend in a second terminal:

```bash
npm --prefix client run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API: set either `PORT=5000` on the server or `VITE_API_BASE_URL=http://localhost:3000` on the client
- Frontend fallback API target: `http://localhost:5000/api` when `VITE_API_BASE_URL` is not set

## Build Commands

Build everything:

```bash
npm run build
```

Build only the frontend:

```bash
npm --prefix client run build
```

Build only the backend:

```bash
npm --prefix server run build
```

Start the production server after building:

```bash
npm start
```

## API Overview

Base path: `/api`

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/google`
- `GET /auth/verify`
- `POST /auth/logout`
- `GET /auth/profile`
- `PUT /auth/profile`

### Datasets

- `POST /datasets`
- `GET /datasets`
- `GET /datasets/history`
- `GET /datasets/:id`
- `GET /datasets/:id/blob`

### Drafts

- `POST /drafts`
- `GET /drafts`
- `GET /drafts/locked`
- `POST /drafts/trash/bulk-delete`
- `GET /drafts/:id`
- `PUT /drafts/:id`
- `DELETE /drafts/:id`
- `POST /drafts/:id/restore`
- `DELETE /drafts/:id/permanent`

## Upload Notes

- Non-encrypted uploads are parsed into structured row/column JSON before being stored.
- Encrypted uploads are sent as protected blobs with related metadata.
- The frontend accepts `.csv`, `.json`, `.xlsx`, and `.xls`.
- JSON uploads support array-of-objects, array-of-arrays, single objects, and common wrapped shapes such as `data` or `rows`.

## Health Check

The API exposes:

- `GET /api/health`

## Deployment Notes

- The backend expects a valid `DATABASE_URL` at startup.
- In production, configure `FRONTEND_URL` or `CORS_ALLOWED_ORIGINS`.
- Set `PG_SSL=true` if your database provider requires SSL.
- The root `npm run build` command builds both client and server.

## Current State

The codebase is already migrated to PostgreSQL for users, datasets, and drafts. The frontend expects API resources to use `id` rather than Mongo-style `_id`.
