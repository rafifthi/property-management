# RumahHub Property Management

Prototype landlord operations dashboard based on `PLANS.md`.

## What is included

- Next.js App Router scaffold with Ant Design dashboard UI.
- Typed domain models and sample data for properties, units, tenants, leases, invoices, utilities, PPOB orders, tickets, documents, settings, and templates.
- Stub provider interfaces for payment links, WhatsApp notifications, and PPOB biller fulfillment.
- Supabase foundation migration with organization-scoped tables and RLS policies.

## Local setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` when connecting Supabase.

```bash
cp .env.example .env.local
```

## Current prototype scope

The app is a frontend-first P0/P1 prototype with static sample data. It is structured so the next step can replace `lib/sample-data.ts` with Supabase queries and server actions without changing the information architecture.

## Supabase

Apply the foundation migration from:

```text
supabase/migrations/202606140001_foundation.sql
```

The schema follows the plan's multi-tenant-ready model: every organization-owned table carries `organization_id`, access is gated through `memberships`, and integration settings are config-first with `stub | live` modes.
