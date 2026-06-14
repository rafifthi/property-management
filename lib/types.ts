export type PropertyType = "kontrakan" | "kos" | "ruko" | "apartemen" | "custom";
export type UnitStatus = "vacant" | "occupied" | "maintenance";
export type BillingCycle = "monthly" | "yearly";
export type InvoiceStatus = "draft" | "sent" | "paid" | "partial" | "overdue" | "void";
export type TicketStatus =
  | "new"
  | "triaged"
  | "assigned"
  | "scheduled"
  | "in_progress"
  | "resolved"
  | "closed";
export type IntegrationKind = "wa" | "payment" | "ppob";
export type IntegrationMode = "stub" | "live";
export type UtilityProduct = "pln_token" | "pdam" | "pulsa" | "other";

export interface Organization {
  id: string;
  name: string;
}

export interface Property {
  id: string;
  orgId: string;
  name: string;
  type: PropertyType;
  address: string;
  image?: string;
  notes?: string;
}

export interface UnitGroup {
  id: string;
  propertyId: string;
  name: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  groupId?: string;
  code: string;
  baseRent: number;
  defaultBillingCycle: BillingCycle;
  status: UnitStatus;
  attributes: Record<string, string | number | boolean>;
}

export interface Tenant {
  id: string;
  fullName: string;
  phoneWa: string;
  email?: string;
  idNumber: string;
  emergencyContact: string;
  notes?: string;
}

export interface Lease {
  id: string;
  unitId: string;
  tenantIds: string[];
  startDate: string;
  endDate: string;
  rentAmount: number;
  depositAmount: number;
  billingCycle: BillingCycle;
  dueDay: number;
  status: "active" | "ended" | "terminated";
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  type: "rent" | "utility" | "ppob" | "fee" | "deposit" | "discount";
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  leaseId: string;
  period: string;
  dueDate: string;
  total: number;
  status: InvoiceStatus;
  paidAmount: number;
  paymentUrl?: string;
  paidAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: "gateway" | "cash" | "transfer";
  reference: string;
  paidAt: string;
}

export interface UtilityMeter {
  id: string;
  unitId: string;
  type: "electricity" | "water" | "gas" | "internet" | "other";
  label: string;
  tariffPerUnit: number;
}

export interface UtilityReading {
  id: string;
  meterId: string;
  period: string;
  prevReading: number;
  currReading: number;
  usage: number;
  amount: number;
}

export interface UtilityOrder {
  id: string;
  tenantId?: string;
  unitId?: string;
  product: UtilityProduct;
  customerRef: string;
  baseAmount: number;
  platformFee: number;
  sellAmount: number;
  status: "quoted" | "pending_payment" | "paid" | "fulfilled" | "failed";
  channel: "wa" | "web";
  providerRef?: string;
  token?: string;
}

export interface Vendor {
  id: string;
  name: string;
  serviceType: string;
  phone: string;
}

export interface Ticket {
  id: string;
  unitId: string;
  tenantId?: string;
  reporterName: string;
  reporterPhone: string;
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: TicketStatus;
  source: "form" | "manual";
  createdAt: string;
  assignedVendorId?: string;
  scheduledAt?: string;
  estimatedCost?: number;
}

export interface Document {
  id: string;
  name: string;
  category: "contract" | "personal" | "other";
  relatedType?: "tenant" | "lease" | "property" | "unit";
  relatedId?: string;
  expiryDate?: string;
}

export interface IntegrationSetting {
  id: string;
  kind: IntegrationKind;
  provider: string;
  mode: IntegrationMode;
  enabled: boolean;
  config: Record<string, string | number | boolean>;
}

export interface MessageTemplate {
  id: string;
  key:
    | "rent_reminder"
    | "payment_confirmed"
    | "ticket_update"
    | "lease_expiry"
    | "token_ready";
  channel: "wa";
  body: string;
  variables: string[];
}
