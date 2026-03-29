# Concert Ticket Reservation

A full-stack concert ticket reservation system built with **Next.js 16** (frontend) and **NestJS** (backend), using **PostgreSQL** as the database.

## Architecture

```
ticket-app/
├── frontend/                          # Next.js 16 (React 19, TypeScript, Tailwind CSS v4)
│   ├── app/                           # App Router pages
│   │   ├── page.tsx                   # Landing page (Server Component)
│   │   ├── layout.tsx                 # Root layout with metadata
│   │   ├── admin/page.tsx             # Admin dashboard (overview + create concert)
│   │   ├── admin/history/page.tsx     # Admin reservation history
│   │   ├── concerts/page.tsx          # User concert listing (reserve/cancel)
│   │   └── concerts/history/page.tsx  # User reservation history
│   ├── components/                    # Reusable UI components
│   │   ├── Sidebar.tsx                # Responsive sidebar with mobile drawer
│   │   ├── StatCards.tsx              # Dashboard stat cards
│   │   ├── ConcertCard.tsx            # Concert card with action button
│   │   ├── DeleteModal.tsx            # Delete confirmation modal
│   │   └── Toast.tsx                  # Success/error notification toast
│   └── lib/                           # Shared utilities
│       ├── api.ts                     # Axios instance (configurable base URL)
│       ├── fetcher.ts                 # SWR fetcher function
│       └── types.ts                   # Shared TypeScript interfaces
├── backend/                           # NestJS (TypeORM, class-validator)
│   └── src/
│       ├── concerts/                  # Concerts module (entity, controller, service, DTO)
│       ├── reservations/              # Reservations module (entity, history entity, controller, service, DTO)
│       ├── users/                     # Users module (entity, controller, service, DTO)
│       ├── migrations/                # TypeORM database migrations
│       ├── data-source.ts             # TypeORM CLI data source config
│       └── main.ts                    # App bootstrap (CORS, validation pipe)
├── compose.yml                        # Docker Compose (PostgreSQL, backend, frontend)
└── README.md
```

### Frontend
- **Next.js 16** with App Router — Server Components for the landing page, Client Components for interactive pages
- **SWR** for client-side data fetching with automatic caching and revalidation
- **Tailwind CSS v4** with mobile-first responsive design (breakpoints: `sm:`, `md:`)
- Custom CSS variables in `globals.css` for theming
- Reusable components with TypeScript interfaces for type safety

### Backend
- **NestJS** with modular architecture (Concerts, Reservations, Users)
- **TypeORM** as the ORM with PostgreSQL
- **class-validator** for server-side request validation (DTOs with decorators)
- Database versioning with **TypeORM migrations** (5 migration files)
- RESTful API with proper HTTP status codes (201 Created, 204 No Content)
- Smart delete for concerts: soft delete when reservations exist, hard delete when none

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
- `reservations.concertId` → `concerts.id` (CASCADE on delete)
- `reservation_history.concertId` → `concerts.id` (SET NULL on delete)
- Concerts use **smart delete** — if a concert has active reservations, it is soft-deleted (`deletedAt` column set) to preserve reservations and history; if no one has booked, it is hard-deleted from the database

## Features

### Admin
- Dashboard with stats (total seats, reserved, cancelled — computed server-side)
- Create new concerts with client-side and server-side validation
- Delete concerts with confirmation modal (soft delete if booked, hard delete if not)
- View all users' reservation history

### User
- Browse all concerts including sold-out ones (with "Sold Out" indicator)
- Reserve a seat (1 per user per concert, enforced server-side)
- Cancel reservations with loading state feedback
- View own reservation history

### Error Handling
- Server-side validation via `class-validator` DTOs (`@IsNotEmpty`, `@IsInt`, `@Min`, `@MaxLength`)
- Validation errors returned as structured JSON and displayed on the client
- Toast notifications for success and error states
- Empty states and error states for all data views
- Loading states on action buttons during API calls

### Responsive Design
- Mobile-first approach — base styles for mobile, `sm:`/`md:` breakpoints for larger screens
- Collapsible sidebar with hamburger menu on mobile, static sidebar on desktop
- Responsive grids (stat cards, form fields), tables, modals, and toast notifications

## Setup & Running Locally

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### 1. Start the database

