create extension if not exists pgcrypto;

create type app_role as enum ('owner', 'staff', 'vendor');
create type property_type as enum ('kontrakan', 'kos', 'ruko', 'apartemen', 'custom');
create type billing_cycle as enum ('monthly', 'yearly');
create type unit_status as enum ('vacant', 'occupied', 'maintenance');
create type lease_status as enum ('active', 'ended', 'terminated');
create type invoice_status as enum ('draft', 'sent', 'paid', 'partial', 'overdue', 'void');
create type invoice_line_type as enum ('rent', 'utility', 'ppob', 'fee', 'deposit', 'discount');
create type payment_method as enum ('gateway', 'cash', 'transfer');
create type utility_type as enum ('electricity', 'water', 'gas', 'internet', 'other');
create type utility_product as enum ('pln_token', 'pdam', 'pulsa', 'other');
create type utility_order_status as enum ('quoted', 'pending_payment', 'paid', 'fulfilled', 'failed');
create type ticket_status as enum ('new', 'triaged', 'assigned', 'scheduled', 'in_progress', 'resolved', 'closed');
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type ticket_source as enum ('form', 'manual');
create type document_category as enum ('contract', 'personal', 'other');
create type integration_kind as enum ('wa', 'payment', 'ppob');
create type integration_mode as enum ('stub', 'live');

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  type property_type not null default 'custom',
  address text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table unit_groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  name text not null
);

create table units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  group_id uuid references unit_groups(id) on delete set null,
  code text not null,
  base_rent bigint not null check (base_rent >= 0),
  default_billing_cycle billing_cycle not null default 'monthly',
  status unit_status not null default 'vacant',
  attributes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (organization_id, property_id, code)
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  full_name text not null,
  phone_wa text not null,
  email text,
  id_number text,
  emergency_contact text,
  notes text,
  created_at timestamptz not null default now()
);

create table leases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  unit_id uuid not null references units(id) on delete restrict,
  start_date date not null,
  end_date date not null,
  rent_amount bigint not null check (rent_amount >= 0),
  deposit_amount bigint not null default 0 check (deposit_amount >= 0),
  billing_cycle billing_cycle not null default 'monthly',
  due_day int not null check (due_day between 1 and 31),
  status lease_status not null default 'active',
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table lease_tenants (
  lease_id uuid not null references leases(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete restrict,
  role text not null default 'primary' check (role in ('primary', 'co')),
  primary key (lease_id, tenant_id)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  lease_id uuid not null references leases(id) on delete restrict,
  period text not null,
  due_date date not null,
  total bigint not null default 0 check (total >= 0),
  status invoice_status not null default 'draft',
  payment_provider_ref text,
  payment_url text,
  paid_amount bigint not null default 0 check (paid_amount >= 0),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, lease_id, period)
);

create table invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  type invoice_line_type not null,
  description text not null,
  amount bigint not null
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete restrict,
  amount bigint not null check (amount > 0),
  method payment_method not null,
  reference text,
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table utility_meters (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  unit_id uuid not null references units(id) on delete cascade,
  type utility_type not null,
  label text not null,
  tariff_per_unit bigint not null default 0 check (tariff_per_unit >= 0),
  notes text,
  created_at timestamptz not null default now()
);

create table utility_readings (
  id uuid primary key default gen_random_uuid(),
  meter_id uuid not null references utility_meters(id) on delete cascade,
  period text not null,
  prev_reading numeric not null,
  curr_reading numeric not null,
  usage numeric generated always as (curr_reading - prev_reading) stored,
  amount bigint not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (meter_id, period),
  check (curr_reading >= prev_reading)
);

create table utility_orders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  tenant_id uuid references tenants(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  product utility_product not null,
  customer_ref text not null,
  base_amount bigint not null check (base_amount >= 0),
  platform_fee bigint not null check (platform_fee >= 0),
  sell_amount bigint not null check (sell_amount >= 0),
  status utility_order_status not null default 'quoted',
  provider_ref text,
  channel text not null default 'web' check (channel in ('wa', 'web')),
  paid_at timestamptz,
  fulfilled_at timestamptz,
  created_at timestamptz not null default now(),
  check (sell_amount = base_amount + platform_fee)
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  service_type text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  unit_id uuid not null references units(id) on delete restrict,
  tenant_id uuid references tenants(id) on delete set null,
  reporter_name text not null,
  reporter_phone text not null,
  category text not null,
  title text not null,
  description text not null,
  priority ticket_priority not null default 'medium',
  status ticket_status not null default 'new',
  photos text[] not null default '{}',
  source ticket_source not null default 'manual',
  created_at timestamptz not null default now()
);

