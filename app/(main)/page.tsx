"use client";

import { ArrowRight, Building2, CircleDollarSign, ReceiptText, Wrench } from "lucide-react";
import Link from "next/link";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah, percent } from "@/lib/format";
import { dashboardMetrics, getLease, getProperty, getUnit, propertyOccupancy } from "@/lib/metrics";
import { invoices, properties, tickets } from "@/lib/sample-data";
import type { Invoice, Property } from "@/lib/types";

const metrics = dashboardMetrics();

export default function DashboardPage() {
  const openTickets = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status));
  const atRiskInvoices = invoices.filter((invoice) => ["sent", "partial", "overdue"].includes(invoice.status));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Dashboard" }]}
        title="Dashboard"
        copy="Track occupancy, invoices, complaints, utility billing, and integration readiness from one landlord workspace."
        actions={
          <div className="flex gap-2">
            <Button variant="default" asChild>
              <Link href="/invoices">Send reminders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/properties">Add property</Link>
            </Button>
          </div>
        }
      />

      <section className="content-grid grid-4" style={{ marginBottom: 18 }}>
        <MetricCard
          label="Occupancy"
          value={percent(metrics.occupancyRate)}
          hint={`${metrics.occupiedUnits} occupied, ${metrics.vacantUnits} vacant, ${metrics.maintenanceUnits} maintenance`}
          icon={<Building2 size={20} color="#2563eb" />}
        />
        <MetricCard
          label="Collected"
          value={formatRupiah(metrics.collected)}
          hint={`${metrics.paidInvoiceCount} paid invoices from current sample ledger`}
          icon={<CircleDollarSign size={20} color="#047857" />}
        />
        <MetricCard
          label="Overdue"
          value={<span style={{ color: "#b42318" }}>{formatRupiah(metrics.overdueAmount)}</span>}
          hint={`${atRiskInvoices.length} invoices need follow-up`}
          icon={<ReceiptText size={20} color="#b42318" />}
        />
        <MetricCard
          label="Open tickets"
          value={metrics.openTicketCount}
          hint={`${metrics.expiringDocumentCount} documents or contracts expiring soon`}
          icon={<Wrench size={20} color="#d97706" />}
        />
      </section>

      <section className="content-grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Portfolio Occupancy</CardTitle>
            <Link href="/properties" className="text-sm text-primary flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Occupancy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const occupancy = propertyOccupancy(property.id);
                  return (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="font-semibold">{property.name}</div>
                        <div className="row-subtitle">{property.address}</div>
                      </TableCell>
                      <TableCell><StatusTag value={property.type} /></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 w-[180px]">
                          <Progress value={Number((occupancy.rate * 100).toFixed(0))} />
                          <span className="row-subtitle">{occupancy.occupied}/{occupancy.total} occupied</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Complaints</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {openTickets.map((ticket) => {
              const unit = getUnit(ticket.unitId);
              const property = unit ? getProperty(unit) : undefined;
              return (
                <div key={ticket.id} className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0">
                  <div className="grid gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{ticket.title}</span>
                      <StatusTag value={ticket.status} />
                    </div>
                    <span className="row-subtitle">{property?.name ?? "Unknown property"} / {unit?.code ?? "-"} - {ticket.category}</span>
                  </div>
                  <span className="row-subtitle shrink-0">{formatDate(ticket.createdAt)}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Invoices Needing Attention</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {atRiskInvoices.map((invoice) => {
                const lease = getLease(invoice);
                const unit = lease ? getUnit(lease) : undefined;
                const property = unit ? getProperty(unit) : undefined;
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-semibold">{invoice.id}</TableCell>
                    <TableCell>
                      <div>{unit?.code ?? "-"}</div>
                      <div className="row-subtitle">{property?.name}</div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatRupiah(invoice.total)}</TableCell>
                    <TableCell><StatusTag value={invoice.status} /></TableCell>
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
