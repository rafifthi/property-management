"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRupiah } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { leases, tenants } from "@/lib/sample-data";
import { depositSummary, depositTxnsForLease } from "@/lib/deposit";
import { effectiveLease, loadMoneyStore, type MoneyStore } from "@/lib/money-store";

const TODAY = "2026-06-15";
const ENDING_SOON_DAYS = 90;

function daysUntil(date: string) {
  return Math.round((new Date(date).getTime() - new Date(TODAY).getTime()) / 86_400_000);
}

type Filter = "active" | "ending" | "ended" | "all";

export default function LeasesPage() {
  const router = useRouter();
  const [store, setStore] = useState<MoneyStore>(loadMoneyStore);
  const [filter, setFilter] = useState<Filter>("active");

  useEffect(() => {
    setStore(loadMoneyStore());
  }, []);

  const rows = useMemo(() => {
    return leases.map((base) => {
      const lease = effectiveLease(base, store);
      const unit = getUnit(lease);
      const property = unit ? getProperty(unit) : undefined;
      const deposit = depositSummary(lease, depositTxnsForLease(lease.id, store.depositTxns));
      const endsIn = daysUntil(lease.endDate);
      const endingSoon = lease.status === "active" && endsIn >= 0 && endsIn <= ENDING_SOON_DAYS;
      return { lease, unit, property, deposit, endsIn, endingSoon };
    });
  }, [store]);

  const counts = useMemo(
    () => ({
      active: rows.filter((r) => r.lease.status === "active").length,
      ending: rows.filter((r) => r.endingSoon).length,
      ended: rows.filter((r) => r.lease.status !== "active").length,
      all: rows.length,
    }),
    [rows]
  );

  const visible = rows
    .filter((r) => {
      if (filter === "active") return r.lease.status === "active";
      if (filter === "ending") return r.endingSoon;
      if (filter === "ended") return r.lease.status !== "active";
      return true;
    })
    .sort((a, b) => a.lease.endDate.localeCompare(b.lease.endDate));

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Leases" }]}
        title="Leases"
        copy="A lease ties tenants to a unit, holds the deposit, and drives invoices. Open a lease to manage its deposit ledger and settle move-outs."
        actions={<Button>Create lease</Button>}
      />

      <Tabs onValueChange={(v) => setFilter(v as Filter)} value={filter}>
        <TabsList>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="ending">Ending soon ({counts.ending})</TabsTrigger>
          <TabsTrigger value="ended">Ended ({counts.ended})</TabsTrigger>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card style={{ marginTop: 14 }}>
        <CardContent style={{ paddingTop: 18 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit</TableHead>
                <TableHead>Tenants</TableHead>
                <TableHead>Term</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-right">Deposit held</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(({ lease, unit, property, deposit, endsIn, endingSoon }) => (
                <TableRow
                  className="cursor-pointer"
                  key={lease.id}
                  onClick={() => router.push(`/leases/${lease.id}`)}
                >
                  <TableCell>
                    <div className="font-semibold">{unit?.code}</div>
                    <div className="row-subtitle">{property?.name}</div>
                  </TableCell>
                  <TableCell>
                    {lease.tenantIds.map((id) => tenants.find((t) => t.id === id)?.fullName).join(", ")}
                  </TableCell>
                  <TableCell>
                    {formatDate(lease.startDate)} – {formatDate(lease.endDate)}
                    {endingSoon ? (
                      <Badge style={{ marginLeft: 8 }} variant="warning">
                        {endsIn}d left
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(lease.rentAmount)} / {lease.billingCycle}
                  </TableCell>
                  <TableCell className="text-right">{formatRupiah(deposit.held)}</TableCell>
                  <TableCell>
                    <StatusTag value={lease.status} />
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell className="text-muted-foreground" colSpan={6}>
                    No leases in this view.
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
