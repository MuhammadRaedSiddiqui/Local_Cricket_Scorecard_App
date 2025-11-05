# Local League Cricket — Product Specification

Version: 1.0  
Owner: Product + Engineering  
Last updated: 2025-11-04

## 1. Summary
Local League Cricket is a web app for organizing local cricket matches, handling team/player setup, live scoring, and leaderboards. It provides real-time updates to viewers and simple admin workflows for match creation and scoring.

## 2. Goals
- Enable authenticated users to create, join, and manage matches.
- Provide a streamlined live-scoring experience with validations.
- Broadcast real-time updates (overs, runs, wickets) to all viewers.
- Persist match data and expose read APIs for leaderboards and scorecards.
- Offer basic user account flows: register, login, logout, profile.

Non-goals
- Payment processing.
- Complex tournament brackets/scheduling.
- Rich media streaming.
- Umpire review/DRS systems.

## 3. Target Users
- Scorer: creates matches, performs ball-by-ball scoring.
- Player: joins matches, views schedules and scorecards.
- Viewer: follows live scores and leaderboards.
- Organizer/Admin: oversees matches, basic access controls.

## 4. Key User Journeys
- Authentication: register → login → dashboard.
- Create a Match: dashboard → create match → invite/join players → set toss → start match.
- Live Scoring: select striker/non-striker/bowler → record ball outcomes/extras → view current over → auto-validate.
- Viewing: open match page → see live updates → see scorecard and recent overs.
- Post Match: finalize → generate scorecard → update leaderboard.

## 5. Scope
MVP
- Auth (register/login/logout/me).
- Match CRUD: create, fetch, start, live-score, finalize.
- Live updates via Pusher.
- Leaderboard and scorecards.
- Basic UI: home, dashboard, match scoring, match detail.

Future
- Teams/clubs management.
- Player stats history.
- Advanced permissions/roles.
- Offline scoring with sync.
- Notifications via email/push.

## 6. Functional Requirements

Authentication
- Register with email/password. Password hashing and JWT issuance.
- Login returns auth cookie or bearer token.
- Logout invalidates session.
- /me returns current user info.

Match Management
- Create a match with teams, players, overs config.
- Start match (toss decision, opening players).
- Join/Invite flow for players (optional RSVP).

Live Scoring
- Record ball-by-ball events: runs, boundaries, wicket types, extras (NB/W/Bye/LB).
- Maintain current striker/non-striker/bowler.
- Over progression, strike rotation, bowler change validation.
- Undo last ball (if feasible) in MVP or backlog.

Leaderboard and Scorecards
- Leaderboard aggregates by team or player.
- Scorecard shows innings, overs, bat/bowl stats, extras breakdown.

Real-time Updates
- Broadcast scoring events and state changes using Pusher channels per match.

Health/Diagnostics
- /api/health returns basic OK.
- Optional debug endpoints gated for development.

## 7. Non-Functional Requirements
- Performance: scoring actions <150ms server processing p50, real-time push <500ms end-to-end typical.
- Availability: best-effort (non-SLA) for MVP.
- Security: JWT secret rotation capability, no secrets in client bundles, rate limiting on auth endpoints.
- Privacy: store minimal PII; support account deletion (post-MVP).
- Observability: server logs for API errors; client toast on failures.

