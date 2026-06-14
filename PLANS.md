# Property Management System — Project Plan

> Status: **Planning** · Last updated: 2026-06-13
> This is the master plan. It will be split into per-module specs once the foundation lands.

---

## 1. Vision

A central hub for property owners to manage and track their rentals end-to-end —
across **kontrakan, kos, ruko, apartemen, and more** — covering properties & units,
tenants, leases, rent payments & reminders, **utilities (metered billing + resold
prepaid tokens/bills with margin)**, maintenance complaints, and documents, with
tenant-facing touchpoints delivered over WhatsApp.

**One-line:** *"From vacant unit to paid invoice to resolved complaint — one dashboard, any property type."*

---

## 2. Confirmed decisions

| Area | Decision | Notes |
|------|----------|-------|
| **Scope** | Multi-tenant **ready**, single owner now | Every table is `organization`-scoped + RLS so it can become SaaS later with no rewrite. |
| **Stack** | **Next.js + Supabase** | Next.js (App Router) frontend/API; Supabase Postgres + Auth + Storage + Edge Functions. |
| **UI library** | **Ant Design** (Arco as alternative) | Enterprise-grade React components suited to a dashboard-heavy UI. App Router SSR via `@ant-design/nextjs-registry`. |
| **Property types** | **Configurable** — kontrakan, kos, ruko, apartemen, custom | One generic model: a **unit** is the atomic rentable space; a **lease** can hold multiple tenants; billing cycle is per-lease (monthly/yearly). Type drives labels, defaults, and which fields show. |
| **WhatsApp** | **Stub now, config-ready** | Dummy provider for the prototype showcase; full Settings UI (provider, credentials, sender, templates) present so a real BSP (Fonnte/Wablas/Qontak) drops in without UI changes. |
| **Payments** | **Stub now, config-ready** | Xendit config settings present; integration stubbed (dummy links) for the prototype. Reminder carries the link; webhook reconciles once live; manual mark-paid always available. |
| **Utilities / PPOB** | **In scope** | Two parts: (a) **metered** utility billing added onto invoices; (b) **resale** of prepaid tokens/bills (token listrik PLN, air/PDAM, etc.) through the platform. Margin is a **platform fee** (flat or %) set in Settings — no per-owner markup. Payable via **WA chatbot or web**. Config-ready now, biller integration stubbed. |

---

## 3. Goals & non-goals

**Goals (prototype → v1)**
- One configurable model that fits **kontrakan, kos, ruko, apartemen,** and custom types.
- Track every unit's occupancy (vacant / occupied / under-maintenance) at a glance.
- Manage tenant master data and multi-tenant leases.
- Generate invoices (rent + utility lines), send WA reminders with a payment link, track paid/overdue.
- **Utilities:** meter-based billing, plus resell prepaid tokens/bills (listrik, air) with a margin, payable over WA.
- Receive tenant complaints via an external form → triage → assign vendor → schedule check.
- Store contracts and personal documents, with expiry reminders.
- A central **Settings** area where WA, payment, and PPOB integrations are configured (stubbed but fully wired in the prototype).

**Non-goals (for now)**
- Self-serve SaaS signup, subscription billing, multi-org admin console (architected for, not built).
- Accounting/tax-grade bookkeeping (we track cashflow, not double-entry).
- Native mobile app (responsive web first; tenants interact via WA + web links).

---

## 4. Personas & roles

| Persona | Access | Primary jobs |
|---------|--------|-------------|
| **Owner / Landlord** | Full | Everything: properties, money, tenants, settings, integrations. |
| **Staff / Admin** | Scoped | Day-to-day ops: record payments, handle tickets, no billing/settings. |
| **Vendor** | Minimal (future) | See assigned tickets + schedule. May be WA-only at first. |
| **Tenant** | No login (v1) | Interacts via WA + public links (complaint form, payment link, utility/token purchase). A tenant portal is a future option. |

Roles enforced via a `memberships` table (`organization_id`, `user_id`, `role`) + RLS.

