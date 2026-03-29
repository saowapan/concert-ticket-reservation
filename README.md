# Concert Ticket Reservation

A full-stack web application for managing and reserving concert tickets, built with **Next.js 16** on the frontend and **NestJS** on the backend, backed by a **PostgreSQL** database.


### Frontend

- **Next.js 16** with App Router — leverages Server Components for the landing page and Client Components for interactive views
- **SWR** for client-side data fetching with built-in caching, revalidation, and optimistic updates
- **Tailwind CSS v4** following a mobile-first responsive approach (`sm:` and `md:` breakpoints)
- Custom CSS variables defined in `globals.css` for consistent theming
- Fully typed components using TypeScript interfaces for compile-time safety
- URL-driven tab navigation on the admin dashboard via query parameters

### Backend

- **NestJS** organised into modular domains (Concerts, Reservations, Users)
- **TypeORM** as the ORM, configured with PostgreSQL
- **class-validator** for declarative server-side request validation through DTOs
- Database versioning managed through **TypeORM migrations** (6 migration files)
- RESTful API design with appropriate HTTP status codes (201 Created, 204 No Content)
- Smart deletion logic for concerts: archives (soft deletes) concerts that have active reservations, and permanently removes those without any bookings

### Database Schema

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     concerts      │     │   reservations    │     │      users       │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id (PK)          │◄────│ concertId (FK)   │     │ id (PK)          │
│ name             │     │ userId (FK)      │────►│ username         │
│ description      │     │ createdAt        │     │ email            │
│ seats            │     │ id (PK)          │     │ role             │
│ deletedAt (soft) │     └──────────────────┘     └──────────────────┘
└──────────────────┘
                         ┌──────────────────────┐
                         │  reservation_history  │
                         ├──────────────────────┤
                         │ id (PK)              │
                         │ userId (FK)          │
                         │ concertId (FK, NULL)  │
                         │ action               │
                         │ createdAt            │
                         └──────────────────────┘
