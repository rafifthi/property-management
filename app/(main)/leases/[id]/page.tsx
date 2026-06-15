"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  DoorClosed,
  DoorOpen,
  FileText,
  PiggyBank,
  Plus,
  ReceiptText,
  ShieldCheck,
  Trash2,
  Users,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusTag from "@/components/StatusTag";
import { formatDate, formatRupiah, titleCase } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { invoices, leases, tenants } from "@/lib/sample-data";
import { depositStatusLabel, depositSummary, depositTxnsForLease } from "@/lib/deposit";
import {
  addDepositTxn,
  applyMoveOut,
  effectiveInvoice,
  effectiveLease,
  loadMoneyStore,
  uid,
  type MoneyStore,
} from "@/lib/money-store";
import type { DepositTransaction, Lease } from "@/lib/types";

function leaseBadge(status: Lease["status"]): { label: string; variant: BadgeProps["variant"] } {
  if (status === "active") return { label: "Active", variant: "success" };
  if (status === "terminated") return { label: "Terminated", variant: "destructive" };
  return { label: "Ended", variant: "secondary" };
}

const depositBadgeVariant: Record<string, BadgeProps["variant"]> = {
  due: "warning",
  partial: "warning",
  held: "success",
  settling: "warning",
  refunded: "secondary",
  forfeited: "destructive",
};

const txnMeta: Record<DepositTransaction["type"], { label: string; sign: string; tone: string }> = {
  collected: { label: "Collected", sign: "+", tone: "is-credit" },
  deduction: { label: "Deduction", sign: "−", tone: "is-debit" },
  refund: { label: "Refunded", sign: "−", tone: "is-debit" },
  forfeit: { label: "Forfeited", sign: "−", tone: "is-debit" },
};

function cycleSuffix(cycle: Lease["billingCycle"]) {
  return cycle === "yearly" ? "/yr" : "/mo";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Collect deposit ───────────────────────────────────────────────
function CollectDepositDialog({
  leaseId,
  suggested,
  onSaved,
}: {
  leaseId: string;
  suggested: number;
  onSaved: (store: MoneyStore) => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(suggested || ""));
  const [method, setMethod] = useState<"cash" | "transfer" | "gateway">("transfer");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setAmount(String(suggested || ""));
      setMethod("transfer");
      setReference("");
    }
  }, [open, suggested]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    onSaved(
      addDepositTxn({
        id: uid("dep"),
        leaseId,
        type: "collected",
        amount: value,
        date: today(),
        method,
        reference: reference.trim() || undefined,
        note: "Deposit collected",
      })
    );
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PiggyBank size={15} /> Record deposit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record deposit payment</DialogTitle>
          <DialogDescription>Add a collected amount to this lease&apos;s deposit ledger.</DialogDescription>
        </DialogHeader>
        <form className="money-form" onSubmit={handleSubmit}>
          <div className="money-form__field">
            <Label htmlFor="dep-amount">Amount (Rp)</Label>
            <Input
              id="dep-amount"
              inputMode="numeric"
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              value={amount}
            />
          </div>
          <div className="money-form__field">
            <Label>Method</Label>
            <Select onValueChange={(v) => setMethod(v as typeof method)} value={method}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="gateway">Gateway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="money-form__field money-form__field--wide">
            <Label htmlFor="dep-ref">Reference (optional)</Label>
            <Input id="dep-ref" onChange={(e) => setReference(e.target.value)} placeholder="Bank ref / note" value={reference} />
          </div>
          <DialogFooter className="money-form__footer">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Record payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Move-out settlement ───────────────────────────────────────────
type DeductionRow = { id: string; description: string; amount: string };