---

## 5. Architecture overview

```
┌─────────────────────────────────────────────────────────┐
│  Next.js (App Router) + Ant Design                       │
│  • Owner dashboard (authenticated)                       │
│  • Public complaint form  • Public payment / token pages │
│  • Settings (WA / payment / PPOB integrations)           │
│  • Route Handlers / Server Actions for app logic         │
└───────────────┬─────────────────────────┬───────────────┘
                │                          │
        Supabase JS (RLS)          Server-side service role
                │                          │
┌───────────────▼──────────────────────────▼───────────────┐
│  Supabase                                                 │
│  • Postgres (all domain tables, RLS per organization)    │
│  • Auth (owner/staff accounts)                           │
│  • Storage (documents, ticket photos)                    │
│  • Edge Functions: payment-webhook, wa-inbound, cron     │
│  • pg_cron / scheduled functions: invoice gen, reminders │
└───────────────┬───────────┬──────────────┬───────────────┘
                │           │              │
       ┌────────▼───┐ ┌─────▼──────┐ ┌─────▼──────────┐
       │ Payment    │ │ WA BSP     │ │ Biller / PPOB  │
       │ (Xendit)   │ │ (Fonnte…)  │ │ (PLN/PDAM…)    │
       │  [STUB]    │ │  [STUB]    │ │   [STUB]       │
       └────────────┘ └────────────┘ └────────────────┘
```

**Key principles**
- **Multi-tenancy:** every domain row carries `organization_id`; RLS gates access by membership. One org today, N tomorrow.
- **Integrations are config-first:** WA, payment, and PPOB sit behind provider interfaces with a Settings UI. The prototype ships **dummy adapters**; real adapters swap in with no UI change (`mode = stub | live`).
- **Generic property model:** type-driven configuration, not a separate schema per property type.
- **Timezone:** all due-date logic in **Asia/Jakarta**; store timestamps UTC, render local.
- **Money:** integer minor units (store rupiah as `bigint`), never floats. Margins computed and stored explicitly.

---

## 6. Domain model (entities)

```
organization 1─* membership *─1 user
organization 1─* property (type) 1─* unit_group 1─* unit
organization 1─* tenant
unit 1─* lease ;  lease *─* tenant (via lease_tenant)     (active lease ⇒ unit occupied)
lease 1─* invoice 1─* invoice_line 1─* payment
unit 1─* utility_meter 1─* utility_reading → utility_charge → invoice_line
organization 1─* utility_order        (PPOB resale: token listrik / air, base+margin=sell)
organization 1─* vendor
unit/tenant 1─* ticket 1─* ticket_assignment *─1 vendor
organization 1─* document             (optionally linked to tenant/lease/property/unit)
organization 1─* integration_setting  (wa | payment | ppob configs, stub/live)
organization 1─* message_template
organization 1─* notification_log
```

**Core tables (sketch)**

