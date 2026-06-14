import {
  documents,
  invoices,
  leases,
  properties,
  tickets,
  units,
  utilityOrders
} from "@/lib/sample-data";
import type { Invoice, Lease, Property, Unit } from "@/lib/types";

export function dashboardMetrics() {
  const occupiedUnits = units.filter((unit) => unit.status === "occupied").length;
  const maintenanceUnits = units.filter((unit) => unit.status === "maintenance").length;
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");
  const unpaidInvoices = invoices.filter((invoice) =>
    ["sent", "partial", "overdue"].includes(invoice.status)
  );
  const expected = invoices.reduce((total, invoice) => total + invoice.total, 0);
  const collected = invoices.reduce((total, invoice) => total + invoice.paidAmount, 0);
  const ppobMargin = utilityOrders.reduce((total, order) => total + order.platformFee, 0);

  return {
    occupancyRate: occupiedUnits / units.length,
    occupiedUnits,
    vacantUnits: units.filter((unit) => unit.status === "vacant").length,
    maintenanceUnits,
    expected,
    collected,
    overdueAmount: unpaidInvoices.reduce((total, invoice) => {
      if (invoice.status === "overdue") {
        return total + invoice.total - invoice.paidAmount;
      }
      return total;
    }, 0),
    paidInvoiceCount: paidInvoices.length,
    openTicketCount: tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length,
    ppobMargin,
    expiringDocumentCount: documents.filter((doc) => doc.expiryDate && doc.expiryDate < "2026-10-01").length
  };
}

export function getProperty(unit: Unit): Property | undefined {
  return properties.find((property) => property.id === unit.propertyId);
}

export function getUnit(leaseOrUnitId: Lease | string): Unit | undefined {
  const unitId = typeof leaseOrUnitId === "string" ? leaseOrUnitId : leaseOrUnitId.unitId;
  return units.find((unit) => unit.id === unitId);
}

export function getLease(invoiceOrLeaseId: Invoice | string): Lease | undefined {
  const leaseId = typeof invoiceOrLeaseId === "string" ? invoiceOrLeaseId : invoiceOrLeaseId.leaseId;
  return leases.find((lease) => lease.id === leaseId);
}

export function propertyOccupancy(propertyId: string) {
  const propertyUnits = units.filter((unit) => unit.propertyId === propertyId);
  const occupied = propertyUnits.filter((unit) => unit.status === "occupied").length;
  return {
    total: propertyUnits.length,
    occupied,
    vacant: propertyUnits.filter((unit) => unit.status === "vacant").length,
    maintenance: propertyUnits.filter((unit) => unit.status === "maintenance").length,
    rate: propertyUnits.length ? occupied / propertyUnits.length : 0
  };
}
