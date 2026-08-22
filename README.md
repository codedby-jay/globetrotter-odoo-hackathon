# GlobeTrotter

Personalized multi-city travel planning for the Odoo × LDCE Ahmedabad Hackathon 26.

This repository contains the project foundation, PostgreSQL / Prisma travel graph, and JWT authentication. Trip planning APIs are not implemented yet.

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

Auth endpoints live under `/api/v1/auth` (`signup`, `login`, `me`, `logout`, `forgot-password`, `reset-password`). Forgotten-password emails are not sent; the reset URL is printed in the backend console.

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

See `.env.example`. Copy it to `.env` at the repository root and to `server/.env`. Do not commit secrets.
