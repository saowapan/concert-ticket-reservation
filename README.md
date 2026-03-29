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
| GET | /users/:id | 200 | Retrieve a user by their ID |

## Bonus

### Optimising for intensive data volumes and high traffic

As the dataset grows and more users access the platform simultaneously, performance can degrade at multiple layers. The following strategies address each bottleneck:

1. **Caching layer** — Introduce Redis to cache frequently accessed data such as concert listings and statistics summaries. Invalidate the cache on write operations. On the frontend, SWR already provides client-side caching with stale-while-revalidate semantics.

2. **Database optimisation** — Add indexes on frequently queried columns (`userId`, `concertId`) and use `EXPLAIN ANALYZE` to identify and resolve slow queries. Our `getStats()` endpoint already uses `SUM()` and `COUNT()` aggregations rather than loading entire datasets into application memory.

3. **Pagination** — Implement cursor-based pagination for concert listings and history tables to avoid transferring unbounded result sets.

4. **CDN and static asset optimisation** — Serve JavaScript, CSS, and other static assets through a CDN such as CloudFront. The Next.js standalone build output is already optimised for this purpose.

5. **Horizontal scaling** — Deploy multiple backend instances behind a load balancer. NestJS is stateless by design, which makes horizontal scaling straightforward.

6. **Connection pooling** — Place PgBouncer in front of PostgreSQL to multiplex application connections efficiently under high concurrency.

7. **Read replicas** — Route read-heavy queries (concert listings, statistics, history) to PostgreSQL read replicas, reserving the primary instance for write operations.

### Handling concurrent ticket reservations without overselling

The central challenge is ensuring that the number of reservations for any concert never exceeds the number of available seats — no attendee should have to stand during the show.

1. **Database transactions with row-level locking** — Wrap the availability check and reservation insert within a single transaction, using `SELECT ... FOR UPDATE` (pessimistic locking) on the concert row. This forces concurrent requests targeting the same concert to queue rather than execute in parallel, eliminating the race condition between checking availability and inserting the reservation.

2. **Unique constraint as a safety net** — Add a database-level unique constraint on `(userId, concertId)` in the reservations table. Even if the application-level duplicate check is subject to a race condition, the database will reject the second insert with a constraint violation, which the application can catch and present as a user-friendly error.

3. **Atomic check-and-insert** — Replace the two-step check-then-insert pattern with a single atomic SQL statement that only inserts when the seat count condition is satisfied:
   ```sql
   INSERT INTO reservations ("userId", "concertId")
   SELECT :userId, :concertId
   WHERE (SELECT COUNT(*) FROM reservations WHERE "concertId" = :concertId)
       < (SELECT seats FROM concerts WHERE id = :concertId)
   ```

4. **Queue-based processing** — For exceptionally high-demand events (thousands of concurrent requests targeting a single concert), introduce a message queue (e.g., BullMQ backed by Redis) to serialise reservation requests per concert. The API returns an immediate acknowledgement, and a background worker processes reservations sequentially. The frontend polls for the outcome or receives updates via WebSocket.

5. **Optimistic locking** — Add a `version` column to the concerts table. Each reservation attempt reads the current version, and the subsequent update includes a `WHERE version = :expectedVersion` clause. If another transaction has modified the row in the interim, the update affects zero rows, signalling a conflict that the application can retry.

For this application's scale, the recommended approach combines **strategy 1** (transaction with row-level locking) and **strategy 2** (unique constraint). Together, they guarantee correctness without introducing additional infrastructure.

### User authentication and authorisation

The current implementation uses a hardcoded user for simplicity, as authentication was not part of the core requirements. In a production environment, I would implement the following:

**Authentication strategy:**

1. **JWT-based authentication** — Implement `POST /auth/register` and `POST /auth/login` endpoints using `@nestjs/jwt` and `@nestjs/passport`. On successful login, the server issues a signed JWT containing the user's ID and role. The frontend stores this token (preferably in an `httpOnly` cookie to mitigate XSS attacks) and attaches it to every subsequent API request via an Axios interceptor.

2. **Social login (Google, Facebook)** — Integrate OAuth 2.0 providers through Passport strategies (`passport-google-oauth20`, `passport-facebook`). The flow would be:
   - The frontend redirects the user to the provider's consent screen.
   - Upon approval, the provider redirects back with an authorisation code.
   - The backend exchanges this code for user profile data, creates or links the account in the database, and issues a JWT as above.
   - Libraries such as **NextAuth.js** on the frontend can simplify session management and support multiple providers with minimal configuration.

