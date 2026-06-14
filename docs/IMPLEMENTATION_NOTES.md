# Implementation Notes

## Plan coverage

This scaffold covers the first working slice from `PLANS.md`:

- P0 foundation: Next.js structure, Ant Design shell, settings screens, integration settings, and stub adapters.
- P1 core: property types, properties, units, occupancy board, tenant master data, leases, and dashboard KPIs.
- P2 preview: invoices, invoice lines, dummy payment links, WA reminder actions, and manual mark-paid affordances.
- P3 preview: ticket inbox, vendor bench, assignment and scheduling states.
- P4 preview: utility meters, readings, PPOB orders, platform fee margin, and stub biller status.
- P5 preview: document index and expiry reminders.

## Data flow next step

Replace `lib/sample-data.ts` with Supabase-backed loaders:

1. Add `lib/supabase/client.ts` and `lib/supabase/server.ts`.
2. Move read models into server components or route handlers.
3. Add server actions for create/update flows.
4. Keep `lib/integrations.ts` as the provider boundary for payments, WA, and PPOB.

## UI locale

The current prototype uses English operational labels with Indonesian domain terms where they matter, such as `kos`, `ruko`, `kontrakan`, `PPOB`, and `KTP`. Ant Design locale can be switched once the default language is confirmed.

## Known local tooling issue

The machine currently has Node.js available, but the global `npm` command cannot resolve its CLI module. Use a repaired npm installation, Corepack-managed package manager, or another local Node package manager before running the app.
