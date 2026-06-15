import type {
  DepositTransaction,
  Invoice,
  InvoiceStatus,
  Lease,
  Unit,
  UnitStatus
} from "./types";

// Prototype persistence: leases/invoices/deposits are seeded read-only, so
// in-session edits (record payment, collect/refund deposit, end lease) live in
// localStorage and are merged on top of the seed data. Mirrors tenant-overrides.
const storageKey = "rentra.moneyStore.v1";

export interface MoneyStore {
  depositTxns: DepositTransaction[];
  leaseStatus: Record<string, Lease["status"]>;
  unitStatus: Record<string, UnitStatus>;
  invoicePaid: Record<string, number>; // absolute paidAmount override
  invoiceStatus: Record<string, InvoiceStatus>;
}

const emptyStore: MoneyStore = {
  depositTxns: [],
  leaseStatus: {},
  unitStatus: {},
  invoicePaid: {},
  invoiceStatus: {}
};

export function loadMoneyStore(): MoneyStore {
  if (typeof window === "undefined") return emptyStore;
  try {
    return { ...emptyStore, ...(JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as Partial<MoneyStore>) };
  } catch {
    return emptyStore;
  }
}

function persist(store: MoneyStore): MoneyStore {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(store));
  }
  return store;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function addDepositTxn(txn: DepositTransaction): MoneyStore {
  const store = loadMoneyStore();
  return persist({ ...store, depositTxns: [...store.depositTxns, txn] });
}

export function setLeaseStatus(leaseId: string, status: Lease["status"]): MoneyStore {
  const store = loadMoneyStore();
  return persist({ ...store, leaseStatus: { ...store.leaseStatus, [leaseId]: status } });
}

export function setUnitStatus(unitId: string, status: UnitStatus): MoneyStore {
  const store = loadMoneyStore();
  return persist({ ...store, unitStatus: { ...store.unitStatus, [unitId]: status } });
}

export function recordInvoicePayment(
  invoiceId: string,
  paidAmount: number,
  status: InvoiceStatus
): MoneyStore {
  const store = loadMoneyStore();
  return persist({
    ...store,
    invoicePaid: { ...store.invoicePaid, [invoiceId]: paidAmount },
    invoiceStatus: { ...store.invoiceStatus, [invoiceId]: status }
  });
}

// Settling a move-out can touch several stores at once; apply atomically.
export function applyMoveOut(input: {
  leaseId: string;
  unitId: string;
  depositTxns: DepositTransaction[];
}): MoneyStore {
  const store = loadMoneyStore();
  return persist({
    ...store,
    leaseStatus: { ...store.leaseStatus, [input.leaseId]: "ended" },
    unitStatus: { ...store.unitStatus, [input.unitId]: "vacant" },
    depositTxns: [...store.depositTxns, ...input.depositTxns]
  });
}

export function effectiveLease(lease: Lease, store: MoneyStore): Lease {
  const status = store.leaseStatus[lease.id];
  return status ? { ...lease, status } : lease;
}

export function effectiveUnit(unit: Unit, store: MoneyStore): Unit {
  const status = store.unitStatus[unit.id];
  return status ? { ...unit, status } : unit;
}

export function effectiveInvoice(invoice: Invoice, store: MoneyStore): Invoice {
  const paidAmount = store.invoicePaid[invoice.id];
  const status = store.invoiceStatus[invoice.id];
  if (paidAmount === undefined && status === undefined) return invoice;
  return {
    ...invoice,
    paidAmount: paidAmount ?? invoice.paidAmount,
    status: status ?? invoice.status
  };
}
