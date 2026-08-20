# Electro-Matic Configurators

Next.js App Router site for configuring Electro-Matic power and cooling distribution products:

- **Siemens Panelboards** (`/panelboards`) — frame selection, guided per-slot breaker assignment, live panel drawing
- **Power Distribution Panels** (`/pdp`) — Weld PDP (200/400/600 A) and Control PDP (60/100/200/400 A) with full model-number nomenclature and slot-capacity rules
- **Power Distribution Units** (`/pdu`) — EMPDU 500/750/1000 kVA
- **Remote Power Panels** (`/rpp`) — EMRPP 50–250 kVA
- **Cooling Distribution Units** (`/cdu`) — placeholder until requirements land

Every configurator supports: JSON configuration export/import, PNG drawing download, CSV bill-of-materials export, and a branded print-to-PDF BOM sheet.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4
- Drizzle ORM + Postgres (Siemens panelboard catalog; optional — seeded fallback data is used without a database)

## Quick Start

```bash
npm install
npm run dev
```

## Database Setup (optional, panelboard catalog + admin)

1. Create a Postgres database and set `DATABASE_URL` in `.env`.
2. Push the schema and seed:

```bash
npm run db:push
npm run db:seed
```

`/admin` manages the panelboard catalog (frames, slots, breakers, accessories, cover plates).

## Brand

Electro-Matic palette (`#005DAA` primary, `#E29024` accent), Titillium Web display + Open Sans body, logo assets in `public/brand/`.
