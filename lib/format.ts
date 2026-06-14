export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  }).format(new Date(value));
}

export function percent(value: number, fractionDigits = 0) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
