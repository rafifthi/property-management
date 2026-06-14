"use client";

import PageHeader from "@/components/PageHeader";
import StatusTag from "@/components/StatusTag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, titleCase } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { tenants, utilityMeters, utilityOrders, utilityReadings } from "@/lib/sample-data";
import type { UtilityMeter, UtilityOrder, UtilityReading } from "@/lib/types";

export default function UtilitiesPage() {
  const margin = utilityOrders.reduce((sum, order) => sum + order.platformFee, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Utilities & PPOB" }]}
        title="Utilities & PPOB"
        copy="Meter readings become invoice lines. PPOB orders use base cost plus platform fee, with stub biller fulfillment until a live aggregator is selected."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">Record reading</Button>
            <Button>Create PPOB order</Button>
          </div>
        }
      />

      <section className="content-grid grid-3" style={{ marginBottom: 18 }}>
        <Card>
          <CardHeader><CardTitle>Meters</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilityMeters.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Electricity, water, gas, internet, and flat-fee utilities share one billing path.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>PPOB margin</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(margin)}</div>
            <div className="text-xs text-muted-foreground mt-1">Platform fee earned on token and bill resale.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Biller adapter</CardTitle></CardHeader>
          <CardContent>
            <Badge variant="secondary">stub</Badge>
            <div className="text-xs text-muted-foreground mt-1">Fake tokens and receipts are returned for demo flows.</div>
          </CardContent>
        </Card>
      </section>

      <section className="content-grid grid-2" style={{ marginBottom: 18 }}>
        <Card>
          <CardHeader><CardTitle>Meters</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Tariff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utilityMeters.map((meter) => {
                  const unit = getUnit(meter.unitId);
                  const property = unit ? getProperty(unit) : undefined;
                  return (
                    <TableRow key={meter.id}>
                      <TableCell>
                        <strong>{meter.label}</strong>
                        <div className="row-subtitle">{property?.name} / {unit?.code}</div>
                      </TableCell>
                      <TableCell>{titleCase(meter.type)}</TableCell>
                      <TableCell className="text-right">{formatRupiah(meter.tariffPerUnit)} / unit</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Readings</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Meter</TableHead>
                  <TableHead className="text-right">Usage</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {utilityReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{reading.period}</TableCell>
                    <TableCell>{utilityMeters.find((m) => m.id === reading.meterId)?.label ?? "-"}</TableCell>
                    <TableCell className="text-right">{reading.usage}</TableCell>
                    <TableCell className="text-right">{formatRupiah(reading.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader><CardTitle>PPOB Orders</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right">Platform fee</TableHead>
                <TableHead className="text-right">Sell amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {utilityOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <strong>{titleCase(order.product)}</strong>
                    <div className="row-subtitle">{order.customerRef}</div>
                  </TableCell>
                  <TableCell>{tenants.find((t) => t.id === order.tenantId)?.fullName ?? "-"}</TableCell>
                  <TableCell className="text-right">{formatRupiah(order.baseAmount)}</TableCell>
                  <TableCell className="text-right"><span className="text-green-600">{formatRupiah(order.platformFee)}</span></TableCell>
                  <TableCell className="text-right">{formatRupiah(order.sellAmount)}</TableCell>
                  <TableCell><StatusTag value={order.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
