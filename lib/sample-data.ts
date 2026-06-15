import type {
  Document,
  IntegrationSetting,
  Invoice,
  InvoiceLine,
  Lease,
  MessageTemplate,
  Organization,
  Payment,
  Property,
  Tenant,
  Ticket,
  Unit,
  UnitGroup,
  UtilityMeter,
  UtilityOrder,
  UtilityReading,
  Vendor
} from "@/lib/types";

export const organization: Organization = {
  id: "org-rumahhub-demo",
  name: "RumahHub Demo Portfolio"
};

export const properties: Property[] = [
  {
    id: "prop-kos-melati",
    orgId: organization.id,
    name: "Kos Melati",
    type: "kos",
    address: "Jl. Melati No. 12, Jakarta Selatan",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop",
    notes: JSON.stringify({
      unitSetup: {
        labels: ["Boarding House", "Kosan"],
        unitSystem: "multi"
      }
    })
  },
  {
    id: "prop-ruko-cempaka",
    orgId: organization.id,
    name: "Ruko Cempaka",
    type: "ruko",
    address: "Komplek Cempaka Trade Center Blok B",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop",
    notes: JSON.stringify({
      unitSetup: {
        labels: ["Shop House", "Commercial"],
        unitSystem: "single"
      }
    })
  },
  {
    id: "prop-apart-senayan",
    orgId: organization.id,
    name: "Apartemen Senayan View",
    type: "apartemen",
    address: "Tower A, Senayan, Jakarta Pusat",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=400&fit=crop",
    notes: JSON.stringify({
      unitSetup: {
        labels: ["Apartment", "Tower"],
        unitSystem: "multi"
      }
    })
  },
  {
    id: "prop-rumah-kenanga",
    orgId: organization.id,
    name: "Rumah Kenanga",
    type: "kontrakan",
    address: "Jl. Kenanga No. 8, Tangerang Selatan",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop",
    notes: JSON.stringify({
      unitSetup: {
        labels: ["House", "Single Unit"],
        unitSystem: "single"
      }
    })
  }
];

export const unitGroups: UnitGroup[] = [
  { id: "grp-melati-1", propertyId: "prop-kos-melati", name: "Lantai 1" },
  { id: "grp-melati-2", propertyId: "prop-kos-melati", name: "Lantai 2" },
  { id: "grp-ruko-b", propertyId: "prop-ruko-cempaka", name: "Blok B" },
  { id: "grp-senayan-a", propertyId: "prop-apart-senayan", name: "Tower A" }
];

export const units: Unit[] = [
  {
    id: "unit-m101",
    propertyId: "prop-kos-melati",
    groupId: "grp-melati-1",
    code: "M-101",
    baseRent: 1850000,
    defaultBillingCycle: "monthly",
    status: "occupied",
    attributes: { size: "12 m2", bathroom: "shared", ac: true }
  },
  {
    id: "unit-m102",
    propertyId: "prop-kos-melati",
    groupId: "grp-melati-1",
    code: "M-102",
    baseRent: 1750000,
    defaultBillingCycle: "monthly",
    status: "vacant",
    attributes: { size: "11 m2", bathroom: "shared", ac: false }
  },
  {
    id: "unit-m201",
    propertyId: "prop-kos-melati",
    groupId: "grp-melati-2",
    code: "M-201",
    baseRent: 2150000,
    defaultBillingCycle: "monthly",
    status: "maintenance",
    attributes: { size: "14 m2", bathroom: "inside", ac: true }
  },
  {
    id: "unit-rb03",
    propertyId: "prop-ruko-cempaka",
    groupId: "grp-ruko-b",
    code: "B-03",
    baseRent: 115000000,
    defaultBillingCycle: "yearly",
    status: "occupied",
    attributes: { depositAmount: 15000000, floors: 2, frontage: "4.5 m", parking: true, unitSystem: "single", unitType: "Ruko 2 Lantai" }
  },
  {
    id: "unit-a1207",
    propertyId: "prop-apart-senayan",
    groupId: "grp-senayan-a",
    code: "A-1207",
    baseRent: 7200000,
    defaultBillingCycle: "monthly",
    status: "occupied",
    attributes: { bedrooms: 2, size: "58 m2", furnished: true }
  },
  {
    id: "unit-a1511",
    propertyId: "prop-apart-senayan",
    groupId: "grp-senayan-a",
    code: "A-1511",
    baseRent: 6100000,
    defaultBillingCycle: "monthly",
    status: "vacant",
    attributes: { bedrooms: 1, size: "42 m2", furnished: false }
  },
  {
    id: "unit-rumah-kenanga",
    propertyId: "prop-rumah-kenanga",
    code: "Rumah Kenanga",
    baseRent: 3850000,
    defaultBillingCycle: "monthly",
    status: "vacant",
    attributes: { bedrooms: 2, depositAmount: 3850000, occupancyStatus: "booked", unitSystem: "single", unitType: "Rumah 2 Kamar" }
  }
];

