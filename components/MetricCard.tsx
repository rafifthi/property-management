export default function MetricCard({
  icon,
  label,
  value,
  hint
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="grid gap-1 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">{icon}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {hint && <div className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</div>}
    </div>
  );
}