- **organizations** — `id, name, created_at` (the SaaS tenant boundary).
- **memberships** — `org_id, user_id, role (owner|staff|vendor)`.
- **properties** — `id, org_id, name, type (kontrakan|kos|ruko|apartemen|custom), address, notes`.
- **unit_groups** — `id, org_id, property_id, name` (e.g. *Lantai 2*, *Blok A*).
- **units** — `id, org_id, property_id, group_id?, code, base_rent, default_billing_cycle, status (vacant|occupied|maintenance), attributes (jsonb: size, bedrooms, facilities…)`.
- **tenants** — `id, org_id, full_name, phone_wa, email?, id_number (KTP), emergency_contact, notes`.
- **leases** — `id, org_id, unit_id, start_date, end_date, rent_amount, deposit_amount, billing_cycle (monthly|yearly), due_day, status (active|ended|terminated)`.
- **lease_tenants** — `lease_id, tenant_id, role (primary|co)` (supports families / shared rooms / multiple names on one lease).
- **invoices** — `id, org_id, lease_id, period, due_date, total, status (draft|sent|paid|partial|overdue|void), payment_provider_ref?, payment_url?, paid_amount, paid_at?`.
- **invoice_lines** — `id, invoice_id, type (rent|utility|ppob|fee|deposit|discount), description, amount` (an invoice = rent + utility + fee lines).
- **payments** — `id, org_id, invoice_id, amount, method (gateway|cash|transfer), reference, paid_at` (supports partial payments).
- **utility_meters** — `id, org_id, unit_id, type (electricity|water|gas|internet|other), label, tariff_per_unit, notes`.
- **utility_readings** — `id, meter_id, period, prev_reading, curr_reading, usage, amount` (→ becomes a utility `invoice_line`).
- **utility_orders** *(PPOB resale)* — `id, org_id, tenant_id?, unit_id?, product (pln_token|pdam|pulsa|other), customer_ref, base_amount, platform_fee, sell_amount, status, provider_ref?, channel (wa|web), paid_at?` (`sell_amount = base_amount + platform_fee`).
- **vendors** — `id, org_id, name, service_type, phone, notes`.
- **tickets** — `id, org_id, unit_id, tenant_id?, reporter_name, reporter_phone, category, title, description, priority, status (new|triaged|assigned|scheduled|in_progress|resolved|closed), photos[], source (form|manual), created_at`.
- **ticket_assignments** — `id, ticket_id, vendor_id, scheduled_at?, cost?, status`.
- **documents** — `id, org_id, name, category (contract|personal|other), storage_path, related_type?, related_id?, expiry_date?`.
- **integration_settings** — `id, org_id, kind (wa|payment|ppob), provider, config (jsonb; secrets encrypted), mode (stub|live), enabled` (**the config home for the stubbed integrations**).
- **message_templates** — `id, org_id, key (rent_reminder|payment_confirmed|ticket_update|lease_expiry|token_ready), channel (wa), body, variables`.
- **notification_log** — `id, org_id, channel, template, recipient, payload, status, sent_at` (idempotency + audit).
- **audit_log** *(later)* — `id, org_id, actor_id, action, entity, before, after, at`.

> Unit `status` is **derived** from active leases but stored denormalized (with a maintenance override) for fast filtering and an explicit "under repair" state.
> **Property-type flexibility:** kos = many small units (rooms) under one property, monthly cycle; ruko = few units, often yearly; kontrakan = whole-house units. All the same schema — type only changes defaults, labels, and which `attributes` are shown.

---

## 7. Feature modules

### 7.1 Property & Unit Management
- CRUD for properties, unit groups, units — **type-aware** (kontrakan/kos/ruko/apartemen/custom).
- Per-property-type defaults (labels, default billing cycle, suggested attributes); flexible `attributes` jsonb per unit.
- Per-unit base rent; lease can override.
- Occupancy board: filter units by `vacant | occupied | maintenance`, by property, by group, by type.
- Vacancy summary on dashboard (count + % occupancy per property/type).

### 7.2 Tenant Master Data
- CRUD tenants; WA phone is the key contact.
- Tenant profile: current + past leases, payment history, utility orders, tickets.
- KTP / ID handled as **sensitive** (restricted access, stored in private Storage).

### 7.3 Lease / Contract Management
- Create lease: unit + one-or-more tenants (primary + co-tenants), term, rent, deposit, billing cycle, due day.
- Activating a lease flips the unit to `occupied`; ending it flips to `vacant`.
- Expiry & renewal reminders before `end_date`; renewal = clone-and-extend.
- Deposit (*uang jaminan*) tracked for move-out reconciliation.

### 7.4 Payment Tracking & Reminders  — *integration stubbed, config-ready*
- **Invoice generation:** cron creates invoices from active leases; lines = rent (+ utilities, see 7.9).
- **Payment link:** on send, create a gateway invoice → store `payment_url`. **Prototype = dummy link** generated by the stub adapter.
- **WA reminder:** send reminder (H-3, H-day, overdue) with the link via the WA stub.
- **Reconciliation:** payment-webhook Edge Function marks invoice paid once live; manual **mark-paid** works today for cash/transfer.
- **Partial payments** via the `payments` table.
- Overdue / *tunggakan* report; per-tenant arrears.

