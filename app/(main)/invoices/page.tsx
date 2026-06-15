"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRupiah, titleCase } from "@/lib/format";
import { getLease, getProperty, getUnit } from "@/lib/metrics";
import { invoiceLines, invoices, payments, tenants } from "@/lib/sample-data";
import {
  effectiveInvoice,
  loadMoneyStore,
  recordInvoicePayment,
  type MoneyStore,
} from "@/lib/money-store";
import type { Invoice } from "@/lib/types";

const OUTSTANDING = ["sent", "partial", "overdue"];

function waDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

// ── Record payment ────────────────────────────────────────────────
function RecordPaymentDialog({
  invoice,
  onSaved,
}: {
  invoice: Invoice;
  onSaved: (store: MoneyStore) => void;
}) {
  const remaining = invoice.total - invoice.paidAmount;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState<"transfer" | "cash" | "gateway">("transfer");

  useEffect(() => {
    if (open) {
      setAmount(String(remaining));
      setMethod("transfer");
    }
  }, [open, remaining]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;
    const newPaid = Math.min(invoice.paidAmount + value, invoice.total);
    const status = newPaid >= invoice.total ? "paid" : "partial";
    onSaved(recordInvoicePayment(invoice.id, newPaid, status));
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={invoice.status === "paid"} size="sm" variant="outline">
          Record payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment · {invoice.id}</DialogTitle>
          <DialogDescription>
            {formatRupiah(invoice.paidAmount)} of {formatRupiah(invoice.total)} paid ·{" "}
            {formatRupiah(remaining)} remaining. Partial payments are supported.
          </DialogDescription>
        </DialogHeader>
        <form className="money-form" onSubmit={handleSubmit}>
          <div className="money-form__field">
            <Label htmlFor="pay-amount">Amount (Rp)</Label>
            <Input
              id="pay-amount"
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
          <DialogFooter className="money-form__footer">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save payment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Invoice detail ────────────────────────────────────────────────
function InvoiceDetailDialog({ invoice }: { invoice: Invoice }) {
  const lines = invoiceLines.filter((line) => line.invoiceId === invoice.id);
  const invoicePayments = payments.filter((payment) => payment.invoiceId === invoice.id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{invoice.id}</DialogTitle>
          <DialogDescription>
            {invoice.period} · due {formatDate(invoice.dueDate)}
          </DialogDescription>
        </DialogHeader>
        <div className="invoice-detail">
          <div className="invoice-detail__section">Lines</div>
          {lines.length ? (
            lines.map((line) => (
              <div className="invoice-detail__row" key={line.id}>
                <div>
                  <Badge variant="secondary">{titleCase(line.type)}</Badge>
                  <span className="invoice-detail__desc">{line.description}</span>
                </div>
                <strong>{formatRupiah(line.amount)}</strong>
              </div>
            ))
          ) : (
            <div className="invoice-detail__muted">No line breakdown recorded.</div>
          )}

          <div className="invoice-detail__total">
            <span>Total</span>
            <strong>{formatRupiah(invoice.total)}</strong>
          </div>

          <div className="invoice-detail__section">Payments</div>
          {invoicePayments.length ? (
            invoicePayments.map((payment) => (
              <div className="invoice-detail__row" key={payment.id}>
                <div>
                  <Badge variant="success">{titleCase(payment.method)}</Badge>
                  <span className="invoice-detail__desc">
                    {payment.reference} · {formatDate(payment.paidAt)}
                  </span>
                </div>
                <strong>{formatRupiah(payment.amount)}</strong>
              </div>
            ))
          ) : (
            <div className="invoice-detail__muted">
              {invoice.paidAmount > 0
                ? `${formatRupiah(invoice.paidAmount)} recorded this session.`
                : "No payments yet."}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type Filter = "outstanding" | "paid" | "all";

export default function PaymentsPage() {
  const [store, setStore] = useState<MoneyStore>(loadMoneyStore);
  const [filter, setFilter] = useState<Filter>("outstanding");

  useEffect(() => {
    setStore(loadMoneyStore());
  }, []);

  const rows = useMemo(
    () => invoices.map((invoice) => effectiveInvoice(invoice, store)),
    [store]
  );

  const openTotal = rows
    .filter((invoice) => OUTSTANDING.includes(invoice.status))
    .reduce((total, invoice) => total + invoice.total - invoice.paidAmount, 0);
  const overdueTotal = rows
    .filter((invoice) => invoice.status === "overdue")
    .reduce((total, invoice) => total + invoice.total - invoice.paidAmount, 0);

  const counts = {
    outstanding: rows.filter((i) => OUTSTANDING.includes(i.status)).length,
    paid: rows.filter((i) => i.status === "paid").length,
    all: rows.length,
  };

  const visible = rows
    .filter((invoice) => {
      if (filter === "outstanding") return OUTSTANDING.includes(invoice.status);
      if (filter === "paid") return invoice.status === "paid";
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Payments" }]}
        title="Payments"
        copy="Work the arrears list top-down: record payments (full or partial) and nudge tenants on WhatsApp. Gateway links are stubbed; manual reconcile always works."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Generate June invoices</Button>
            <Button>Send reminders</Button>
          </div>
        }
      />

      <section className="content-grid grid-3" style={{ marginBottom: 18 }}>
        <Card>
          <CardHeader>
            <CardTitle>Open receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(openTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">Across sent, partial, and overdue invoices.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: overdueTotal > 0 ? "#ef4444" : undefined }}>
              {formatRupiah(overdueTotal)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Past the due date — chase these first.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment adapter</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">stub</Badge>
            <div className="text-xs text-muted-foreground mt-1">Dummy links now; Xendit swaps in later with no UI change.</div>
          </CardContent>
        </Card>
      </section>

      <Tabs onValueChange={(v) => setFilter(v as Filter)} value={filter}>
        <TabsList>
          <TabsTrigger value="outstanding">Outstanding ({counts.outstanding})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({counts.paid})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card style={{ marginTop: 14 }}>
        <CardContent style={{ paddingTop: 18 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Lease</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((invoice) => {
                const lease = getLease(invoice);
                const unit = lease ? getUnit(lease) : undefined;
                const property = unit ? getProperty(unit) : undefined;
                const balance = invoice.total - invoice.paidAmount;
                const primaryTenant = lease ? tenants.find((t) => t.id === lease.tenantIds[0]) : undefined;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-semibold">{invoice.id}</div>
                      <div className="row-subtitle">{invoice.period}</div>
                    </TableCell>
                    <TableCell>
                      {lease ? (
                        <Link className="tenant-panel__link" href={`/leases/${lease.id}`}>
                          {property?.name ?? "-"} / {unit?.code ?? "-"}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(invoice.total)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(balance)}</TableCell>
                    <TableCell>
                      <StatusTag value={invoice.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <RecordPaymentDialog invoice={invoice} onSaved={setStore} />
                        <InvoiceDetailDialog invoice={invoice} />
                        {primaryTenant && invoice.status !== "paid" ? (
                          <Button asChild size="sm" variant="ghost">
                            <a
                              href={`https://wa.me/${waDigits(primaryTenant.phoneWa)}`}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <MessageCircle size={14} />
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={7}>
                    Nothing here — all caught up.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
