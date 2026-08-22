# GlobeTrotter

Personalized multi-city travel planning for the Odoo × LDCE Ahmedabad Hackathon 26.

This repository currently contains the **project foundation only**: a Vite + React client, an Express API with a health check, Prisma connected to PostgreSQL, and Docker Compose for a local database. Authentication, models, and product features are not implemented yet.

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Lucide React, Recharts
- Backend: Node.js, Express, Prisma, JWT, bcrypt, Zod
- Database: PostgreSQL

## Prerequisites

- Node.js 22+
- Docker (for local PostgreSQL)

## Setup

```bash
cp .env.example .env
cp .env.example server/.env
cd client && npm install
cd ../server && npm install
```

The API loads `.env` from the repository root. Prisma CLI loads `server/.env`.

## Start PostgreSQL

```bash
docker compose up -d
```

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

See `.env.example`. Copy it to `.env` at the repository root. Do not commit secrets.