```

**Key relationships:**

- `reservations.concertId` → `concerts.id` with `ON DELETE CASCADE` — when a concert is removed, its reservations are cleaned up automatically
- `reservation_history.concertId` → `concerts.id` with `ON DELETE SET NULL` — historical records are preserved even after the associated concert is deleted
- Concerts employ a **smart deletion strategy**: if a concert has active reservations, it is soft-deleted (the `deletedAt` timestamp is set) so that existing bookings and audit history remain intact. Concerts with no reservations are permanently deleted from the database. Soft-deleted concerts can be restored via the "Deleted" tab in the admin dashboard.

## Features

### Admin

- **Dashboard** displaying aggregated statistics (total seats, active reservations, and cancellations), all computed server-side for performance
- **Create** new concerts with both client-side and server-side validation
- **Delete** concerts through a confirmation modal that warns when active reservations exist
- **Deleted tab** showing archived concerts with the ability to restore (publish) them
- **History** view of all users' reservation activity
- URL-driven tabs (`/admin`, `/admin?tab=create`, `/admin?tab=deleted`) enabling direct linking and browser navigation

### User

- **Browse** all concerts, including those that are sold out (displayed with a disabled "Sold Out" indicator)
- **Reserve** a seat — limited to one seat per user per concert, enforced on the server
- **Cancel** existing reservations with optimistic UI updates (no page jump or flash)
- **History** of personal reservation activity


## Setup & Running Locally

### Prerequisites

- Node.js 20 or later
- Docker and Docker Compose

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

The `.env.example` file contains sensible defaults that correspond to the Docker Compose PostgreSQL configuration.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Alternatively, run everything with Docker Compose

```bash
docker compose up --build
```

The backend service is configured to wait until PostgreSQL passes its health check before starting, ensuring reliable database connectivity on first launch.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## Running Unit Tests

```bash
cd backend
npm test
```

## API Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | /concerts | 200 | Retrieve all active concerts (soft-deleted concerts are excluded) |
| GET | /concerts/deleted | 200 | Retrieve all archived (soft-deleted) concerts |
| GET | /concerts/:id | 200 | Retrieve a single concert by its ID |
| GET | /concerts/stats/summary | 200 | Retrieve aggregated statistics (total seats, reservations, cancellations) |
| POST | /concerts | 201 | Create a new concert |
| POST | /concerts/:id/restore | 200 | Restore a previously archived concert |
| DELETE | /concerts/:id | 204 | Delete a concert (archived if it has active reservations, otherwise permanently removed) |
| POST | /reservations | 201 | Create a new reservation |
| DELETE | /reservations/:id | 204 | Cancel an existing reservation |
| GET | /reservations | 200 | Retrieve all reservations |
| GET | /reservations/user/:userId | 200 | Retrieve reservations belonging to a specific user |
| GET | /reservations/history | 200 | Retrieve the complete reservation history |
| GET | /reservations/history/user/:userId | 200 | Retrieve reservation history for a specific user |

## Bonus

### 1. how to optimize your website

- **Redis caching** for concert listings and stats, with cache invalidation on writes. SWR on the frontend already provides client-side caching.
- **Database indexing** on `userId` and `concertId` columns, plus `EXPLAIN ANALYZE` to identify slow queries. The `getStats()` endpoint already uses `SUM()`/`COUNT()` aggregations instead of loading data into memory.
- **Cursor-based pagination** for concert listings and history tables to avoid unbounded result sets.
- **CDN** for static assets (JS, CSS) via CloudFront. Next.js standalone output is already optimised for this.
- **Horizontal scaling** with multiple stateless NestJS instances behind a load balancer.
- **PgBouncer** for database connection pooling under high concurrency.
- **Read replicas** to offload read-heavy queries from the primary PostgreSQL instance.

### 2. about how to handle when many users want to reserve the ticket at the same time?

The goal: no concert should have more reservations than seats — no one stands during the show.

- **Row-level locking** — `SELECT ... FOR UPDATE` inside a transaction serialises concurrent reservations for the same concert, eliminating the race condition between checking availability and inserting.
- **Unique constraint** on `(userId, concertId)` as a database-level safety net, ensuring one seat per user even if the application check has a race condition.
- **Atomic SQL** — a single `INSERT ... SELECT ... WHERE count < seats` statement that combines the check and insert into one atomic operation.
- **Queue-based processing** (BullMQ/Redis) for extremely high-demand events, serialising requests per concert with async status polling.
- **Optimistic locking** via a `version` column on concerts, detecting conflicts with `WHERE version = :expected`.

**Recommended approach:** combine row-level locking + unique constraint for correctness without additional infrastructure.

## What can we do to make the system better

### 1. User authentication and authorisation

The current implementation uses a hardcoded user, as authentication was not in scope. In production, I would add:

- **JWT authentication** via `@nestjs/jwt` and `@nestjs/passport` — `POST /auth/register` and `POST /auth/login` endpoints, with tokens stored in `httpOnly` cookies to prevent XSS.
- **Social login** (Google, Facebook) via OAuth 2.0 Passport strategies, or **NextAuth.js** on the frontend for simplified multi-provider session management.
- **Role-based access control** using a `@Roles('admin')` guard to protect admin endpoints. User identity extracted from the JWT payload instead of the request body.
- This would replace the hardcoded `userId`, the "Switch to Admin/User" toggle, and add a dedicated login page with protected route redirects.

### 2. API security

- **Rate limiting** (`@nestjs/throttler`) — e.g., 100 req/min per IP, stricter on reservation endpoints to deter bots.
- **CORS restriction** — lock `enableCors()` to the frontend domain only, with `credentials: true`.
- **Helmet** middleware for security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options).
- **Input sanitisation** — already handled by `class-validator` with `whitelist: true`, stripping unknown properties from requests.
- **HTTPS enforcement** — TLS termination at the load balancer, `Secure` and `SameSite` flags on cookies.
- **Payload limits** — `json({ limit: '1mb' })` to prevent oversized request DoS.
- **SQL injection prevention** — already covered by TypeORM's parameterised queries.
- **Dependency auditing** — `npm audit` integrated into the CI pipeline.

### 3. CI/CD pipeline

**Continuous Integration** (on every PR and push to `main`):
- Lint (ESLint) → Test (Jest with real PostgreSQL service container) → Build (NestJS + Next.js) → Security audit (`npm audit`)

**Continuous Deployment** (on merge to `main`):
- Build and push Docker images to a container registry (GHCR, ECR, or Docker Hub)
- Run database migrations as a pre-deployment step
- Staged rollout: deploy to staging → smoke tests → promote to production (blue-green or rolling)
- Rollback via Git tags and Docker image tags; `migration:revert` for schema changes

**Branch protection:** require passing CI + code review approval, block force-pushes to `main`, auto-delete merged branches.