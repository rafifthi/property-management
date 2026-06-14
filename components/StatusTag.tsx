import { Badge } from "./ui/badge";
import type { BadgeProps } from "./ui/badge";

const variantMap: Record<string, BadgeProps["variant"]> = {
  active: "success",
  live: "success",
  paid: "success",
  resolved: "success",
  fulfilled: "success",
  occupied: "success",
  stub: "secondary",
  pending_payment: "secondary",
  sent: "secondary",
  triaged: "secondary",
  draft: "secondary",
  quoted: "secondary",
  new: "secondary",
  inactive: "destructive",
  void: "destructive",
  closed: "destructive",
  failed: "destructive",
  overdue: "destructive",
  partial: "warning",
  assigned: "warning",
  scheduled: "default",
  in_progress: "default",
};

export default function StatusTag({ value }: { value: string }) {
  return <Badge variant={variantMap[value] ?? "secondary"}>{value}</Badge>;
}