## 8. Architecture Overview
- Frontend: Next.js 14 App Router (TypeScript, React 18), TailwindCSS.
- Backend: Next.js Route Handlers in app/api/*.
- DB: MongoDB with Mongoose models (User, Match).
- Realtime: Pusher (server + client).
- Email: Resend (for future invites/notifications).
- Uploads: UploadThing (future media/profiles).
- Auth: JWT-based; cookie and Bearer token support; middleware guards protected routes.

Key Folders
- app/: UI pages and API route handlers.
- components/: UI components (dashboard, home, scoring).
- hooks/: useAuth, useMatchScoring.
- lib/: db, auth helpers, pusher setup, api-client.
- models/: Mongoose models (User, Match).
- utils/: validations, logging helpers.
- middleware.ts: route protection and redirects.

## 9. Screens and Navigation
- Home (/): marketing + quick actions.
- Login (/login), Register (/register).
- Dashboard (/dashboard): my matches, invited matches, quick actions.
- Match Detail (/matches/[id]): live view and tabs.
- Scoring (/matches/[id]/score): scorer interface (Toss, Player Selection, ScoringControls, CurrentOver, ScoreDisplay).
- Scorecard (/matches/[id]/scorecard): finalized breakdown.
- Leaderboard (/leaderboard): top teams/players.

## 10. API Contracts (current endpoints)

Auth
- POST /api/auth/register
  - Body: { email, password, name }
  - 201 Created -> { user, token? } and/or sets auth cookie
- POST /api/auth/login
  - Body: { email, password }
  - 200 OK -> { user, token? } and/or sets auth cookie
- POST /api/auth/logout
  - 200 OK, clears cookie
- GET /api/auth/me
  - 200 OK -> { user }

Health
- GET /api/health
  - 200 OK -> { status: "ok" }

Matches
- GET /api/matches
  - Query: filters (optional)
  - 200 OK -> { matches: [...] }
- POST /api/matches
  - Body: { teams, players, oversConfig, venue, startTime, ... }
  - 201 Created -> { match }
- GET /api/matches/:id
  - 200 OK -> { match }
- POST /api/matches/:id/start
  - Body: { tossWonBy, electedTo, openingBatsmen, openingBowler }
  - 200 OK -> { match }
- POST /api/matches/:id/score
  - Body: { ballEvent } // runs, extras, wicket, striker, bowler, over state
  - 200 OK -> { match, overUpdate }
- GET /api/matches/:id/debug (dev only)
  - 200 OK -> internal state snapshot (dev)

Leaderboard
- GET /api/leaderboard
  - 200 OK -> { leaderboard: [...] }

Note: Refer to app/api/* route handlers for exact shapes and validations.

## 11. Data Model Overview
- User: see models/User.ts (email, password hash, name, roles, createdAt, etc.).
- Match: see models/Match.ts (status, teams, players, innings data, overs, current state, events, timestamps).

Constraints
- A bowler cannot bowl consecutive overs (configurable per ruleset).
- Max overs per bowler (if configured).
- Legal ball counting excludes wides/no-balls; strike rotation logic per event.

## 12. Validations and Business Rules
- Use utils/scoringValidations.ts for ball legality, strike rotation, over completion.
- Prevent scoring if match not started or already finished.
- Middleware-enforced auth for protected pages: /dashboard, /matches, /profile, /settings.
- Server-side input validation for all API endpoints; sanitize strings.

## 13. Realtime Design
- Channel: match-{id}
- Events:
  - score:update — payload: { over, batsmen, bowler, totals, lastBall }
  - match:state — payload: { status, currentInnings, nextActions }
- Client: lib/pusher-client.ts; Server: lib/pusher.ts

## 14. Error Handling
- 400: validation error (detailed message).
- 401: unauthorized (missing/invalid token).
- 403: forbidden (not a participant/scorer).
- 404: not found (match/user).
- 409: state conflict (e.g., over already closed).
- 500: server error (errorId for diagnostics).

Client UX
- Use react-hot-toast for success/error feedback.
- Non-blocking retries for transient network failures.

## 15. Security
- JWT secret via env; rotateable.
- HttpOnly cookie for session where applicable.
- Do not expose secrets to client bundles.
- Basic rate limiting on auth endpoints (backlog).
- Input validation and output escaping for all user content.

## 16. Analytics (MVP)
- Track: match created, match started, ball recorded, match finished, user login/register.
- Basic counters persisted or sent to a lightweight analytics endpoint (future).

## 17. Accessibility and i18n
- WCAG AA for color contrast.
- Semantic components and keyboard nav for scoring controls.
- i18n not in MVP; keep copy centralized for future extraction.

## 18. Risks and Mitigations
- Complex cricket rules → codify validations with unit tests (utils/scoringValidations.ts).
- Realtime consistency → server is source of truth; clients render from server-confirmed state.
- Network latency → optimistic UI optional; reconcile on server response.

## 19. Milestones

M0 — Foundation (1-2 weeks)
- Auth (register/login/logout/me)
- DB and models
- Health endpoint
- Basic UI skeleton, Tailwind theme

M1 — Matches + Start (1-2 weeks)
- Create/list/get matches
- Toss + start flows
- Player selection UI

M2 — Live Scoring (2-3 weeks)
- Ball event API and validations
- Realtime updates with Pusher
- Scoring interface and state management

M3 — Scorecards + Leaderboard (1-2 weeks)
- Finalize match and render scorecard
- Leaderboard endpoint + UI
- Polishing, error states, toasts

M4 — Hardening (1 week)
- Tests, performance, security review
- Docs and deployment readiness

## 20. Open Questions
- Undo last ball support in MVP?
- Roles: who can score (creator only vs delegated)?
- Bowling constraints configurable per match?
- Invitations UX (email vs in-app only)?

## 21. References
- Code: app/, components/, hooks/, lib/, models/, utils/
- Env vars: .env.local (do not commit secrets)
- Next.js 14 App Router docs
- Pusher, Resend, UploadThing docs