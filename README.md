# FuelEU Maritime Compliance Platform

> Full-stack compliance dashboard implementing **FuelEU Maritime Regulation (EU) 2023/1805** — Articles 20–21 (Banking & Pooling), Annex IV.

## Architecture Overview

This project follows **Hexagonal Architecture** (Ports & Adapters / Clean Architecture) in both frontend and backend:

```
Core (Domain + Use-Cases + Ports)   ←  no framework dependencies
        ↓
Adapters (inbound HTTP / outbound Postgres / React UI)
        ↓
Infrastructure (Express server, PG connection, Vite/React)
```

The domain layer is framework-free and fully unit-testable. Frameworks touch only the adapters and infrastructure layers.

### Backend structure
```
backend/src/
  core/
    domain/       # Route, Compliance, Banking, Pooling entities + formulas
    application/  # Use-cases: RouteUseCases, ComplianceUseCases, etc.
    ports/        # Repository interfaces (IRouteRepository, etc.)
  adapters/
    inbound/http/    # Express route handlers
    outbound/postgres/ # PostgreSQL repository implementations
  infrastructure/
    db/           # connection.ts, migrate.ts, seed.ts
    server/       # app.ts (DI wiring), index.ts
  __tests__/
    unit/         # Pure domain + use-case tests
    integration/  # HTTP endpoint tests (Supertest)
```

### Frontend structure
```
frontend/src/
  core/domain/    # Shared types, constants (no React deps)
  adapters/
    infrastructure/ # apiClient.ts (fetch wrapper)
    ui/             # Custom hooks + React tab components
  __tests__/      # Vitest tests
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript (strict), TailwindCSS, Recharts |
| Backend | Node.js 20, TypeScript (strict), Express 4 |
| Database | PostgreSQL 15 |
| Testing | Jest + Supertest (backend), Vitest + Testing Library (frontend) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

---

## Setup & Run

### Option A — Docker Compose (Recommended, zero setup)

```bash
# Clone the repo
git clone https://github.com/your-username/fueleu-maritime.git
cd fueleu-maritime

# Build and start all services (postgres + backend + frontend)
docker-compose up --build

# App will be available at:
# Frontend: http://localhost
# Backend API: http://localhost:3001
# Health check: http://localhost:3001/health
```

### Option B — Local Development (VSCode)

**Prerequisites:** Node.js 20+, PostgreSQL 15 running locally

#### 1. Start PostgreSQL only via Docker
```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### 2. Backend setup
```bash
cd backend

# Copy environment file
cp .env.example .env
# Edit .env if needed (default: postgres/postgres on localhost:5432)

# Install dependencies
npm install

# Run database migrations + seed
npm run db:migrate
npm run db:seed

# Start dev server (hot reload)
npm run dev
# → API running at http://localhost:3001
```

#### 3. Frontend setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
# → Dashboard at http://localhost:5173
```

---

## Running Tests

### Backend tests
```bash
cd backend

# All tests
npm test

# Unit tests only (no DB required)
npm run test:unit

# Integration tests (requires PostgreSQL)
npm run test:integration

# Coverage report
npm run test:coverage
```

### Frontend tests
```bash
cd frontend

# All tests
npm test

# Coverage report
npm run test:coverage
```

---

## API Endpoints

### Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | All routes (filters: vesselType, fuelType, year) |
| POST | `/routes/:routeId/baseline` | Set route as baseline |
| GET | `/routes/comparison` | Baseline vs all routes with % diff |

### Compliance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/compliance/cb?shipId&year` | Compute & store CB snapshot |
| GET | `/compliance/adjusted-cb?shipId&year` | CB after bank applications |

### Banking (Article 20)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/banking/records?shipId&year` | Banking history |
| POST | `/banking/bank` | Bank positive CB surplus |
| POST | `/banking/apply` | Apply banked surplus to deficit |

### Pooling (Article 21)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pools` | List pools (optional ?year) |
| POST | `/pools` | Create pool with greedy allocation |
| GET | `/pools/:poolId` | Get pool details |

---

## Core Formulas (FuelEU Annex IV)

```
Target Intensity (2025) = 89.3368 gCO₂e/MJ
Energy in Scope (MJ)    = fuelConsumption(t) × 41,000 MJ/t
Compliance Balance      = (Target − Actual) × Energy in Scope
  > 0 → Surplus  |  < 0 → Deficit

Comparison % Diff       = ((comparison / baseline) − 1) × 100
```

---

## Sample API Requests

```bash
# Get all routes
curl http://localhost:3001/routes

# Set R001 as baseline
curl -X POST http://localhost:3001/routes/R001/baseline

# Get compliance balance for R002 in 2024
curl "http://localhost:3001/compliance/cb?shipId=R002&year=2024"

# Bank surplus
curl -X POST http://localhost:3001/banking/bank \
  -H "Content-Type: application/json" \
  -d '{"shipId":"R002","year":2024,"amount":500000}'

# Create pool
curl -X POST http://localhost:3001/pools \
  -H "Content-Type: application/json" \
  -d '{"year":2024,"memberShipIds":["R002","R003"]}'
```

---

## Environment Variables

**Backend (`.env`):**
```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fueleu_db
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

## Reference

- Fuel EU Maritime Regulation **(EU) 2023/1805**, Annex IV — GHG intensity targets
- Articles 20–21 — Banking and Pooling rules
- ESSF SAPS WS1 FuelEU calculation methodologies (May 2025)
