# DataWorld Server

Backend API for the DataWorld web app. Provides authentication, dataset storage (including encrypted uploads), and draft/notes management backed by MongoDB.

## What the web app does
- Sign up or log in with email/password or Google
- Upload datasets (plain JSON or encrypted blobs) and retrieve metadata or encrypted blobs
- Create drafts and locked notes, move items to trash, restore, or permanently delete

## Features
- JWT auth with email/password and Google auth
- Dataset endpoints with optional encrypted blob storage
- Drafts/locked notes/trash workflows
- Rate-limited auth routes and CORS allowlist

## Tech Stack
- Node.js, Express, TypeScript
- MongoDB + Mongoose
- JWT, bcrypt

## Getting Started
1. Install dependencies:
   npm install
2. Create an env file:
   Copy .env.example to .env and update values
3. Start the dev server:
   npm run dev
4. Build for production:
   npx tsc
5. Start production server (expects dist/ output):
   npm start

## Environment Variables
Required:
- JWT_SECRET: Secret for signing auth tokens

Optional:
- MONGO_URI: MongoDB connection string (defaults to mongodb://localhost:27017/dataworld)
- PORT: Server port (defaults to 5000)
- NODE_ENV: Set to production to enable secure cookies and proxy trust


## Authentication
- Send JWT in Authorization: Bearer <token> or x-auth-token.
- Auth routes also set an authToken httpOnly cookie.

## API Routes
Base URL: /api

Auth
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/google

Datasets (auth required)
- POST /api/datasets
- GET /api/datasets?details=true
- GET /api/datasets/:id
- GET /api/datasets/:id/blob?raw=true

Drafts (auth required)
- POST /api/drafts
- GET /api/drafts?type=drafts|locked-notes|trash
- GET /api/drafts/locked
- POST /api/drafts/trash/bulk-delete
- GET /api/drafts/:id
- PUT /api/drafts/:id
- DELETE /api/drafts/:id
- POST /api/drafts/:id/restore
- DELETE /api/drafts/:id/permanent
- POST /api/drafts/:id/lock
- POST /api/drafts/:id/unlock

## Notes
- Drafts are stored as JSON in the database.
- Drafts can be locked, which means they can't be edited or deleted until unlocked.
- Drafts can be moved to trash, which means they can be restored or permanently deleted.
- Drafts can be exported as JSON or CSV.
- Drafts can be imported from JSON or CSV.
- Drafts can be shared with other users.

## Development
- Run `npm run dev` to start the server in development mode.
- Run `npm run test` to run the tests.
- Run `npm run lint` to lint the code.
- Run `npm run build` to build the project for production.

