# ⚡ Sports Engine

A real-time sports score tracking application with live commentary. Matches and commentary update instantly via WebSockets — no page refresh needed.

**Live Demo:** [sports-engine-one.vercel.app](https://sports-engine-one.vercel.app)
**API:** [sports-engine-n2eg.onrender.com](https://sports-engine-n2eg.onrender.com)

---

## Features

- **Live Scores** — Match scores stream in real time over WebSockets.
- **Live Commentary** — Subscribe to a match and receive commentary events as they happen.
- **Match Listing** — Browse all scheduled, live, and finished matches.
- **Match Detail View** — Scoreboard with a scrolling commentary feed.
- **Connection Indicator** — Visual dot showing the WebSocket connection status.
- **Rate Limiting & Bot Protection** — Arcjet shields the API with sliding-window rate limits, bot detection, and request shielding.
- **Input Validation** — All request bodies and query params validated with Zod schemas.

---

## Tech Stack

### Frontend

| Technology         | Purpose               |
| ------------------ | --------------------- |
| **React 19**       | UI framework          |
| **TypeScript**     | Type safety           |
| **Vite 7**         | Dev server & bundler  |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing   |

### Backend

| Technology      | Purpose                                         |
| --------------- | ----------------------------------------------- |
| **Express 5**   | HTTP framework                                  |
| **Bun**         | Runtime & package manager                       |
| **TypeScript**  | Type safety                                     |
| **Drizzle ORM** | Type-safe SQL queries & migrations              |
| **PostgreSQL**  | Relational database                             |
| **ws**          | WebSocket server                                |
| **Zod 4**       | Request validation                              |
| **Arcjet**      | Rate limiting, bot detection, request shielding |
| **APM Insight** | Application performance monitoring              |

### Deployment

| Service    | What it hosts             |
| ---------- | ------------------------- |
| **Vercel** | Frontend (static SPA)     |
| **Render** | Backend (Node/Bun server) |

---

## Project Structure

```
├── frontend/               React SPA
│   ├── src/
│   │   ├── api/            HTTP client (fetchMatches, fetchCommentary)
│   │   ├── components/     MatchCard, StatusBadge, CommentaryItem, ConnectionDot
│   │   ├── hooks/          useWebSocket custom hook
│   │   ├── pages/          MatchListPage, MatchDetailPage
│   │   └── types.ts        Shared TypeScript interfaces
│   └── .env.production     Production API & WS URLs
│
├── backend/                Express + WebSocket server
│   ├── src/
│   │   ├── db/             Drizzle schema & database connection
│   │   ├── routes/         REST endpoints (matches, commentary)
│   │   ├── validation/     Zod schemas for request validation
│   │   ├── ws/             WebSocket server (subscribe/unsubscribe per match)
│   │   ├── seed/           Database seeder
│   │   └── utils/          Helpers (match status calculator)
│   ├── drizzle/            SQL migrations
│   └── arcjet.ts           Arcjet security configuration
```

---

## API Endpoints

### Matches

| Method | Path                | Description                        |
| ------ | ------------------- | ---------------------------------- |
| `GET`  | `/matches?limit=50` | List matches (newest first)        |
| `POST` | `/matches`          | Create a match (broadcasts via WS) |

### Commentary

| Method | Path                                | Description                                |
| ------ | ----------------------------------- | ------------------------------------------ |
| `GET`  | `/matches/:id/commentary?limit=100` | List commentary for a match                |
| `POST` | `/matches/:id/commentary`           | Add commentary (broadcasts to subscribers) |

---

## WebSocket Protocol

Connect to `wss://<host>/ws`. Messages are JSON.

### Client → Server

```json
{ "type": "subscribe", "matchId": 1 }
{ "type": "unsubscribe", "matchId": 1 }
```

### Server → Client

```json
{ "type": "welcome" }
{ "type": "match_created", "data": { ... } }
{ "type": "commentary", "data": { ... } }
{ "type": "subscribed", "matchId": 1 }
{ "type": "unsubscribed", "matchId": 1 }
{ "type": "error", "error": "..." }
```

---

## Database Schema

**matches**
| Column | Type |
| --- | --- |
| `id` | serial (PK) |
| `sport` | text |
| `home_team` | text |
| `away_team` | text |
| `status` | enum: scheduled, live, finished |
| `home_score` | integer |
| `away_score` | integer |
| `start_time` | timestamp |
| `end_time` | timestamp |
| `created_at` | timestamp |

**commentary**
| Column | Type |
| --- | --- |
| `id` | serial (PK) |
| `match_id` | integer (FK → matches) |
| `minute` | integer |
| `sequence` | integer |
| `period` | text |
| `event_type` | text |
| `actor` | text |
| `team` | text |
| `message` | text |
| `metadata` | jsonb |
| `tags` | text[] |
| `created_at` | timestamp |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.3+)
- [Node.js](https://nodejs.org) (v18+ for frontend tooling)
- PostgreSQL database

### Backend

```bash
cd backend
bun install

# Create a .env file with:
#   DATABASE_URL=postgresql://user:pass@host:5432/dbname
#   PORT=3000
#   HOST=0.0.0.0
#   FRONTEND_URL=http://localhost:5173
#   ARCJET_KEY=your_arcjet_key
#   ARCJET_MODE=DRY_RUN

# Run migrations
bunx drizzle-kit push

# Seed the database (optional)
bun run seed

# Start the server
bun run dev
```

### Frontend

```bash
cd frontend
npm install

# Create a .env file with:
#   VITE_API_URL=http://localhost:3000
#   VITE_WS_URL=ws://localhost:3000

npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables

### Backend

| Variable       | Description                             |
| -------------- | --------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string            |
| `PORT`         | Server port                             |
| `HOST`         | Bind address (`0.0.0.0` for production) |
| `FRONTEND_URL` | Allowed CORS origin (no trailing slash) |
| `ARCJET_KEY`   | Arcjet API key                          |
| `ARCJET_MODE`  | `LIVE` or `DRY_RUN`                     |

### Frontend

| Variable       | Description                |
| -------------- | -------------------------- |
| `VITE_API_URL` | Backend API base URL       |
| `VITE_WS_URL`  | Backend WebSocket base URL |

---

## License

MIT
