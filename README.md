# Electro-Matic Siemens PDP Configurator

Production-oriented Next.js App Router configurator for Siemens P5 panelboards sold by Electro-Matic. The seeded catalog starts with the Fori 90-inch P5 800A frame from the supplied drawing.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style local components
- Drizzle ORM
- Postgres
- Clerk authentication

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

The configurator runs with seeded fallback data if `DATABASE_URL` is not set. Saving configurations and admin writes require Postgres.

## Database Setup

1. Create a Postgres database.
2. Set `DATABASE_URL` in `.env`.
3. Push the schema and seed the 90-inch Siemens P5 frame:

```bash
npm run db:push
npm run db:seed
```

## Clerk Setup

Set these values in `.env`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
ADMIN_CLERK_USER_IDS="user_xxx,user_yyy"
```

Admin routes under `/admin` are protected when Clerk is configured. Admin access is granted when the Clerk user ID is listed in `ADMIN_CLERK_USER_IDS` or the Clerk session metadata/public metadata has `role: "admin"`.

On Vercel, set both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for the Production environment. If either key is missing, Clerk is treated as disabled so middleware does not fail before the app renders.

## Routes

- `/` landing page
- `/configurator` public configurator
- `/configurator/[id]` edit a saved configuration
- `/admin` admin dashboard
- `/admin/frames` manage frames
- `/admin/frames/[id]` edit frame metadata and slot coordinates
- `/admin/breakers` manage breaker options
- `/admin/accessories` manage accessories
- `/admin/cover-plates` manage cover plates
- `/admin/configurations` view saved configurations

## Seeded Frame

- Customer/project: Fori / Electro-Matic Products Inc.
- Panel type: Siemens P5
- Catalog number: `P5E90VO800ETS`
- 90-inch, 800A, top-feed, surface-mount panelboard
- Main breaker: `3VA55806EC320AA0`
- Main lug accessory: `3VA95730JB23`
- 4 top 3VA41 slots allowing 20A or 30A
- 16 lower 3VA52 slots allowing 45A, 60A, 100A, 150A, or 200A
- Empty slots automatically receive slot-type cover plates in the BOM

## Exports

The configurator supports:

- Printable quote/PDF through the browser print dialog
- CSV BOM export for spreadsheet workflows

## Development Commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run db:push
npm run db:seed
```