### 7.5 Complaint / Ticket Tracker
- **External form:** public, no-login page (per-unit link/QR). Tenant identifies by unit code + WA phone, describes issue, attaches photos → creates a `ticket` (`source = form`). Spam control: rate-limit, optional WA OTP / honeypot.
- **Inbox:** triage — category, priority, status.
- **Vendor assignment:** pick from vendor master data, set **scheduled check** date, track cost.
- **Status flow:** `new → triaged → assigned → scheduled → in_progress → resolved → closed`.
- WA updates to the reporter on key transitions (via stub).

### 7.6 Documents Library
- Upload to Supabase Storage; categorize (contract, personal, other).
- Link a document to a tenant / lease / property / unit (or keep standalone).
- **Expiry reminders** (contract end, KTP, permits) surfaced before they lapse.

### 7.7 Dashboard & Reporting
- KPIs: occupancy %, expected vs collected rent, overdue count/total, open tickets, **utility/PPOB margin earned**.
- Arrears list, upcoming lease expiries, recent activity.
- *(Later)* expense tracking → **net income**, per-property/type P&L, occupancy trend.

### 7.8 Notifications (WhatsApp)  — *stubbed, config-ready*
- `NotificationProvider` interface; prototype adapter = **dummy** (logs/echoes instead of sending). Real BSP (Fonnte/Wablas/Qontak) configured in Settings.
- Templated messages from `message_templates` (rent reminder, payment confirmed, ticket update, lease expiry, token ready).
- Every send written to `notification_log` (idempotent, auditable).

### 7.9 Utilities Billing (metered)
- Define `utility_meters` per unit (listrik/air/gas/internet) with a tariff.
- Record periodic `utility_readings`; usage × tariff → a **utility line** appended to the unit's invoice.
- Flat-fee utilities (e.g. fixed monthly internet) supported without a meter.

### 7.10 Utility Purchase / PPOB Resale  — *biller stubbed, config-ready*
- Resell prepaid tokens/bills through the platform: **token listrik (PLN), air (PDAM)**, extensible to pulsa/internet.
- **Margin = platform fee:** `sell_amount = base_amount + platform_fee`; the platform fee is set in Settings (flat or %) and is the platform's revenue. No per-owner markup to tenants.
- **Channels:** tenant can buy/pay via **WA chatbot** or a web link; order recorded in `utility_orders`.
- Flow: select product → enter customer ref (e.g. meter ID) → quote (base + margin) → pay (gateway, stubbed) → biller fulfills (stubbed) → deliver token/receipt via WA.
- Prototype: stub biller returns a fake token + status; config + margin math are real so the flow demos end-to-end.

### 7.11 Settings & Configuration
- **Integrations:** WA, payment, and PPOB each have a config card (`integration_settings`): provider, credentials, sender/number, `mode = stub | live`, enable toggle.
- **Platform fee:** default and per-product platform fee (flat or %) for PPOB resale — the margin.
- **Message templates:** edit WA templates per event.
- **Property-type defaults:** labels, default billing cycle, suggested unit attributes per type.
- **Org profile & roles:** members and role assignment.

---

## 8. Integrations (all behind provider interfaces; prototype ships stubs)

**Payment (Xendit) — `PaymentProvider`**
- Server-side invoice/payment-link creation; keys never client-side.
- Webhook Edge Function with signature verification + idempotency on `payment_provider_ref`.
- **Stub mode:** returns a dummy `payment_url`; mark-paid is manual or simulated.

**WhatsApp BSP — `NotificationProvider`**
- Outbound reminders, confirmations, ticket updates, token delivery.
- Inbound (later): chatbot entry for complaints / payment / token purchase.
- **Stub mode:** logs the message + writes `notification_log` without sending.

