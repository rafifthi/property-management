"use client";

import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import { getLease, getProperty, getUnit } from "@/lib/metrics";
import { invoiceLines, invoices } from "@/lib/sample-data";
import type { Invoice } from "@/lib/types";

export default function InvoicesPage() {
  const openTotal = invoices.reduce((total, invoice) => total + invoice.total - invoice.paidAmount, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Payments" }]}
        title="Payments"
        copy="Gateway links and WA sends are provider-backed. The prototype ships with dummy adapters and keeps manual mark-paid available."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Generate June invoices</Button>
            <Button>Send reminders</Button>
          </div>
        }
      />

      <section className="content-grid grid-3" style={{ marginBottom: 18 }}>
        <Card>
          <CardHeader><CardTitle>Open receivables</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(openTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">Outstanding across sent, partial, and overdue invoices.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Payment adapter</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="secondary">stub</Badge>
            <div className="text-xs text-muted-foreground mt-1">Dummy payment links now; Xendit can replace the provider later.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoice line mix</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceLines.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Rent, utility, deposit, discount, PPOB, and fee lines share one invoice model.</div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>Invoice Ledger</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Lease</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const lease = getLease(invoice);
                const unit = lease ? getUnit(lease) : undefined;
                const property = unit ? getProperty(unit) : undefined;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-semibold">{invoice.id}</div>
                      <div className="row-subtitle">{invoice.period}</div>
                    </TableCell>
                    <TableCell>{property?.name ?? "-"} / {unit?.code ?? "-"}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(invoice.total)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(invoice.paidAmount)}</TableCell>
                    <TableCell><StatusTag value={invoice.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" disabled={invoice.status === "paid"}>Mark paid</Button>
                        <Button variant="outline" size="sm" disabled={invoice.status === "paid"}>WA reminder</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