export const tenants: Tenant[] = [
  {
    id: "tenant-andini",
    fullName: "Andini Prasetya",
    phoneWa: "+628121110001",
    email: "andini@example.com",
    idNumber: "3174********0001",
    emergencyContact: "Budi +628129990001"
  },
  {
    id: "tenant-bima",
    fullName: "Bima Wardhana",
    phoneWa: "+628131110002",
    email: "bima@example.com",
    idNumber: "3276********0002",
    emergencyContact: "Rina +628139990002"
  },
  {
    id: "tenant-cv-sinar",
    fullName: "CV Sinar Jaya",
    phoneWa: "+628571110003",
    email: "finance@sinarmart.example",
    idNumber: "NPWP 02.***.***.3-***.000",
    emergencyContact: "Pak Arif +628579990003"
  },
  {
    id: "tenant-della",
    fullName: "Della Kartika",
    phoneWa: "+628771110004",
    idNumber: "3173********0004",
    emergencyContact: "Maya +628779990004"
  },
  {
    id: "tenant-eko",
    fullName: "Eko Saputra",
    phoneWa: "+628151110005",
    email: "eko.saputra@example.com",
    idNumber: "3175********0005",
    emergencyContact: "Sari +628159990005",
    notes: "Pindah ke Surabaya setelah kontrak selesai. Tidak ada tunggakan."
  },
  {
    id: "tenant-fitri",
    fullName: "Fitri Handayani",
    phoneWa: "+628991110006",
    idNumber: "3174********0006",
    emergencyContact: "Dewi +628999990006",
    notes: "Mengakhiri sewa lebih awal karena pindah kantor."
  }
];

export const leases: Lease[] = [
  {
    id: "lease-m101",
    unitId: "unit-m101",
    tenantIds: ["tenant-andini"],
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    rentAmount: 1850000,
    depositAmount: 1850000,
    billingCycle: "monthly",
    dueDay: 5,
    status: "active"
  },
  {
    id: "lease-rb03",
    unitId: "unit-rb03",
    tenantIds: ["tenant-cv-sinar"],
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    rentAmount: 115000000,
    depositAmount: 15000000,
    billingCycle: "yearly",
    dueDay: 10,
    status: "active"
  },
  {
    id: "lease-a1207",
    unitId: "unit-a1207",
    tenantIds: ["tenant-bima", "tenant-della"],
    startDate: "2026-02-15",
    endDate: "2027-02-14",
    rentAmount: 7200000,
    depositAmount: 7200000,
    billingCycle: "monthly",
    dueDay: 15,
    status: "active"
  },
  {
    id: "lease-andini-m102-2025",
    unitId: "unit-m102",
    tenantIds: ["tenant-andini"],
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    rentAmount: 1750000,
    depositAmount: 1750000,
    billingCycle: "monthly",
    dueDay: 5,
    status: "ended"
  },
  {
    id: "lease-eko-m102-2024",
    unitId: "unit-m102",
    tenantIds: ["tenant-eko"],
    startDate: "2024-03-01",
    endDate: "2024-12-31",
    rentAmount: 1700000,
    depositAmount: 1700000,
    billingCycle: "monthly",
    dueDay: 5,
    status: "ended"
  },
  {
    id: "lease-fitri-a1511-2025",
    unitId: "unit-a1511",
    tenantIds: ["tenant-fitri"],
    startDate: "2025-04-01",
    endDate: "2026-03-31",
    rentAmount: 6000000,
    depositAmount: 6000000,
    billingCycle: "monthly",
    dueDay: 1,
    status: "terminated"
  }
];

