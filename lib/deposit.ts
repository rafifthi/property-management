import { depositTransactions as seedDepositTransactions } from "./sample-data";
import type { DepositStatus, DepositTransaction, Lease } from "./types";

export interface DepositSummary {
  expected: number; // lease.depositAmount
  collected: number;
  deductions: number;
  refunded: number;
  forfeited: number;
  held: number; // collected − deductions − refunded − forfeited
  outstanding: number; // amount still to collect = max(expected − collected, 0)
  settled: boolean; // a refund or forfeit has been recorded
  status: DepositStatus;
  transactions: DepositTransaction[]; // newest first
}

// Merge the seeded ledger with any session transactions for one lease.
export function depositTxnsForLease(
  leaseId: string,
  sessionTxns: DepositTransaction[] = []
): DepositTransaction[] {
  return [...seedDepositTransactions, ...sessionTxns].filter((txn) => txn.leaseId === leaseId);
}

function sumOf(txns: DepositTransaction[], type: DepositTransaction["type"]) {
  return txns.filter((txn) => txn.type === type).reduce((total, txn) => total + txn.amount, 0);
}

export function depositSummary(
  lease: Pick<Lease, "depositAmount" | "status">,
  txns: DepositTransaction[]
): DepositSummary {
  const expected = lease.depositAmount;
  const collected = sumOf(txns, "collected");
  const deductions = sumOf(txns, "deduction");
  const refunded = sumOf(txns, "refund");
  const forfeited = sumOf(txns, "forfeit");
  const held = collected - deductions - refunded - forfeited;
  const outstanding = Math.max(expected - collected, 0);
  const settled = refunded > 0 || forfeited > 0 || (lease.status !== "active" && deductions > 0 && held <= 0);

  let status: DepositStatus;
  if (settled) {
    status = refunded > 0 ? "refunded" : "forfeited";
  } else if (lease.status !== "active" && held > 0) {
    status = "settling";
  } else if (collected === 0) {
    status = "due";
  } else if (collected < expected) {
    status = "partial";
  } else {
    status = "held";
  }

  const transactions = [...txns].sort((a, b) => b.date.localeCompare(a.date));

  return {
    expected,
    collected,
    deductions,
    refunded,
    forfeited,
    held,
    outstanding,
    settled,
    status,
    transactions
  };
}

export const depositStatusLabel: Record<DepositStatus, string> = {
  due: "Due",
  partial: "Partly collected",
  held: "Held",
  settling: "Settling",
  refunded: "Refunded",
  forfeited: "Forfeited"
};