3. **Role-based access control (RBAC)** — Apply a custom `@Roles('admin')` decorator combined with a NestJS guard to protect admin-only endpoints (concert creation, deletion, viewing all users' history). User-facing endpoints would extract the `userId` from the JWT payload rather than accepting it as a request parameter, eliminating the possibility of one user acting on behalf of another.

**How this would change the current architecture:**

- The `userId` would no longer be hardcoded on the frontend; it would be derived from the authenticated session.
- API endpoints such as `POST /reservations` would read the user identity from the JWT token rather than the request body, preventing spoofing.
- The sidebar's "Switch to Admin / Switch to User" toggle would be replaced by actual role-based routing, where the interface adapts based on the authenticated user's role.
- A dedicated login/register page would serve as the entry point, with protected routes redirecting unauthenticated users.

### API security

Beyond authentication, the following measures would harden the API against common attack vectors:

1. **Rate limiting** — Apply `@nestjs/throttler` to cap the number of requests per client (e.g., 100 requests per minute per IP). This mitigates brute-force login attempts and prevents a single client from overwhelming the server. Critical endpoints such as `POST /reservations` could have stricter limits to deter automated ticket-grabbing bots.

2. **CORS restriction** — The current configuration enables CORS for all origins (`app.enableCors()`). In production, this should be locked down to the frontend's domain only:
   ```typescript
   app.enableCors({
     origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
     credentials: true,
   });
   ```

3. **Helmet** — Integrate the `helmet` middleware to set security-related HTTP headers (Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security). This provides defence-in-depth against XSS, clickjacking, and MIME-type sniffing attacks with a single line of configuration.

4. **Input sanitisation** — The application already uses `class-validator` with `whitelist: true` in the global validation pipe, which strips any properties not defined in the DTO. This prevents mass-assignment vulnerabilities where a client attempts to set fields such as `role` or `id` directly.

5. **HTTPS enforcement** — All traffic should be served over TLS in production. Terminate SSL at the load balancer or reverse proxy (Nginx, AWS ALB) and redirect HTTP requests to HTTPS. Set the `Secure` and `SameSite` flags on authentication cookies to prevent interception and CSRF attacks.

6. **Request payload limits** — Configure maximum request body sizes to prevent denial-of-service attacks via oversized payloads:
   ```typescript
   app.use(json({ limit: '1mb' }));
   ```

7. **SQL injection prevention** — TypeORM's parameterised queries already protect against SQL injection. All user input passes through the ORM's query builder or repository methods, which escape values automatically. Raw SQL queries (such as those in migrations) do not accept user input and are therefore safe.

8. **Dependency auditing** — Run `npm audit` regularly and integrate it into the CI pipeline to detect and patch known vulnerabilities in third-party packages before they reach production.

### CI/CD pipeline

To ensure code quality and enable reliable deployments, I would set up a GitHub Actions pipeline with the following stages:

**Continuous Integration (on every pull request and push to `main`):**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: ticket_db_test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd backend && npm ci
      - run: cd backend && npm run lint
      - run: cd backend && npm test
      - run: cd backend && npm run build

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run build
```

**Pipeline stages explained:**

1. **Lint** — Run ESLint on both frontend and backend to enforce code style and catch issues early. Pull requests with lint failures are blocked from merging.

2. **Test** — Execute the full unit test suite against a real PostgreSQL instance (spun up as a GitHub Actions service container). This validates all CRUD operations, business logic, and edge cases in an environment that mirrors production.

3. **Build** — Compile both the NestJS backend (`npm run build`) and the Next.js frontend (`npm run build`) to verify that the code produces valid production artefacts. TypeScript type errors surface at this stage.

4. **Security audit** — Run `npm audit` as part of the pipeline to flag known vulnerabilities in dependencies before they reach production.

**Continuous Deployment (on merge to `main`):**

For deployment, the pipeline would extend with:

1. **Docker image build** — Build multi-stage Docker images for both services and push them to a container registry (GitHub Container Registry, AWS ECR, or Docker Hub).

2. **Database migration** — Run `npm run migration:run` against the production database as a pre-deployment step. This ensures schema changes are applied before the new application version starts serving traffic.

3. **Staged rollout** — Deploy to a staging environment first, run smoke tests (health check endpoints, critical user flows), and then promote to production. Use blue-green or rolling deployment strategies to achieve zero-downtime releases.

4. **Rollback plan** — Tag each release with a Git tag and Docker image tag. If a deployment introduces a regression, revert to the previous image and run `npm run migration:revert` to undo the most recent schema change.

**Branch protection rules:**

- Require all CI checks to pass before merging pull requests
- Require at least one code review approval
- Prevent force-pushes to `main`
- Automatically delete merged branches to keep the repository clean