export const invoices: Invoice[] = [
  {
    id: "inv-m101-2026-06",
    leaseId: "lease-m101",
    period: "2026-06",
    dueDate: "2026-06-05",
    total: 2125000,
    status: "overdue",
    paidAmount: 0,
    paymentUrl: "https://pay.stub.local/inv-m101-2026-06"
  },
  {
    id: "inv-a1207-2026-06",
    leaseId: "lease-a1207",
    period: "2026-06",
    dueDate: "2026-06-15",
    total: 7565000,
    status: "sent",
    paidAmount: 0,
    paymentUrl: "https://pay.stub.local/inv-a1207-2026-06"
  },
  {
    id: "inv-rb03-2026",
    leaseId: "lease-rb03",
    period: "2026",
    dueDate: "2026-03-10",
    total: 115000000,
    status: "paid",
    paidAmount: 115000000,
    paidAt: "2026-03-08T03:00:00.000Z"
  },
  {
    id: "inv-m101-2026-05",
    leaseId: "lease-m101",
    period: "2026-05",
    dueDate: "2026-05-05",
    total: 2030000,
    status: "paid",
    paidAmount: 2030000,
    paidAt: "2026-05-04T04:20:00.000Z"
  }
];

export const invoiceLines: InvoiceLine[] = [
  { id: "line-1", invoiceId: "inv-m101-2026-06", type: "rent", description: "Rent June 2026", amount: 1850000 },
  { id: "line-2", invoiceId: "inv-m101-2026-06", type: "utility", description: "Electricity usage 55 kWh", amount: 137500 },
  { id: "line-3", invoiceId: "inv-m101-2026-06", type: "utility", description: "Water usage 11 m3", amount: 137500 },
  { id: "line-4", invoiceId: "inv-a1207-2026-06", type: "rent", description: "Rent June 2026", amount: 7200000 },
  { id: "line-5", invoiceId: "inv-a1207-2026-06", type: "utility", description: "Electricity usage", amount: 365000 },
  { id: "line-6", invoiceId: "inv-rb03-2026", type: "rent", description: "Annual rent", amount: 115000000 }
];

export const payments: Payment[] = [
  {
    id: "pay-rb03",
    invoiceId: "inv-rb03-2026",
    amount: 115000000,
    method: "transfer",
    reference: "BCA-REF-9913",
    paidAt: "2026-03-08T03:00:00.000Z"
  }
];

export const utilityMeters: UtilityMeter[] = [
  { id: "meter-m101-elec", unitId: "unit-m101", type: "electricity", label: "PLN M-101", tariffPerUnit: 2500 },
  { id: "meter-m101-water", unitId: "unit-m101", type: "water", label: "Air M-101", tariffPerUnit: 12500 },
  { id: "meter-a1207-elec", unitId: "unit-a1207", type: "electricity", label: "PLN A-1207", tariffPerUnit: 2500 }
];

export const utilityReadings: UtilityReading[] = [
  {
    id: "read-m101-elec-06",
    meterId: "meter-m101-elec",
    period: "2026-06",
    prevReading: 1280,
    currReading: 1335,
    usage: 55,
    amount: 137500
  },
  {
    id: "read-m101-water-06",
    meterId: "meter-m101-water",
    period: "2026-06",
    prevReading: 310,
    currReading: 321,
    usage: 11,
    amount: 137500
  }
];

export const utilityOrders: UtilityOrder[] = [
  {
    id: "uo-001",
    tenantId: "tenant-andini",
    unitId: "unit-m101",
    product: "pln_token",
    customerRef: "530000112233",
    baseAmount: 100000,
    platformFee: 2500,
    sellAmount: 102500,
    status: "fulfilled",
    channel: "wa",
    providerRef: "STUB-PLN-001",
    token: "3719-2048-8891-6620"
  },
  {
    id: "uo-002",
    tenantId: "tenant-bima",
    unitId: "unit-a1207",
    product: "pdam",
    customerRef: "PDAM-778182",
    baseAmount: 186000,
    platformFee: 4500,
    sellAmount: 190500,
    status: "pending_payment",
    channel: "web",
    providerRef: "STUB-PDAM-002"
  }
];

