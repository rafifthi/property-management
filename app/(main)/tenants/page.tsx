"use client";

import { MoreVertical, Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
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
import type { Lease, Tenant } from "@/lib/types";

type TenantRow = {
  tenant: Tenant;
  lease?: Lease;
  propertyName: string;
  unitCode: string;
  status: "active" | "reserved" | "inactive";
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function shortMoney(value?: number) {
  if (!value) return "-";
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getLeaseWarning(lease?: Lease) {
  if (!lease) return undefined;
  const today = new Date("2026-06-14T00:00:00+07:00");
  const end = new Date(`${lease.endDate}T00:00:00+07:00`);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
  if (days > 0 && days <= 7) return { label: `In ${days} days`, tone: "danger" };
  if (days > 7 && days <= 14) return { label: `In ${days} days`, tone: "warning" };
  return undefined;
}

function getTenantRows(): TenantRow[] {
  return tenants.map((tenant) => {
    const lease = leases.find((item) => item.tenantIds.includes(tenant.id) && item.status === "active");
    const unit = lease ? getUnit(lease) : undefined;
    const property = unit ? getProperty(unit) : undefined;
    return { tenant, lease, propertyName: property?.name ?? "-", unitCode: unit?.code ? `Unit ${unit.code}` : "-", status: lease ? "active" : "inactive" };
  });
}

export default function TenantsPage() {
  const rows = getTenantRows();
  const activeTenants = rows.filter((row) => row.status === "active").length;
  const occupiedPropertyIds = new Set(rows.map((row) => (row.lease ? getUnit(row.lease)?.propertyId : undefined)).filter(Boolean));

  return (
    <div className="tenants-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Tenants" }]}
        title="Tenants"
        copy={`${activeTenants} active tenants across ${occupiedPropertyIds.size || properties.length} properties`}
        actions={
          <Button><Plus size={16} /> Add Tenant</Button>
        }
      />

      <div className="tenant-toolbar">
        <div className="tenant-toolbar__filters">
          <div className="relative tenant-search">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search tenants..." aria-label="Search tenants" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="tenant-table" role="table" aria-label="Tenant master data">
        <div className="tenant-table__row tenant-table__row--head" role="row">
          <div className="tenant-table__cell tenant-table__cell--tenant" role="columnheader">Tenant</div>
          <div className="tenant-table__cell tenant-table__cell--property" role="columnheader">Property / Unit</div>
          <div className="tenant-table__cell tenant-table__cell--date" role="columnheader">Move In Date</div>
          <div className="tenant-table__cell tenant-table__cell--date" role="columnheader">Lease End</div>
          <div className="tenant-table__cell tenant-table__cell--rent" role="columnheader">Rent/mo</div>
          <div className="tenant-table__cell tenant-table__cell--status" role="columnheader">Status</div>
          <div className="tenant-table__cell tenant-table__cell--actions" role="columnheader" />
        </div>

        {rows.map((row) => {
          const warning = getLeaseWarning(row.lease);
          return (
            <div className="tenant-table__row" role="row" key={row.tenant.id}>
              <div className="tenant-table__cell tenant-table__cell--tenant" role="cell">
                <div className="tenant-avatar">{initials(row.tenant.fullName)}</div>
                <div className="tenant-main">
                  <div className="tenant-name">{row.tenant.fullName}</div>
                  <div className="tenant-phone">{row.tenant.phoneWa}</div>
                </div>
              </div>
              <div className="tenant-table__cell tenant-table__cell--property tenant-two-line" role="cell">
                <span>{row.propertyName}</span>
                <span>{row.unitCode}</span>
              </div>
              <div className="tenant-table__cell tenant-table__cell--date" role="cell">{row.lease ? formatDate(row.lease.startDate) : "-"}</div>
              <div className="tenant-table__cell tenant-table__cell--date tenant-two-line" role="cell">
                <span>{row.lease ? formatDate(row.lease.endDate) : "-"}</span>
                {warning ? <span className={`tenant-lease-warning tenant-lease-warning--${warning.tone}`}>{warning.label}</span> : null}
              </div>
              <div className="tenant-table__cell tenant-table__cell--rent" role="cell">{shortMoney(row.lease?.rentAmount)}</div>
              <div className="tenant-table__cell tenant-table__cell--status" role="cell">
                <span className={`tenant-status tenant-status--${row.status}`}>
                  <span /> {row.status === "active" ? "Active" : row.status === "reserved" ? "Reserved" : "Inactive"}
                </span>
              </div>
              <div className="tenant-table__cell tenant-table__cell--actions" role="cell">
                <Button variant="ghost" size="icon" aria-label={`More actions for ${row.tenant.fullName}`}><MoreVertical size={16} /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