**Biller / PPOB — `BillerProvider`**
- Buy PLN token, pay PDAM, etc.; returns token/receipt + cost (the `base_amount`).
- **Stub mode:** returns a fake token and success after a simulated delay.

> Swapping any integration from `stub` → `live` is a Settings change + dropping in the real adapter — no schema or UI rework.

---

## 9. Security & privacy
- RLS on **every** table keyed to `organization_id` via membership; deny-by-default.
- Service-role calls only in server/Edge contexts (invoice gen, webhooks, biller calls).
- Webhook endpoints verify signatures; public form/token endpoints are rate-limited + validated.
- Integration secrets stored encrypted in `integration_settings` / env vars, never in the repo or client.
- Sensitive PII (KTP) access-restricted and stored in private Storage buckets.

---

## 10. Phased roadmap

| Phase | Theme | Deliverables |
|-------|-------|-------------|
| **P0** | Foundation | Next.js + Ant Design + Supabase wiring, Auth, `organizations`/`memberships`, RLS scaffolding, app shell, **Settings skeleton** + `integration_settings` + stub adapters (WA/payment/PPOB). |
| **P1** | Core (MVP) | Configurable property **types**; properties/groups/units CRUD + occupancy board; tenant master data; multi-tenant leases create/end; dashboard. |
| **P2** | Money | Invoices + `invoice_lines`; **dummy payment link** (stub); WA reminder via **stub**; manual reconcile; overdue report. |
| **P3** | Complaints | Public form; ticket inbox + triage; vendor master data; assignment + scheduling; WA (stub) updates. |
| **P4** | Utilities & PPOB | Metered utility billing on invoices; **PPOB resale** (token listrik/air) with margin engine, payable via WA/web — biller stubbed, config-ready. |
| **P5** | Documents | Storage uploads, categorization, entity links, expiry reminders. |
| **P6** | Go-live integrations | Swap stubs → real WA BSP + Xendit + biller; webhooks, reconciliation, template approval. |
| **P7** | Insight & polish | Expenses → net income, late fees, audit log, reporting, role hardening. |
| **Future** | SaaS | Self-serve onboarding, subscription billing, multi-org admin, tenant/vendor portals. |

---

## 11. Open questions

1. **Which biller/PPOB aggregator** to target for the real integration later (e.g. Xendit, a dedicated PPOB API)? Stub is provider-agnostic for now.
2. **UI locale:** Bahasa Indonesia, English, or bilingual? (Ant Design ships both locales — just need a default.)
3. **Kos co-tenant billing:** when a lease has co-tenants, is rent one invoice for the lease, or split per tenant?
4. **Rent proration** for mid-month move-in / move-out — needed in v1 or later?
5. **WA BSP choice** (Fonnte vs Wablas vs Qontak) — deferred until go-live (P6); stub covers the prototype.

**Resolved:** PPOB margin = a **platform fee** (flat or %) set in Settings; no per-owner markup. *(2026-06-14)*

---

## 12. Risks & mitigations
- **WA number bans** (BSP risk) → reputable BSP, respect template rules, throttle. Stub removes this risk for the prototype.
- **Webhook reliability** (missed payment/biller callbacks) → idempotent handling + periodic status reconciliation job.
- **PPOB fulfillment failures** (token not issued after pay) → atomic order state machine, auto-refund/retry path, clear failure status.
- **External form spam** → rate-limit, validation, optional WA OTP.
- **Timezone/date bugs** on due dates → standardize on Asia/Jakarta, test month boundaries.
- **PII handling (KTP)** → restricted access, private storage, minimal retention.

---

## 13. Next steps
1. Confirm the §11 open questions (esp. the PPOB margin model in #1).
2. Lock the P0 foundation tasks and scaffold the repo (Next.js + Ant Design + Supabase + Settings skeleton with stub adapters).
3. Split this plan into `docs/specs/*` per module as each phase starts.