create table ticket_assignments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references tickets(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete restrict,
  scheduled_at timestamptz,
  cost bigint check (cost >= 0),
  status text not null default 'assigned'
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category document_category not null default 'other',
  storage_path text not null,
  related_type text check (related_type in ('tenant', 'lease', 'property', 'unit')),
  related_id uuid,
  expiry_date date,
  created_at timestamptz not null default now()
);

create table integration_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  kind integration_kind not null,
  provider text not null,
  config jsonb not null default '{}'::jsonb,
  mode integration_mode not null default 'stub',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, kind)
);

create table message_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  key text not null,
  channel text not null default 'wa' check (channel = 'wa'),
  body text not null,
  variables text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (organization_id, key)
);

create table notification_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  channel text not null,
  template text not null,
  recipient text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null,
  sent_at timestamptz not null default now()
);

create index memberships_user_idx on memberships(user_id);
create index properties_org_idx on properties(organization_id);
create index units_org_status_idx on units(organization_id, status);
create index tenants_org_phone_idx on tenants(organization_id, phone_wa);
create index leases_org_status_idx on leases(organization_id, status);
create index invoices_org_status_due_idx on invoices(organization_id, status, due_date);
create index tickets_org_status_idx on tickets(organization_id, status);
create index utility_orders_org_status_idx on utility_orders(organization_id, status);
create index documents_org_expiry_idx on documents(organization_id, expiry_date);

create or replace function current_user_org_ids()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from memberships where user_id = auth.uid()
$$;

create or replace function is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.organization_id = target_org_id
      and memberships.user_id = auth.uid()
  )
$$;

create or replace function is_org_owner_or_staff(target_org_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from memberships
    where memberships.organization_id = target_org_id
      and memberships.user_id = auth.uid()
      and memberships.role in ('owner', 'staff')
  )
$$;

alter table organizations enable row level security;
alter table memberships enable row level security;
alter table properties enable row level security;
alter table unit_groups enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table leases enable row level security;
alter table lease_tenants enable row level security;
alter table invoices enable row level security;
alter table invoice_lines enable row level security;
alter table payments enable row level security;
alter table utility_meters enable row level security;
alter table utility_readings enable row level security;
alter table utility_orders enable row level security;
alter table vendors enable row level security;
alter table tickets enable row level security;
alter table ticket_assignments enable row level security;
alter table documents enable row level security;
alter table integration_settings enable row level security;
alter table message_templates enable row level security;
alter table notification_log enable row level security;

create policy "members can read their organizations"
on organizations for select
using (id in (select current_user_org_ids()));

create policy "members can read memberships in org"
on memberships for select
using (is_org_member(organization_id));

create policy "owners can manage memberships"
on memberships for all
using (
  exists (
    select 1 from memberships owner_membership
    where owner_membership.organization_id = memberships.organization_id
      and owner_membership.user_id = auth.uid()
      and owner_membership.role = 'owner'
  )
)
with check (
  exists (
    select 1 from memberships owner_membership
    where owner_membership.organization_id = memberships.organization_id
      and owner_membership.user_id = auth.uid()
      and owner_membership.role = 'owner'
  )
);

create policy "org members can read properties"
on properties for select
using (is_org_member(organization_id));

create policy "owner staff manage properties"
on properties for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read unit groups"
on unit_groups for select
using (is_org_member(organization_id));

create policy "owner staff manage unit groups"
on unit_groups for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read units"
on units for select
using (is_org_member(organization_id));

create policy "owner staff manage units"
on units for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read tenants"
on tenants for select
using (is_org_member(organization_id));

create policy "owner staff manage tenants"
on tenants for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read leases"
on leases for select
using (is_org_member(organization_id));

create policy "owner staff manage leases"
on leases for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read lease tenants"
on lease_tenants for select
using (
  exists (
    select 1 from leases
    where leases.id = lease_tenants.lease_id
      and is_org_member(leases.organization_id)
  )
);

