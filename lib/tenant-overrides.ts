import type { Tenant } from "./types";

const storageKey = "rentra.tenantOverrides.v1";

export type TenantOverride = Partial<
  Pick<Tenant, "fullName" | "phoneWa" | "email" | "idNumber" | "emergencyContact" | "notes">
>;

export type TenantOverrideMap = Record<string, TenantOverride>;

export function loadTenantOverrides(): TenantOverrideMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as TenantOverrideMap;
  } catch {
    return {};
  }
}

export function saveTenantOverride(id: string, patch: TenantOverride): TenantOverrideMap {
  const all = loadTenantOverrides();
  const next = { ...all, [id]: { ...all[id], ...patch } };
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  return next;
}

export function applyOverride(tenant: Tenant, overrides: TenantOverrideMap): Tenant {
  const patch = overrides[tenant.id];
  return patch ? { ...tenant, ...patch } : tenant;
}