```bash
docker compose up postgres -d
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

The `.env.example` contains default values that work with the Docker Compose PostgreSQL setup.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Or run everything with Docker Compose

```bash
docker compose up --build
```

The backend waits for PostgreSQL to be healthy before starting (via `depends_on` with health check).

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Running Unit Tests

```bash
cd backend
npm test
```

**41 unit tests** covering all modules:

| Module | Tests | Coverage |
|--------|-------|----------|
| ConcertsService | 9 | findAll, findOne, create, soft-remove (with reservations), hard-remove (no reservations), getStats (with data, empty) |
| ConcertsController | 5 | findAll, findOne, create, remove, getStats |
| ReservationsService | 7 | create, duplicate check, no-seats check, cancel, findByUser, history |
| ReservationsController | 5 | create, cancel, findByUser, findAllHistory, findUserHistory |
| UsersService | 4 | findAll, findOne, not-found error, create |
| UsersController | 3 | findAll, findOne, create |
| AppController | 1 | root endpoint |

To run with coverage report:
```bash
npm run test:cov
```

## Libraries & Packages

### Frontend
| Package | Purpose |
|---------|---------|
| next 16 | React framework with App Router, Server/Client Components |
| react 19 | UI library |
| swr | Client-side data fetching with caching and revalidation |
| axios | HTTP client for API calls |
| tailwindcss v4 | Utility-first CSS framework (mobile-first responsive design) |

### Backend
| Package | Purpose |
|---------|---------|
| @nestjs/core | Server framework with dependency injection |
| @nestjs/typeorm + typeorm | ORM for PostgreSQL with migrations and soft delete |
| class-validator + class-transformer | Server-side request validation via decorators |
| pg | PostgreSQL driver |
| @nestjs/config | Environment variable management |

## API Endpoints

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| GET | /concerts | 200 | List all concerts (excludes soft-deleted) |
| GET | /concerts/:id | 200 | Get a concert by ID |
| GET | /concerts/stats/summary | 200 | Get stats (total seats, reserved, cancelled) |
| POST | /concerts | 201 | Create a concert |
| DELETE | /concerts/:id | 204 | Delete a concert (soft if booked, hard if not) |
| POST | /reservations | 201 | Create a reservation |
| DELETE | /reservations/:id | 204 | Cancel a reservation |
| GET | /reservations | 200 | List all reservations |
| GET | /reservations/user/:userId | 200 | Get reservations for a user |
| GET | /reservations/history | 200 | Get all reservation history |
| GET | /reservations/history/user/:userId | 200 | Get history for a user |
| GET | /users | 200 | List all users |
| POST | /users | 201 | Create a user |

## Bonus: Scaling Considerations

### How to optimize the website for intensive data and high traffic

1. **Caching layer**: Add Redis to cache frequently read data (concert listings, stats summary). Invalidate on write operations. SWR on the frontend already provides client-side caching.
2. **Database optimization**: Add indexes on foreign key columns (`userId`, `concertId`) and frequently queried fields. Use `EXPLAIN ANALYZE` to identify slow queries.
3. **Pagination**: Implement cursor-based pagination for concert listings and history tables to avoid loading unbounded datasets.
4. **CDN & static optimization**: Serve static assets via CDN. Next.js standalone output already optimizes bundle size.
5. **Horizontal scaling**: Deploy multiple backend instances behind a load balancer. NestJS is stateless by design, making this straightforward.
6. **Connection pooling**: Use PgBouncer for efficient database connection management under high concurrency.
7. **Read replicas**: Route read queries (concert listings, stats) to PostgreSQL read replicas to reduce load on the primary.

### How to handle concurrent ticket reservations (prevent overselling)

The goal is to ensure no concert has more reservations than seats — no one should need to stand during the show.

1. **Database transactions with row-level locking**: Wrap the check-and-reserve logic in a transaction using `SELECT ... FOR UPDATE` (pessimistic locking) on the concert row. This prevents two concurrent requests from both reading the same seat count and both succeeding.

2. **Unique constraint**: Add a unique constraint on `(userId, concertId)` in the reservations table. This enforces the "1 seat per user" rule at the database level, even if the application-level check has a race condition.

3. **Atomic count check**: Instead of counting reservations in application code, use a single atomic SQL query:
   ```sql
   INSERT INTO reservations (userId, concertId)
   SELECT :userId, :concertId
   WHERE (SELECT COUNT(*) FROM reservations WHERE concertId = :concertId) < (SELECT seats FROM concerts WHERE id = :concertId)
   ```

4. **Queue-based processing**: For extremely high-traffic concerts (e.g., thousands of concurrent requests), use a message queue (BullMQ/Redis) to serialize reservation requests per concert. This trades latency for correctness.

5. **Optimistic locking alternative**: Add a `version` column to the concert table. Each reservation attempt reads the version, then uses `UPDATE ... WHERE version = :version` to detect conflicts. Retry on failure.