create policy "owner staff manage lease tenants"
on lease_tenants for all
using (
  exists (
    select 1 from leases
    where leases.id = lease_tenants.lease_id
      and is_org_owner_or_staff(leases.organization_id)
  )
)
with check (
  exists (
    select 1 from leases
    where leases.id = lease_tenants.lease_id
      and is_org_owner_or_staff(leases.organization_id)
  )
);

create policy "org members can read invoices"
on invoices for select
using (is_org_member(organization_id));

create policy "owner staff manage invoices"
on invoices for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read invoice lines"
on invoice_lines for select
using (
  exists (
    select 1 from invoices
    where invoices.id = invoice_lines.invoice_id
      and is_org_member(invoices.organization_id)
  )
);

create policy "owner staff manage invoice lines"
on invoice_lines for all
using (
  exists (
    select 1 from invoices
    where invoices.id = invoice_lines.invoice_id
      and is_org_owner_or_staff(invoices.organization_id)
  )
)
with check (
  exists (
    select 1 from invoices
    where invoices.id = invoice_lines.invoice_id
      and is_org_owner_or_staff(invoices.organization_id)
  )
);

create policy "org members can read payments"
on payments for select
using (is_org_member(organization_id));

create policy "owner staff manage payments"
on payments for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read utility meters"
on utility_meters for select
using (is_org_member(organization_id));

create policy "owner staff manage utility meters"
on utility_meters for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read utility readings"
on utility_readings for select
using (
  exists (
    select 1 from utility_meters
    where utility_meters.id = utility_readings.meter_id
      and is_org_member(utility_meters.organization_id)
  )
);

create policy "owner staff manage utility readings"
on utility_readings for all
using (
  exists (
    select 1 from utility_meters
    where utility_meters.id = utility_readings.meter_id
      and is_org_owner_or_staff(utility_meters.organization_id)
  )
)
with check (
  exists (
    select 1 from utility_meters
    where utility_meters.id = utility_readings.meter_id
      and is_org_owner_or_staff(utility_meters.organization_id)
  )
);

create policy "org members can read utility orders"
on utility_orders for select
using (is_org_member(organization_id));

create policy "owner staff manage utility orders"
on utility_orders for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read vendors"
on vendors for select
using (is_org_member(organization_id));

create policy "owner staff manage vendors"
on vendors for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read tickets"
on tickets for select
using (is_org_member(organization_id));

create policy "owner staff manage tickets"
on tickets for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read ticket assignments"
on ticket_assignments for select
using (
  exists (
    select 1 from tickets
    where tickets.id = ticket_assignments.ticket_id
      and is_org_member(tickets.organization_id)
  )
);

create policy "owner staff manage ticket assignments"
on ticket_assignments for all
using (
  exists (
    select 1 from tickets
    where tickets.id = ticket_assignments.ticket_id
      and is_org_owner_or_staff(tickets.organization_id)
  )
)
with check (
  exists (
    select 1 from tickets
    where tickets.id = ticket_assignments.ticket_id
      and is_org_owner_or_staff(tickets.organization_id)
  )
);

create policy "org members can read documents"
on documents for select
using (is_org_member(organization_id));

create policy "owner staff manage documents"
on documents for all
using (is_org_owner_or_staff(organization_id))
with check (is_org_owner_or_staff(organization_id));

create policy "org members can read integration settings"
on integration_settings for select
using (is_org_member(organization_id));

create policy "owners manage integration settings"
on integration_settings for all
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = integration_settings.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'owner'
  )
)
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = integration_settings.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'owner'
  )
);

create policy "org members can read message templates"
on message_templates for select
using (is_org_member(organization_id));

create policy "owners manage message templates"
on message_templates for all
using (
  exists (
    select 1 from memberships
    where memberships.organization_id = message_templates.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'owner'
  )
)
with check (
  exists (
    select 1 from memberships
    where memberships.organization_id = message_templates.organization_id
      and memberships.user_id = auth.uid()
      and memberships.role = 'owner'
  )
);

create policy "org members can read notification logs"
on notification_log for select
using (is_org_member(organization_id));

create policy "owner staff insert notification logs"
on notification_log for insert
with check (is_org_owner_or_staff(organization_id));
