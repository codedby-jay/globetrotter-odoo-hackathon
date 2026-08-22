# GlobeTrotter — Travel Planning Platform

GlobeTrotter is a personalized multi-city travel planning platform for creating itineraries, discovering destinations, managing activities, tracking budgets, and sharing trips.

## Tech Stack

- **Frontend**: React + Vite (port 5173)
- **Backend**: Node.js + Express (port 4000)
- **Database**: MongoDB (port 27017)

## Development

The Cloud Agent environment starts MongoDB automatically and runs the API and frontend dev servers in named terminals.

### Manual commands

```bash
# Install dependencies
./.cursor/scripts/install.sh

# Start MongoDB
./.cursor/scripts/start-mongodb.sh

# Start API server
cd backend && npm run dev

# Start frontend dev server
cd frontend && npm run dev
```

### API Health Check

```bash
curl http://localhost:4000/api/health
```

## Features

- **Discover Destinations** — Browse curated cities with descriptions and tags
- **Create Trips** — Plan multi-city itineraries with budget tracking
- **Manage Activities** — Add activities with dates, costs, and notes
- **Share Trips** — Share your itineraries with the community
- **Budget Tracking** — Visual budget bars show spending vs. budget
