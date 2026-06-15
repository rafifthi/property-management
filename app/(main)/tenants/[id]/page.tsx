"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  Copy,
  DoorOpen,
  FileText,
  Fingerprint,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  ReceiptText,
  ShieldAlert,
  UserRound,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatRupiah } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { documents, invoices, leases, tenants } from "@/lib/sample-data";
import {
  applyOverride,
  loadTenantOverrides,
  saveTenantOverride,
  type TenantOverride,
  type TenantOverrideMap,
} from "@/lib/tenant-overrides";
import type { Invoice, Lease, Tenant } from "@/lib/types";

type TenantStatus = "active" | "former" | "prospect";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function waDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function shortMoney(value: number) {
  if (!value) return "Rp 0";
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function monthYear(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function cycleSuffix(cycle: Lease["billingCycle"]) {
  return cycle === "yearly" ? "/yr" : "/mo";
}

function leaseBadge(status: Lease["status"]): { label: string; variant: BadgeProps["variant"] } {
  if (status === "active") return { label: "Active", variant: "success" };
  if (status === "terminated") return { label: "Terminated", variant: "destructive" };
  return { label: "Ended", variant: "secondary" };
}

const invoiceVariant: Record<Invoice["status"], BadgeProps["variant"]> = {
  paid: "success",
  sent: "secondary",
  draft: "secondary",
  partial: "warning",
  overdue: "destructive",
  void: "destructive",
};

const statusMeta: Record<TenantStatus, { label: string; pill: string }> = {
  active: { label: "Active", pill: "tenant-status--active" },
  former: { label: "Former tenant", pill: "tenant-status--inactive" },
  prospect: { label: "Prospect", pill: "tenant-status--reserved" },
};

function tenantLeasesFor(tenantId: string) {
  return leases
    .filter((lease) => lease.tenantIds.includes(tenantId))
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}

function coTenants(lease: Lease, tenantId: string) {
  return lease.tenantIds
    .filter((id) => id !== tenantId)
    .map((id) => tenants.find((tenant) => tenant.id === id)?.fullName)
    .filter(Boolean) as string[];
}

function EditTenantDialog({
  tenant,
  onSaved,
}: {
  tenant: Tenant;
  onSaved: (map: TenantOverrideMap) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: tenant.fullName,
    phoneWa: tenant.phoneWa,
    email: tenant.email ?? "",
    idNumber: tenant.idNumber,
    emergencyContact: tenant.emergencyContact,
    notes: tenant.notes ?? "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        fullName: tenant.fullName,
        phoneWa: tenant.phoneWa,
        email: tenant.email ?? "",
        idNumber: tenant.idNumber,
        emergencyContact: tenant.emergencyContact,
        notes: tenant.notes ?? "",
      });
    }
  }, [open, tenant]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const patch: TenantOverride = {
      fullName: form.fullName.trim(),
      phoneWa: form.phoneWa.trim(),
      email: form.email.trim() || undefined,
      idNumber: form.idNumber.trim(),
      emergencyContact: form.emergencyContact.trim(),
      notes: form.notes.trim() || undefined,
    };
    onSaved(saveTenantOverride(tenant.id, patch));
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil size={15} /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit tenant</DialogTitle>
          <DialogDescription>Update the master-data record for {tenant.fullName}.</DialogDescription>
        </DialogHeader>
        <form className="tenant-edit-form" onSubmit={handleSubmit}>
          <div className="tenant-edit-grid">
            <div className="tenant-edit-field">
              <Label htmlFor="tenant-name">Full name</Label>
              <Input
                id="tenant-name"
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                required
                value={form.fullName}
              />
            </div>
            <div className="tenant-edit-field">
              <Label htmlFor="tenant-phone">WhatsApp number</Label>
              <Input
                id="tenant-phone"
                onChange={(e) => setForm((prev) => ({ ...prev, phoneWa: e.target.value }))}
                value={form.phoneWa}
              />
            </div>
            <div className="tenant-edit-field">
              <Label htmlFor="tenant-email">Email</Label>
              <Input
                id="tenant-email"
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Optional"
                type="email"
                value={form.email}
              />
            </div>
            <div className="tenant-edit-field">
              <Label htmlFor="tenant-id">ID number (KTP / NPWP)</Label>
              <Input
                id="tenant-id"
                onChange={(e) => setForm((prev) => ({ ...prev, idNumber: e.target.value }))}
                value={form.idNumber}
              />
            </div>
            <div className="tenant-edit-field tenant-edit-field--wide">
              <Label htmlFor="tenant-emergency">Emergency contact</Label>
              <Input
                id="tenant-emergency"
                onChange={(e) => setForm((prev) => ({ ...prev, emergencyContact: e.target.value }))}
                value={form.emergencyContact}
              />
            </div>
            <div className="tenant-edit-field tenant-edit-field--wide">
              <Label htmlFor="tenant-notes">Notes</Label>
              <textarea
                className="tenant-edit-textarea"
                id="tenant-notes"
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes about this tenant"
                value={form.notes}
              />
            </div>
          </div>
          <DialogFooter className="tenant-edit-footer">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TenantDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [overrides, setOverrides] = useState<TenantOverrideMap>({});

  useEffect(() => {
    setOverrides(loadTenantOverrides());
  }, []);

  const baseTenant = tenants.find((tenant) => tenant.id === id);
  const tenant = baseTenant ? applyOverride(baseTenant, overrides) : undefined;

  const data = useMemo(() => {
    if (!tenant) return undefined;
    const tenantLeases = tenantLeasesFor(tenant.id);
    const activeLease = tenantLeases.find((lease) => lease.status === "active");
    const status: TenantStatus = activeLease ? "active" : tenantLeases.length ? "former" : "prospect";
    const leaseIds = new Set(tenantLeases.map((lease) => lease.id));
    const tenantInvoices = invoices
      .filter((invoice) => leaseIds.has(invoice.leaseId))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const tenantDocs = documents.filter(
      (doc) =>
        (doc.relatedType === "tenant" && doc.relatedId === tenant.id) ||
        (doc.relatedType === "lease" && doc.relatedId !== undefined && leaseIds.has(doc.relatedId)),
    );
    const lifetimePaid = tenantInvoices.reduce((sum, invoice) => sum + invoice.paidAmount, 0);
    const outstanding = tenantInvoices
      .filter((invoice) => ["sent", "partial", "overdue"].includes(invoice.status))
      .reduce((sum, invoice) => sum + (invoice.total - invoice.paidAmount), 0);
    return { tenantLeases, activeLease, status, tenantInvoices, tenantDocs, lifetimePaid, outstanding };
  }, [tenant]);

  if (!tenant || !data) {
    return (
      <div className="tenant-detail">
        <nav aria-label="Breadcrumb" className="tenant-detail__crumbs">
          <Link href="/tenants">
            <ArrowLeft size={14} /> Tenants
          </Link>
        </nav>
        <div className="tenant-notfound">
          <UserRound size={28} />
          <h2>Tenant not found</h2>
          <p>This tenant may have been removed or the link is incorrect.</p>
          <Button asChild variant="outline">
            <Link href="/tenants">Back to tenants</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { tenantLeases, activeLease, status, tenantInvoices, tenantDocs, lifetimePaid, outstanding } = data;
  const meta = statusMeta[status];
  const wa = `https://wa.me/${waDigits(tenant.phoneWa)}`;

  const subtitle = (() => {
    if (status === "active") {
      const since = tenantLeases[tenantLeases.length - 1]?.startDate;
      const count = tenantLeases.length;
      return `Tenant since ${since ? monthYear(since) : "—"} · ${count} tenanc${count === 1 ? "y" : "ies"}`;
    }
    if (status === "former") {
      const lastEnd = tenantLeases[0]?.endDate;
      return `Former tenant · last active until ${lastEnd ? monthYear(lastEnd) : "—"}`;
    }
    return "In master data · no tenancy yet";
  })();

  const activeUnit = activeLease ? getUnit(activeLease) : undefined;
  const activeProperty = activeUnit ? getProperty(activeUnit) : undefined;
  const activeCoTenants = activeLease ? coTenants(activeLease, tenant.id) : [];

  return (
    <div className="tenant-detail">
      <nav aria-label="Breadcrumb" className="tenant-detail__crumbs">
        <Link href="/tenants">
          <ArrowLeft size={14} /> Tenants
        </Link>
        <ChevronRight size={13} />
        <span>{tenant.fullName}</span>
      </nav>

      <section className="tenant-hero">
        <div className="tenant-hero__top">
          <div className="tenant-hero__identity">
            <div className="tenant-hero__avatar">{initials(tenant.fullName)}</div>
            <div className="tenant-hero__meta">
              <div className="tenant-hero__name-row">
                <h1 className="tenant-hero__name">{tenant.fullName}</h1>
                <span className={`tenant-status ${meta.pill}`}>
                  <span /> {meta.label}
                </span>
              </div>
              <div className="tenant-hero__sub">{subtitle}</div>
            </div>
          </div>

          <div className="tenant-hero__actions">
            <Button asChild className="btn-whatsapp">
              <a href={wa} rel="noreferrer" target="_blank">
                <MessageCircle size={15} /> WhatsApp
              </a>
            </Button>
            <EditTenantDialog onSaved={setOverrides} tenant={tenant} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button aria-label="More actions" size="icon" variant="outline">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(tenant.phoneWa)}>
                  <Copy size={15} /> Copy phone number
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`tel:${waDigits(tenant.phoneWa)}`}>
                    <Phone size={15} /> Call tenant
                  </a>
                </DropdownMenuItem>
                {tenant.email ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={`mailto:${tenant.email}`}>
                        <Mail size={15} /> Send email
                      </a>
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="tenant-hero__stats">
          <div>
            <span>Active leases</span>
            <strong>{activeLease ? 1 : 0}</strong>
          </div>
          <div>
            <span>Tenancies</span>
            <strong>{tenantLeases.length}</strong>
          </div>
          <div>
            <span>Lifetime paid</span>
            <strong>{shortMoney(lifetimePaid)}</strong>
          </div>
          <div>
            <span>Outstanding</span>
            <strong className={outstanding > 0 ? "is-danger" : undefined}>{shortMoney(outstanding)}</strong>
          </div>
        </div>
      </section>

      <div className="tenant-detail__grid">
        <div className="tenant-col">
          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Current tenancy</h2>
              {activeProperty ? (
                <Link className="tenant-panel__link" href={`/properties/${activeProperty.id}`}>
                  View property <ChevronRight size={13} />
                </Link>
              ) : null}
            </div>

            {activeLease && activeUnit ? (
              <div>
                <div className="tenant-tenancy__head">
                  <div>
                    <div className="tenant-tenancy__unit">
                      <DoorOpen size={16} /> {activeUnit.code}
                    </div>
                    <div className="tenant-tenancy__prop">{activeProperty?.name ?? "—"}</div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="tenant-tenancy__grid">
                  <div>
                    <span>Rent</span>
                    <strong>
                      {formatRupiah(activeLease.rentAmount)}
                      {cycleSuffix(activeLease.billingCycle)}
                    </strong>
                  </div>
                  <div>
                    <span>Deposit</span>
                    <strong>{formatRupiah(activeLease.depositAmount)}</strong>
                  </div>
                  <div>
                    <span>Lease period</span>
                    <strong>
                      {monthYear(activeLease.startDate)} – {monthYear(activeLease.endDate)}
                    </strong>
                  </div>
                  <div>
                    <span>Due day</span>
                    <strong>Day {activeLease.dueDay}</strong>
                  </div>
                  {activeCoTenants.length ? (
                    <div>
                      <span>Co-tenants</span>
                      <strong>{activeCoTenants.join(", ")}</strong>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="tenant-empty">
                <DoorOpen size={26} />
                <p>No active tenancy. This tenant is kept in master data for history and future leases.</p>
              </div>
            )}
          </section>

          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Tenancy history</h2>
            </div>
            {tenantLeases.length ? (
              <div className="tenant-history">
                {tenantLeases.map((lease) => {
                  const unit = getUnit(lease);
                  const property = unit ? getProperty(unit) : undefined;
                  const badge = leaseBadge(lease.status);
                  const others = coTenants(lease, tenant.id);
                  return (
                    <div className="tenant-history__row" key={lease.id}>
                      <div>
                        <div className="tenant-history__unit">{unit?.code ?? "Unit removed"}</div>
                        <div className="tenant-history__prop">{property?.name ?? "—"}</div>
                        <div className="tenant-history__period">
                          <Calendar size={13} />
                          {monthYear(lease.startDate)} – {monthYear(lease.endDate)}
                          {others.length ? (
                            <>
                              <i />
                              <span className="tenant-history__cotenant">with {others.join(", ")}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="tenant-history__right">
                        <div className="tenant-history__rent">
                          {formatRupiah(lease.rentAmount)}
                          {cycleSuffix(lease.billingCycle)}
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tenant-empty">
                <FileText size={26} />
                <p>No tenancies recorded yet.</p>
              </div>
            )}
          </section>

          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Payment history</h2>
              <Link className="tenant-panel__link" href="/invoices">
                All invoices <ChevronRight size={13} />
              </Link>
            </div>
            {tenantInvoices.length ? (
              <div className="tenant-pay">
                {tenantInvoices.map((invoice) => {
                  const unit = getUnit(leases.find((l) => l.id === invoice.leaseId)?.unitId ?? "");
                  return (
                    <div className="tenant-pay__row" key={invoice.id}>
                      <div>
                        <div className="tenant-pay__period">{invoice.period}</div>
                        <div className="tenant-pay__meta">
                          {unit?.code ?? "—"} · due {formatDate(invoice.dueDate)}
                        </div>
                      </div>
                      <div className="tenant-pay__right">
                        <div className="tenant-pay__amount">{formatRupiah(invoice.total)}</div>
                        <Badge variant={invoiceVariant[invoice.status]}>{invoice.status}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tenant-empty">
                <Wallet size={26} />
                <p>No invoices on record for this tenant.</p>
              </div>
            )}
          </section>
        </div>

        <div className="tenant-col">
          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Contact &amp; identity</h2>
            </div>
            <div className="tenant-info">
              <div className="tenant-info__row">
                <MessageCircle size={16} />
                <div className="tenant-info__body">
                  <div className="tenant-info__label">WhatsApp</div>
                  <div className="tenant-info__value">
                    <a href={wa} rel="noreferrer" target="_blank">
                      {tenant.phoneWa}
                    </a>
                  </div>
                </div>
              </div>
              <div className="tenant-info__row">
                <Mail size={16} />
                <div className="tenant-info__body">
                  <div className="tenant-info__label">Email</div>
                  <div className="tenant-info__value">
                    {tenant.email ? <a href={`mailto:${tenant.email}`}>{tenant.email}</a> : "—"}
                  </div>
                </div>
              </div>
              <div className="tenant-info__row">
                <Fingerprint size={16} />
                <div className="tenant-info__body">
                  <div className="tenant-info__label">ID number (KTP / NPWP)</div>
                  <div className="tenant-info__value">{tenant.idNumber}</div>
                </div>
              </div>
              <div className="tenant-info__row">
                <ShieldAlert size={16} />
                <div className="tenant-info__body">
                  <div className="tenant-info__label">Emergency contact</div>
                  <div className="tenant-info__value">{tenant.emergencyContact}</div>
                </div>
              </div>
              {tenant.notes ? (
                <div className="tenant-info__row">
                  <FileText size={16} />
                  <div className="tenant-info__body">
                    <div className="tenant-info__label">Notes</div>
                    <div className="tenant-info__value">{tenant.notes}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Documents</h2>
              <Link className="tenant-panel__link" href="/documents">
                Library <ChevronRight size={13} />
              </Link>
            </div>
            {tenantDocs.length ? (
              <div className="tenant-docs">
                {tenantDocs.map((doc) => (
                  <div className="tenant-doc" key={doc.id}>
                    <ReceiptText className="tenant-doc__icon" size={18} />
                    <div className="tenant-doc__body">
                      <div className="tenant-doc__name">{doc.name}</div>
                      <div className="tenant-doc__meta">
                        {doc.category}
                        {doc.expiryDate ? ` · expires ${formatDate(doc.expiryDate)}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tenant-empty">
                <FileText size={26} />
                <p>No documents linked to this tenant yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
