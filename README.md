# GlobeTrotter

Personalized multi-city travel planning for the Odoo × LDCE Ahmedabad Hackathon 26.

This repository contains the project foundation, PostgreSQL / Prisma travel graph, JWT authentication, Trip CRUD, live city search, itinerary stops, activities, trip budget / expense tracking, a trip calendar timeline, public trip sharing with copy-trip, a server-side Odoo export integration, and an optional AI trip assistant.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Lucide React, Recharts
- Backend: Node.js, Express, Prisma, JWT, bcrypt, Zod
- Database: PostgreSQL

## Prerequisites

- Node.js 22+
- PostgreSQL 16 (Docker Compose **or** a local PostgreSQL install)

## Setup

```bash
cp .env.example .env
cp .env.example server/.env
cd client && npm install
cd ../server && npm install
```

The API loads `.env` from the repository root. Prisma CLI loads `server/.env`.

If you install PostgreSQL without Docker, change `DATABASE_URL` in both env files to your local user and password.

## Start PostgreSQL

Docker (if installed):

```bash
docker compose up -d
```

Without Docker, start your local PostgreSQL service and create a database named `globetrotter`.

## Database migration and seed

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

Demo account: `demo@globetrotter.dev` / `GlobetrotterDemo1`

Auth endpoints live under `/api/v1/auth`. Trip CRUD lives under `/api/v1/trips`. Public itineraries are `GET /api/v1/public/trips/:slug` at `/p/:slug`. Copy trip is `POST /api/v1/public/trips/:slug/copy`. City search is `GET /api/v1/search/cities`. Stops can be added at `POST /api/v1/trips/:id/stops`. The trip calendar is derived from `GET /api/v1/trips/:id` (no extra itinerary tables). Budget totals come from `TripExpense` only (`GET /api/v1/trips/:id/budget`); itinerary stay, transport, and activity costs are not auto-copied into expenses. Forgotten-password emails are not sent; the reset URL is printed in the backend console. Open Graph crawl previews are limited because the client is a SPA.

## Start the backend

```bash
cd server
npm run dev
```

The API listens on `http://localhost:3001`.

Health check: `GET http://localhost:3001/api/health`

## Start the frontend

```bash
cd client
npm run dev
```

The app is at `http://localhost:5173`. Vite proxies `/api` to the backend.

## Environment variables

See `.env.example` (also copied to `server/.env.example`). Copy it to `.env` at the repository root and to `server/.env`. Do not commit secrets.

Optional Odoo variables (backend only — never put these in React):

```
ODOO_URL=
ODOO_DB=
ODOO_USERNAME=
ODOO_PASSWORD=
ODOO_TIMEOUT_MS=10000
```

If they are empty, GlobeTrotter still starts. `GET /api/v1/odoo/status` returns `{ "configured": false, "connected": false }` and trip export/test return `400`.

## Odoo integration

Architecture:

```
React (trip Odoo page)
  → Express `/api/v1/odoo` and `/api/v1/trips/:id/odoo/*`
  → odooService + odooMapper
  → odooClient (JSON-RPC `/jsonrpc`)
  → Odoo
```

The browser never calls Odoo. Credentials stay in server environment variables.

### Configure Odoo

1. Install the **Project** app on your Odoo instance if you can (preferred). Calendar is a fallback. `res.partner` is the last-resort standard model (always in base).
2. Set `ODOO_URL` to the instance origin, for example `https://odoo.example.com` (no trailing slash required).
3. Set `ODOO_DB`, `ODOO_USERNAME`, and `ODOO_PASSWORD` for an Odoo user that can create records in the models below.
4. Restart the Express API. Prisma schema is unchanged.

### Test the connection

- In the app: open a trip → **Odoo** → **Test Connection**.
- HTTP: `GET /api/v1/odoo/status` and `POST /api/v1/trips/:id/odoo/test` with a JWT.

### Export a trip

Open a trip → **Odoo** → **Export Trip to Odoo**. Confirm in the modal.

HTTP: `POST /api/v1/trips/:id/odoo/export`

Response:

```json
{
  "success": true,
  "message": "Trip exported to Odoo",
  "odoo": { "model": "project.project", "recordId": 123 }
}
```

Re-export updates the same integer id when possible (`Trip.odooExpenseId` stores the Odoo record id — the column name is historical).

### Expected Odoo models and fields

No custom Odoo modules are required. The server tries these **standard** models in order and never accepts a model name from the frontend:

| Model | Fields sent | When used |
| --- | --- | --- |
| `project.project` | `name`, HTML `description` (dates, budget, destinations, activities, expenses), `date_start`, `date` | Preferred when the Project app is installed. If extra date fields are rejected, retries with `name` + `description` only. |
| `calendar.event` | `name`, `start`, `stop`, `description` | Fallback when Project is missing. |
| `res.partner` | `name` (`GlobeTrotter: …`), `comment` | Last resort; always available in Odoo base. |

If you later add custom models (for example `x_globetrotter.trip`), keep them server-side only and document the field list here.

### Security

- All Odoo endpoints require JWT.
- Only the trip owner can test or export (`403` for another user, `404` if the trip is missing).
- Odoo URL, database, username, and password are never returned in API JSON or shipped in the client bundle.
- Passwords are not written to logs.
- External Odoo faults are mapped to `502` with a short message (timeout, auth, invalid database, unavailable).
- JSON-RPC calls use `ODOO_TIMEOUT_MS` (default 10s).

### When Odoo is unavailable

- Missing env: app boots; status is not configured; export/test return `400`.
- Configured but Odoo down or credentials wrong: status may show `configured: true, connected: false`; test/export return `502`.
- Auth, trips, city search, itinerary, activities, budget, calendar, and public sharing keep working.

Odoo endpoints:

- `GET /api/v1/odoo/status`
- `POST /api/v1/trips/:id/odoo/test`
- `POST /api/v1/trips/:id/odoo/export`

## AI trip assistant

Architecture:

```
React (trip AI Assistant page)
  → Express `/api/v1/ai` and `/api/v1/trips/:id/ai/*`
  → aiTripService (PostgreSQL trip + budget + calendar)
  → aiProvider.generateText (optional LLM)
```

The browser never calls an AI vendor. `AI_API_KEY` stays on the server.

### Environment variables

Backend only (also listed in `server/.env.example`):

```
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_BASE_URL=https://api.openai.com/v1
AI_TIMEOUT_MS=15000
```

`AI_PROVIDER` currently supports `openai` (and `openai-compatible` with `AI_BASE_URL`). Example model: `gpt-4o-mini`. Leave the variables empty to run GlobeTrotter without an LLM.

### Provider setup

1. Create an API key with your OpenAI-compatible provider.
2. Set `AI_PROVIDER=openai`, `AI_API_KEY`, and `AI_MODEL` in root `.env` and `server/.env`.
3. Restart Express. Do not put the key in React or Git.

### Endpoints (JWT required, trip owner only)

- `GET /api/v1/ai/status` — `{ configured, provider, model, message }` (never returns the key)
- `POST /api/v1/trips/:id/ai/chat` — `{ message }` → `{ answer, suggestions, budgetImpact, source }`
- `POST /api/v1/trips/:id/ai/suggestions` — optional `{ preferences: { style, interests, budgetPriority } }`
- `POST /api/v1/trips/:id/ai/analyze` — empty days, conflicts, budget, destinations without activities

`401` unauthenticated, `403` not owner, `404` missing trip, `400` validation / AI not used as a crash, `502` provider down on chat/suggestions.

Budget totals (`totalSpent`, `remaining`, `percentageUsed`) are computed from `TripExpense` in Express and passed into the model. The assistant must not invent those figures.

The assistant never writes trips, stops, activities, or expenses.

### Usage

Open a trip → **AI Assistant** (`/trips/:id/assistant`). Ask a question, or use Analyze my trip / Suggest activities / Optimize my budget / Find empty days. `/trips/:id/ai` redirects to the same page.

## Smart Trip Assistant

Architecture:

```
React (/trips/:id/assistant)
  → Express `/api/v1/assistant` and `/api/v1/trips/:id/assistant/*`
  → tripAssistantService
  → PostgreSQL (trip, stops, activities, expenses)
  → optional aiProvider.generateText
```

The browser never calls an AI vendor. Budget remaining, empty days, and conflicts are computed in Express using the same calendar rules as the trip timeline and `TripExpense` totals.

### Endpoints (JWT, trip owner)

- `GET /api/v1/assistant/status` — `{ configured, mode, message }` (`mode` is `smart_analysis` or `ai`)
- `POST /api/v1/trips/:id/assistant/analyze` — `{ summary, budget, health, issues, suggestions, recommendations, mode }`
- `POST /api/v1/trips/:id/assistant/suggestions` — catalog activities stored in PostgreSQL
- `POST /api/v1/trips/:id/assistant/chat` — `{ answer, relatedSuggestions, mode }`

Existing `/api/v1/trips/:id/ai/*` routes remain for compatibility.

If `AI_PROVIDER` / `AI_API_KEY` / `AI_MODEL` are empty, responses use **Smart Analysis Mode**. If a provider is configured but unreachable, assistant chat falls back to that same engine instead of failing the page.

The assistant never writes trips, expenses, or activities.

### Fallback (no key, or analysis when the model fails)

Deterministic **Smart analysis** still:

- Uses recorded budget remaining
- Flags empty days, overloaded days, and time overlaps (same rules as the trip calendar)
- Flags destinations with no activities and unscheduled activities
- Suggests the existing in-app activity catalog

The page shows “AI Assistant is not configured yet.” when `AI_API_KEY` is missing. Other GlobeTrotter features keep working.

### Security

- JWT + trip ownership on every AI route
- No API keys in the client bundle or API JSON
- Provider timeouts and redacted error logs
- Prompts include only trip planning fields (no passwords, no other users)


