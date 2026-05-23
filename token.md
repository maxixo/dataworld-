# Token Expiry Handling Plan

## Goal
When a JWT is expired, show an on-screen dialog prompting the user to log in again and prevent any redirect to the dashboard with a stale token.

## Scope
- Backend auth middleware expiry detection.
- Keep existing messages for missing/invalid tokens to avoid breaking clients.

2) Client: validate token on load and schedule expiry
- Add a small JWT expiry helper (decode `exp`) and treat expired tokens as unauthenticated.
- Update `client/src/context/AuthContext.tsx`:
  - On boot: read `token` + `user`, validate expiration; if expired, clear storage and set a `sessionExpired` flag.
  - On login: store token + user, compute expiry, start a timeout to flip `sessionExpired` when the token expires.
  - On logout: clear timeout, storage, and reset `sessionExpired` to false.

3) Global session-expired dialog
- Create `client/src/components/SessionExpiredDialog.tsx`.
- Render it near the app root (inside `AuthProvider` in `client/src/App.tsx`).
- Dialog content: "Session expired. Please log in again to continue."
- Single primary action: "Log in" (calls `logout()` and navigates to `/login`).

4) Centralized API handling
- Add a shared axios instance or interceptor (new file like `client/src/services/http.ts`).
- On 401 with `code: 'TOKEN_EXPIRED'`, set `sessionExpired` (only once).
- Exclude auth endpoints (`/auth/login`, `/auth/signup`, `/auth/google`) from triggering the dialog.
- Optionally treat generic 401s as expired if the server does not distinguish them.

5) Route guard correctness
- Update `PrivateRoute` / `PublicRoute` in `client/src/App.tsx` to rely on the validated token state.
- Ensure `/login` never redirects to `/app` when the token is expired or `sessionExpired` is true.

6) Verification checklist
- Expired token in localStorage on page load -> dialog appears, no redirect to `/app`.
- Token expires while user is active -> dialog appears without navigation to dashboard.
- Any API call returning TOKEN_EXPIRED -> dialog appears; user can log in again.

