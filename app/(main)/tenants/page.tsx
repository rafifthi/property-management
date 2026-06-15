"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { leases, properties, tenants } from "@/lib/sample-data";
import { applyOverride, loadTenantOverrides, type TenantOverrideMap } from "@/lib/tenant-overrides";
import type { Lease, Tenant } from "@/lib/types";

type TenantStatus = "active" | "former" | "prospect";

type TenantRow = {
  tenant: Tenant;
  lease?: Lease;
  propertyId?: string;
  propertyName: string;
  unitCode: string;
  status: TenantStatus;
};

const statusLabel: Record<TenantStatus, string> = {
  active: "Active",
  former: "Former",
  prospect: "Prospect",
};

const statusPill: Record<TenantStatus, string> = {
  active: "tenant-status--active",
  former: "tenant-status--inactive",
  prospect: "tenant-status--reserved",
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function shortMoney(value?: number) {
  if (!value) return "-";
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getLeaseWarning(lease?: Lease) {
  if (!lease || lease.status !== "active") return undefined;
  const today = new Date("2026-06-14T00:00:00+07:00");
  const end = new Date(`${lease.endDate}T00:00:00+07:00`);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  if (days > 0 && days <= 7) return { label: `In ${days} days`, tone: "danger" };
  if (days > 7 && days <= 14) return { label: `In ${days} days`, tone: "warning" };
  return undefined;
}

function buildRow(tenant: Tenant): TenantRow {
  const owned = leases
    .filter((lease) => lease.tenantIds.includes(tenant.id))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  const lease = owned.find((item) => item.status === "active") ?? owned[0];
  const unit = lease ? getUnit(lease) : undefined;
  const property = unit ? getProperty(unit) : undefined;
  const status: TenantStatus = owned.some((item) => item.status === "active")
    ? "active"
    : owned.length
    ? "former"
    : "prospect";
  return {
    tenant,
    lease,
    propertyId: property?.id,
    propertyName: property?.name ?? "-",
    unitCode: unit?.code ? `Unit ${unit.code}` : "-",
    status,
  };
}

export default function TenantsPage() {
  const [overrides, setOverrides] = useState<TenantOverrideMap>({});
  const [query, setQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setOverrides(loadTenantOverrides());
  }, []);

  const rows = useMemo(
    () => tenants.map((tenant) => buildRow(applyOverride(tenant, overrides))),
    [overrides],
  );

  const activeCount = rows.filter((row) => row.status === "active").length;
  const inactiveCount = rows.length - activeCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (propertyFilter !== "all" && row.propertyId !== propertyFilter) return false;
      if (statusFilter === "active" && row.status !== "active") return false;
      if (statusFilter === "inactive" && row.status === "active") return false;
      if (q && !`${row.tenant.fullName} ${row.tenant.phoneWa}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, propertyFilter, statusFilter]);

  return (
    <div className="tenants-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Tenants" }]}
        title="Tenants"
        copy={`${activeCount} active · ${inactiveCount} inactive — master data keeps current and past tenants`}
        actions={
          <Button>
            <Plus size={16} /> Add Tenant
          </Button>
        }
      />

      <div className="module-surface">
        <div className="tenant-toolbar">
          <div className="tenant-toolbar__filters">
            <div className="relative tenant-search">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search tenants"
                className="pl-9"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tenants..."
                value={query}
              />
            </div>
            <Select onValueChange={setPropertyFilter} value={propertyFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="tenant-table" role="table" aria-label="Tenant master data">
          <div className="tenant-table__row tenant-table__row--head" role="row">
            <div className="tenant-table__cell tenant-table__cell--tenant" role="columnheader">Tenant</div>
            <div className="tenant-table__cell" role="columnheader">Property / Unit</div>
            <div className="tenant-table__cell" role="columnheader">Move In</div>
            <div className="tenant-table__cell" role="columnheader">Lease End</div>
            <div className="tenant-table__cell" role="columnheader">Rent/mo</div>
            <div className="tenant-table__cell" role="columnheader">Status</div>
            <div className="tenant-table__cell" role="columnheader" />
          </div>

          {filtered.map((row) => {
            const warning = getLeaseWarning(row.lease);
            return (
              <Link
                className="tenant-table__row"
                href={`/tenants/${row.tenant.id}`}
                key={row.tenant.id}
                role="row"
              >
                <div className="tenant-table__cell tenant-table__cell--tenant" role="cell">
                  <div className="tenant-avatar">{initials(row.tenant.fullName)}</div>
                  <div className="tenant-main">
                    <div className="tenant-name">{row.tenant.fullName}</div>
                    <div className="tenant-phone">{row.tenant.phoneWa}</div>
                  </div>
                </div>
                <div className="tenant-table__cell tenant-two-line" role="cell">
                  <span>{row.propertyName}</span>
                  <span>{row.unitCode}</span>
                </div>
                <div className="tenant-table__cell" role="cell">
                  {row.lease ? formatDate(row.lease.startDate) : "-"}
                </div>
                <div className="tenant-table__cell tenant-two-line" role="cell">
                  <span>{row.lease ? formatDate(row.lease.endDate) : "-"}</span>
                  {warning ? (
                    <span className={`tenant-lease-warning tenant-lease-warning--${warning.tone}`}>
                      {warning.label}
                    </span>
                  ) : null}
                </div>
                <div className="tenant-table__cell" role="cell">{shortMoney(row.lease?.rentAmount)}</div>
                <div className="tenant-table__cell" role="cell">
                  <span className={`tenant-status ${statusPill[row.status]}`}>
                    <span /> {statusLabel[row.status]}
                  </span>
                </div>
                <div className="tenant-table__cell tenant-table__chevron" role="cell">
                  <ChevronRight size={16} />
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 ? (
            <div className="tenant-table__row" role="row">
              <div className="tenant-table__cell" role="cell" style={{ gridColumn: "1 / -1", color: "var(--tertiary)", justifyContent: "center", padding: "24px 0" }}>
                No tenants match the current filters.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