export const vendors: Vendor[] = [
  { id: "vendor-jaya-ac", name: "Jaya AC Service", serviceType: "AC & electrical", phone: "+6281212345678" },
  { id: "vendor-utama", name: "Utama Plumbing", serviceType: "Plumbing", phone: "+6281512345678" }
];

export const tickets: Ticket[] = [
  {
    id: "ticket-001",
    unitId: "unit-a1207",
    tenantId: "tenant-bima",
    reporterName: "Bima Wardhana",
    reporterPhone: "+628131110002",
    category: "AC",
    title: "AC leaking in bedroom",
    description: "Water drips after 30 minutes of usage.",
    priority: "high",
    status: "scheduled",
    source: "form",
    createdAt: "2026-06-10T04:00:00.000Z",
    assignedVendorId: "vendor-jaya-ac",
    scheduledAt: "2026-06-15T03:00:00.000Z",
    estimatedCost: 450000
  },
  {
    id: "ticket-002",
    unitId: "unit-m201",
    reporterName: "Staff inspection",
    reporterPhone: "+628000000000",
    category: "Plumbing",
    title: "Bathroom renovation follow-up",
    description: "Check water pressure before unit is listed again.",
    priority: "medium",
    status: "assigned",
    source: "manual",
    createdAt: "2026-06-11T09:00:00.000Z",
    assignedVendorId: "vendor-utama",
    estimatedCost: 750000
  }
];

export const documents: Document[] = [
  {
    id: "doc-lease-m101",
    name: "Lease Agreement M-101",
    category: "contract",
    relatedType: "lease",
    relatedId: "lease-m101",
    expiryDate: "2026-12-31"
  },
  {
    id: "doc-ktp-andini",
    name: "KTP Andini",
    category: "personal",
    relatedType: "tenant",
    relatedId: "tenant-andini"
  },
  {
    id: "doc-ruko-permit",
    name: "Ruko Cempaka Business Permit",
    category: "other",
    relatedType: "property",
    relatedId: "prop-ruko-cempaka",
    expiryDate: "2026-09-01"
  }
];

export const integrationSettings: IntegrationSetting[] = [
  {
    id: "int-wa",
    kind: "wa",
    provider: "Stub WhatsApp",
    mode: "stub",
    enabled: true,
    config: { sender: "+6280000000000", throttlePerMinute: 30 }
  },
  {
    id: "int-payment",
    kind: "payment",
    provider: "Xendit Stub",
    mode: "stub",
    enabled: true,
    config: { paymentLinkPrefix: "https://pay.stub.local" }
  },
  {
    id: "int-ppob",
    kind: "ppob",
    provider: "PPOB Stub",
    mode: "stub",
    enabled: true,
    config: { flatFee: 2500, percentFee: 0.015 }
  }
];

export const messageTemplates: MessageTemplate[] = [
  {
    id: "tmpl-rent",
    key: "rent_reminder",
    channel: "wa",
    body: "Halo {{tenant_name}}, tagihan {{period}} sebesar {{amount}} jatuh tempo {{due_date}}. Bayar: {{payment_url}}",
    variables: ["tenant_name", "period", "amount", "due_date", "payment_url"]
  },
  {
    id: "tmpl-ticket",
    key: "ticket_update",
    channel: "wa",
    body: "Tiket {{ticket_title}} sekarang berstatus {{status}}. Jadwal: {{scheduled_at}}",
    variables: ["ticket_title", "status", "scheduled_at"]
  },
  {
    id: "tmpl-token",
    key: "token_ready",
    channel: "wa",
    body: "Token {{product}} untuk {{customer_ref}} berhasil: {{token}}",
    variables: ["product", "customer_ref", "token"]
  }
];
