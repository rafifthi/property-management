"use client";

import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { leases, tenants } from "@/lib/sample-data";

export default function LeasesPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Leases" }]}
        title="Leases"
        copy="A lease can hold one or more tenants. Activating a lease makes the unit occupied; ending it returns the unit to vacant unless maintenance is applied."
        actions={<Button>Create lease</Button>}
      />

      <section className="content-grid grid-2">
        <Card>
          <CardHeader><CardTitle>Active Leases</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tenants</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leases.map((lease) => {
                  const unit = getUnit(lease);
                  const property = unit ? getProperty(unit) : undefined;
                  return (
                    <TableRow key={lease.id}>
                      <TableCell>
                        <div className="font-semibold">{unit?.code}</div>
                        <div className="row-subtitle">{property?.name}</div>
                      </TableCell>
                      <TableCell>{lease.tenantIds.map((id) => tenants.find((t) => t.id === id)?.fullName).join(", ")}</TableCell>
                      <TableCell>{formatDate(lease.startDate)} - {formatDate(lease.endDate)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(lease.rentAmount)} / {lease.billingCycle}</TableCell>
                      <TableCell><StatusTag value={lease.status} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Upcoming Contract Events</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {leases.map((lease) => {
              const unit = getUnit(lease);
              return (
                <div key={lease.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: lease.endDate < "2026-12-31" ? "#f59e0b" : "#2563eb" }} />
                  <div>
                    <div className="text-sm font-medium">{unit?.code} renewal review</div>
                    <div className="row-subtitle">Lease ends {formatDate(lease.endDate)}. Deposit held: {formatRupiah(lease.depositAmount)}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