function SettlementDialog({
  lease,
  unitId,
  held,
  outstandingInvoices,
  onSaved,
}: {
  lease: Lease;
  unitId: string;
  held: number;
  outstandingInvoices: number;
  onSaved: (store: MoneyStore) => void;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DeductionRow[]>([]);
  const [outcome, setOutcome] = useState<"refund" | "forfeit">("refund");
  const [method, setMethod] = useState<"cash" | "transfer" | "gateway">("transfer");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setRows(
        outstandingInvoices > 0
          ? [{ id: uid("row"), description: "Unpaid invoices", amount: String(Math.min(outstandingInvoices, held)) }]
          : [{ id: uid("row"), description: "", amount: "" }]
      );
      setOutcome("refund");
      setMethod("transfer");
      setReference("");
    }
  }, [open, outstandingInvoices, held]);

  const totalDeductions = rows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const remainder = Math.max(held - totalDeductions, 0);

  function updateRow(id: string, patch: Partial<DeductionRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const date = today();
    const txns: DepositTransaction[] = [];
    for (const row of rows) {
      const value = Number(row.amount) || 0;
      if (value > 0) {
        txns.push({
          id: uid("dep"),
          leaseId: lease.id,
          type: "deduction",
          amount: value,
          date,
          note: row.description.trim() || "Deduction",
        });
      }
    }
    if (remainder > 0) {
      txns.push(
        outcome === "refund"
          ? {
              id: uid("dep"),
              leaseId: lease.id,
              type: "refund",
              amount: remainder,
              date,
              method,
              reference: reference.trim() || undefined,
              note: "Net refund after deductions",
            }
          : { id: uid("dep"), leaseId: lease.id, type: "forfeit", amount: remainder, date, note: "Forfeited remaining deposit" }
      );
    }
    onSaved(applyMoveOut({ leaseId: lease.id, unitId, depositTxns: txns }));
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>
          <DoorClosed size={15} /> End lease &amp; settle
        </Button>
      </DialogTrigger>
      <DialogContent className="settle-dialog">
        <DialogHeader>
          <DialogTitle>Move-out settlement</DialogTitle>
          <DialogDescription>
            Reconcile the deposit, end the lease, and return the unit to vacant.
          </DialogDescription>
        </DialogHeader>
        <form className="settle" onSubmit={handleSubmit}>
          <div className="settle__summary">
            <div>
              <span>Deposit held</span>
              <strong>{formatRupiah(held)}</strong>
            </div>
            <div>
              <span>Outstanding invoices</span>
              <strong className={outstandingInvoices > 0 ? "is-danger" : undefined}>
                {formatRupiah(outstandingInvoices)}
              </strong>
            </div>
          </div>

          <div className="settle__rows">
            <div className="settle__rows-head">
              <span>Deductions</span>
              <Button
                onClick={() => setRows((prev) => [...prev, { id: uid("row"), description: "", amount: "" }])}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus size={13} /> Add
              </Button>
            </div>
            {rows.map((row) => (
              <div className="settle__row" key={row.id}>
                <Input
                  onChange={(e) => updateRow(row.id, { description: e.target.value })}
                  placeholder="Reason (damage, cleaning, unpaid rent…)"
                  value={row.description}
                />
                <Input
                  className="settle__amount"
                  inputMode="numeric"
                  onChange={(e) => updateRow(row.id, { amount: e.target.value.replace(/\D/g, "") })}
                  placeholder="0"
                  value={row.amount}
                />
                <Button
                  aria-label="Remove deduction"
                  onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
          </div>

          <div className="settle__totals">
            <div>
              <span>Total deductions</span>
              <strong>{formatRupiah(totalDeductions)}</strong>
            </div>
            <div className="settle__net">
              <span>{outcome === "refund" ? "Net refund to tenant" : "Amount forfeited"}</span>
              <strong>{formatRupiah(remainder)}</strong>
            </div>
          </div>

          {remainder > 0 ? (
            <div className="settle__outcome">
              <label>
                <input
                  checked={outcome === "refund"}
                  name="outcome"
                  onChange={() => setOutcome("refund")}
                  type="radio"
                />
                Refund remaining balance to tenant
              </label>
              <label>
                <input
                  checked={outcome === "forfeit"}
                  name="outcome"
                  onChange={() => setOutcome("forfeit")}
                  type="radio"
                />
                Tenant forfeits remaining balance
              </label>
              {outcome === "refund" ? (
                <div className="settle__refund-fields">
                  <Select onValueChange={(v) => setMethod(v as typeof method)} value={method}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="gateway">Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input onChange={(e) => setReference(e.target.value)} placeholder="Refund reference" value={reference} />
                </div>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="money-form__footer">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Confirm settlement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LeaseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [store, setStore] = useState<MoneyStore>(loadMoneyStore());

  useEffect(() => {
    setStore(loadMoneyStore());
  }, []);

  const baseLease = leases.find((lease) => lease.id === id);

  const data = useMemo(() => {
    if (!baseLease) return undefined;
    const lease = effectiveLease(baseLease, store);
    const unit = getUnit(lease);
    const property = unit ? getProperty(unit) : undefined;
    const leaseTenants = lease.tenantIds
      .map((tid) => tenants.find((t) => t.id === tid))
      .filter(Boolean);
    const leaseInvoices = invoices
      .filter((invoice) => invoice.leaseId === lease.id)
      .map((invoice) => effectiveInvoice(invoice, store))
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    const outstandingInvoices = leaseInvoices
      .filter((invoice) => ["sent", "partial", "overdue"].includes(invoice.status))
      .reduce((sum, invoice) => sum + (invoice.total - invoice.paidAmount), 0);
    const txns = depositTxnsForLease(lease.id, store.depositTxns);
    const deposit = depositSummary(lease, txns);
    return { lease, unit, property, leaseTenants, leaseInvoices, outstandingInvoices, deposit };
  }, [baseLease, store]);

  if (!baseLease || !data) {
    return (
      <div className="tenant-detail">
        <nav aria-label="Breadcrumb" className="tenant-detail__crumbs">
          <Link href="/leases">
            <ArrowLeft size={14} /> Leases
          </Link>
        </nav>
        <div className="tenant-notfound">
          <FileText size={28} />
          <h2>Lease not found</h2>
          <p>This lease may have been removed or the link is incorrect.</p>
          <Button asChild variant="outline">
            <Link href="/leases">Back to leases</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { lease, unit, property, leaseTenants, leaseInvoices, outstandingInvoices, deposit } = data;
  const badge = leaseBadge(lease.status);
  const collectPct = deposit.expected ? Math.min((deposit.collected / deposit.expected) * 100, 100) : 0;

  return (
    <div className="tenant-detail">
      <nav aria-label="Breadcrumb" className="tenant-detail__crumbs">
        <Link href="/leases">
          <ArrowLeft size={14} /> Leases
        </Link>
        <ChevronRight size={13} />
        <span>{unit?.code ?? "Lease"}</span>
      </nav>

      <section className="tenant-hero">
        <div className="tenant-hero__top">
          <div className="tenant-hero__identity">
            <div className="tenant-hero__avatar">
              <DoorOpen size={24} />
            </div>
            <div className="tenant-hero__meta">
              <div className="tenant-hero__name-row">
                <h1 className="tenant-hero__name">{unit?.code ?? "Unit removed"}</h1>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <div className="tenant-hero__sub">
                {property?.name ?? "—"} · {formatDate(lease.startDate)} – {formatDate(lease.endDate)} ·{" "}
                {leaseTenants.map((t) => t?.fullName).join(", ")}
              </div>
            </div>
          </div>

          <div className="tenant-hero__actions">
            {deposit.outstanding > 0 && lease.status === "active" ? (
              <CollectDepositDialog leaseId={lease.id} onSaved={setStore} suggested={deposit.outstanding} />
            ) : null}
            {lease.status === "active" && unit ? (
              <SettlementDialog
                held={deposit.held}
                lease={lease}
                onSaved={setStore}
                outstandingInvoices={outstandingInvoices}
                unitId={unit.id}
              />
            ) : null}
          </div>
        </div>

        <div className="tenant-hero__stats">
          <div>
            <span>Rent</span>
            <strong>
              {formatRupiah(lease.rentAmount)}
              {cycleSuffix(lease.billingCycle)}
            </strong>
          </div>
          <div>
            <span>Deposit held</span>
            <strong>{formatRupiah(deposit.held)}</strong>
          </div>
          <div>
            <span>Outstanding invoices</span>
            <strong className={outstandingInvoices > 0 ? "is-danger" : undefined}>
              {formatRupiah(outstandingInvoices)}
            </strong>
          </div>
          <div>
            <span>Due day</span>
            <strong>Day {lease.dueDay}</strong>
          </div>
        </div>
      </section>

      <div className="tenant-detail__grid">
        <div className="tenant-col">
          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">
                <ShieldCheck size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                Deposit ledger
              </h2>
              <Badge variant={depositBadgeVariant[deposit.status] ?? "secondary"}>
                {depositStatusLabel[deposit.status]}
              </Badge>
            </div>

            <div className="deposit-grid">
              <div>
                <span>Expected</span>
                <strong>{formatRupiah(deposit.expected)}</strong>
              </div>
              <div>
                <span>Collected</span>
                <strong>{formatRupiah(deposit.collected)}</strong>
              </div>
              <div>
                <span>Deductions</span>
                <strong>{formatRupiah(deposit.deductions)}</strong>
              </div>
              <div>
                <span>Held now</span>
                <strong>{formatRupiah(deposit.held)}</strong>
              </div>
            </div>

            <div className="deposit-progress">
              <Progress value={collectPct} />
              <div className="deposit-progress__label">
                {formatRupiah(deposit.collected)} of {formatRupiah(deposit.expected)} collected
                {deposit.outstanding > 0 ? ` · ${formatRupiah(deposit.outstanding)} outstanding` : ""}
              </div>
            </div>

            <div className="deposit-ledger">
              {deposit.transactions.length ? (
                deposit.transactions.map((txn) => {
                  const meta = txnMeta[txn.type];
                  return (
                    <div className="deposit-ledger__row" key={txn.id}>
                      <div className="deposit-ledger__main">
                        <div className="deposit-ledger__type">{meta.label}</div>
                        <div className="deposit-ledger__meta">
                          {formatDate(txn.date)}
                          {txn.method ? ` · ${titleCase(txn.method)}` : ""}
                          {txn.reference ? ` · ${txn.reference}` : ""}
                          {txn.note ? ` · ${txn.note}` : ""}
                        </div>
                      </div>
                      <div className={`deposit-ledger__amount ${meta.tone}`}>
                        {meta.sign}
                        {formatRupiah(txn.amount)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="tenant-empty">
                  <PiggyBank size={26} />
                  <p>No deposit recorded yet. Use “Record deposit” to log the move-in payment.</p>
                </div>
              )}
            </div>
          </section>

          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">
                <ReceiptText size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                Invoices
              </h2>
              <Link className="tenant-panel__link" href="/invoices">
                Payments <ChevronRight size={13} />
              </Link>
            </div>
            {leaseInvoices.length ? (
              <div className="tenant-pay">
                {leaseInvoices.map((invoice) => (
                  <div className="tenant-pay__row" key={invoice.id}>
                    <div>
                      <div className="tenant-pay__period">{invoice.period}</div>
                      <div className="tenant-pay__meta">due {formatDate(invoice.dueDate)}</div>
                    </div>
                    <div className="tenant-pay__right">
                      <div className="tenant-pay__amount">{formatRupiah(invoice.total)}</div>
                      <StatusTag value={invoice.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="tenant-empty">
                <Wallet size={26} />
                <p>No invoices generated for this lease yet.</p>
              </div>
            )}
          </section>
        </div>

        <div className="tenant-col">
          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">Lease terms</h2>
            </div>
            <div className="tenant-tenancy__grid">
              <div>
                <span>Rent</span>
                <strong>
                  {formatRupiah(lease.rentAmount)}
                  {cycleSuffix(lease.billingCycle)}
                </strong>
              </div>
              <div>
                <span>Billing</span>
                <strong>{titleCase(lease.billingCycle)}</strong>
              </div>
              <div>
                <span>Expected deposit</span>
                <strong>{formatRupiah(lease.depositAmount)}</strong>
              </div>
              <div>
                <span>Due day</span>
                <strong>Day {lease.dueDay}</strong>
              </div>
              <div>
                <span>Start</span>
                <strong>{formatDate(lease.startDate)}</strong>
              </div>
              <div>
                <span>End</span>
                <strong>{formatDate(lease.endDate)}</strong>
              </div>
            </div>
          </section>

          <section className="tenant-panel">
            <div className="tenant-panel__head">
              <h2 className="tenant-panel__title">
                <Users size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                Tenants
              </h2>
            </div>
            <div className="lease-tenants">
              {leaseTenants.map((t) =>
                t ? (
                  <Link className="lease-tenants__row" href={`/tenants/${t.id}`} key={t.id}>
                    <div>
                      <div className="lease-tenants__name">{t.fullName}</div>
                      <div className="lease-tenants__meta">{t.phoneWa}</div>
                    </div>
                    <ChevronRight size={15} />
                  </Link>
                ) : null
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
