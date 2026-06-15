"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronUp, Edit3, Plus, Search } from "lucide-react";
import { useParams } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRupiah } from "@/lib/format";
import { leases, properties, tenants, unitGroups, units } from "@/lib/sample-data";
import type { Property, Unit, UnitStatus } from "@/lib/types";

type UnitFilter = "all" | UnitStatus;

type StoredPropertyRecord = { property: Property; units: Unit[] };

const createdPropertiesStorageKey = "rentra.createdProperties.v1";

const bannerColors: Record<string, string> = {
  kontrakan: "#f0fdf4", kos: "#f5f0ff", ruko: "#fffbeb", apartemen: "#eff6ff", custom: "#f8fafc"
};

const propertyTabs = ["Overview", "Units", "Tenants", "Maintenance", "Services & Utilities", "Leases"];

type PropertyNotes = { unitSetup?: { labels?: string[]; unitSystem?: "single" | "multi" } };

function getParamId(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

function propertyRevenue(property: Property) {
  const propertyUnitIds = units.filter((u) => u.propertyId === property.id).map((u) => u.id);
  return leases.filter((l) => propertyUnitIds.includes(l.unitId) && l.status === "active").reduce((t, l) => t + l.rentAmount, 0);
}

function parsePropertyNotes(property: Property): PropertyNotes {
  if (!property.notes) return {};
  try { return JSON.parse(property.notes) as PropertyNotes; } catch { return {}; }
}

function propertyLabels(property: Property): string[] {
  const labels = parsePropertyNotes(property).unitSetup?.labels;
  return labels?.length ? labels : [];
}

function propertyUnitSystem(property: Property, propertyUnits: Unit[]): "single" | "multi" {
  return parsePropertyNotes(property).unitSetup?.unitSystem ?? (propertyUnits.length <= 1 ? "single" : "multi");
}

function unitDisplayStatus(unit?: Unit) { return unit?.attributes?.occupancyStatus?.toString() ?? unit?.status ?? "vacant"; }
function unitLease(unitId: string) { return leases.find((l) => l.unitId === unitId && l.status === "active"); }
function unitTenants(unitId: string) { const lease = unitLease(unitId); return lease ? tenants.filter((t) => lease.tenantIds.includes(t.id)) : []; }
function statusLabel(status: UnitStatus) { return status === "occupied" ? "Occupied" : status === "maintenance" ? "Maintenance" : "Vacant"; }

function UnitStatusPill({ status }: { status: UnitStatus }) {
  return (
    <span className={`property-detail-status property-detail-status--${status}`}>
      <i /> {statusLabel(status)}
    </span>
  );
}

function UnitCard({ unit }: { unit: Unit }) {
  const lease = unitLease(unit.id);
  const residents = unitTenants(unit.id);
  const residentNames = residents.length ? residents.map((t) => t.fullName).join(", ") : "Available";
  const phone = residents[0]?.phoneWa ?? unit.attributes.size?.toString() ?? "Not set";
  const rent = lease?.rentAmount ?? unit.baseRent;
  return (
    <article className="property-unit-card">
      <header>
        <strong>{unit.code}</strong>
        <UnitStatusPill status={unit.status} />
      </header>
      <div><p>{residentNames}</p><span>{phone}</span></div>
      <small>{unit.status === "vacant" ? "Not Set" : `${formatRupiah(rent).replace(",00", "")}/mo`}</small>
    </article>
  );
}

function SingleUnitPanel({ unit }: { unit?: Unit }) {
  const lease = unit ? unitLease(unit.id) : undefined;
  const residents = unit ? unitTenants(unit.id) : [];
  const status = unitDisplayStatus(unit);
  const unitType = unit?.attributes?.unitType?.toString() ?? unit?.code ?? "Single unit";
  const deposit = Number(unit?.attributes?.depositAmount ?? lease?.depositAmount ?? 0);
  return (
    <section className="property-single-unit-panel">
      <header>
        <div>
          <span className={`property-single-status property-single-status--${status}`}><i /> {status}</span>
          <h2>{unitType}</h2>
          <p>{unit?.code ?? "Main unit"}</p>
        </div>
        <Button>Manage Unit</Button>
      </header>
      <div className="property-single-unit-grid">
        <div><span>Monthly price</span><strong>{formatRupiah(unit?.baseRent ?? lease?.rentAmount ?? 0).replace(",00", "")}</strong></div>
        <div><span>Deposit</span><strong>{formatRupiah(deposit).replace(",00", "")}</strong></div>
        <div><span>Billing cycle</span><strong>{unit?.defaultBillingCycle ?? lease?.billingCycle ?? "monthly"}</strong></div>
        <div><span>Tenant</span><strong>{residents.length ? residents.map((t) => t.fullName).join(", ") : "-"}</strong></div>
      </div>
    </section>
  );
}

function PropertyStats({ propertyUnits, property }: { propertyUnits: Unit[]; property: Property }) {
  const occupied = propertyUnits.filter((u) => u.status === "occupied").length;
  const occupancy = propertyUnits.length ? Math.round((occupied / propertyUnits.length) * 100) : 0;
  const stats = [
    { label: "Total Units", value: propertyUnits.length.toString() },
    { label: "Occupied", value: occupied.toString() },
    { label: "Vacant", value: propertyUnits.filter((u) => u.status === "vacant").length.toString() },
    { label: "Occupancy", value: `${occupancy}%` },
    { label: "Revenue/mo", value: formatRupiah(propertyRevenue(property)).replace(",00", "") }
  ];
  return (
    <div className="property-detail-stats">
      {stats.map((s) => (<div key={s.label}><span>{s.label}</span><strong>{s.value}</strong></div>))}
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = getParamId(params.id);
  const [createdRecords, setCreatedRecords] = useState<StoredPropertyRecord[]>([]);
  const [activeFilter, setActiveFilter] = useState<UnitFilter>("all");
  const [query, setQuery] = useState("");

  const allProperties = useMemo(() => [...properties, ...createdRecords.map((r) => r.property)], [createdRecords]);
  const allUnits = useMemo(() => [...units, ...createdRecords.flatMap((r) => r.units)], [createdRecords]);
  const property = allProperties.find((p) => p.id === propertyId) ?? properties[0];

  useEffect(() => {
    const stored = window.localStorage.getItem(createdPropertiesStorageKey);
    if (stored && createdRecords.length === 0) setCreatedRecords(JSON.parse(stored) as StoredPropertyRecord[]);
  }, [createdRecords.length]);

  const propertyUnits = useMemo(() => allUnits.filter((u) => u.propertyId === property.id), [allUnits, property.id]);
  const unitSystem = propertyUnitSystem(property, propertyUnits);

  const filteredUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    return propertyUnits.filter((u) => {
      const matches = unitTenants(u.id).map((t) => t.fullName.toLowerCase()).join(" ");
      return (activeFilter === "all" || u.status === activeFilter) && (!q || `${u.code} ${matches}`.includes(q));
    });
  }, [activeFilter, propertyUnits, query]);

  const dynamicUnitGroups = propertyUnits.filter((u) => u.groupId && !unitGroups.some((g) => g.id === u.groupId)).reduce<Array<{ id: string; propertyId: string; name: string }>>((groups, u) => {
    if (!u.groupId || groups.some((g) => g.id === u.groupId)) return groups;
    groups.push({ id: u.groupId, propertyId: property.id, name: u.attributes.groupName?.toString() ?? "Units" });
    return groups;
  }, []);

  const groupedUnits = [...unitGroups, ...dynamicUnitGroups].filter((g) => g.propertyId === property.id).map((g) => ({ group: g, units: filteredUnits.filter((u) => u.groupId === g.id) })).filter((g) => g.units.length > 0);
  const ungroupedUnits = filteredUnits.filter((u) => !u.groupId);
  const counts = { all: propertyUnits.length, occupied: propertyUnits.filter((u) => u.status === "occupied").length, vacant: propertyUnits.filter((u) => u.status === "vacant").length, maintenance: propertyUnits.filter((u) => u.status === "maintenance").length };

  return (
    <div className="property-detail-page">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { href: "/properties", label: "Properties" }, { label: property.name }]}
        title={property.name}
        copy={property.address}
        actions={
          <div className="flex gap-2">
            <Button variant="outline"><Edit3 size={15} /> Edit Property</Button>
            <Button>Reserve a Unit</Button>
          </div>
        }
      />

      <section className="property-detail-hero">
        <div className="property-detail-banner" style={{ background: property.image ? `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.5)), center / cover no-repeat url("${property.image}")` : bannerColors[property.type] ?? "#f8fafc" }}>
          {propertyLabels(property).map((label) => (<span className="property-detail-banner__label" key={label}>{label}</span>))}
        </div>
        <div className="property-detail-hero__body"><PropertyStats property={property} propertyUnits={propertyUnits} /></div>
      </section>

      <Tabs defaultValue="Units" className="module-tabs-root">
        <TabsList className="module-tabs" aria-label="Property sections">
          {propertyTabs.map((tab) => (
            <TabsTrigger className="module-tabs__trigger" key={tab} value={tab}>{tab}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {unitSystem === "single" ? <SingleUnitPanel unit={propertyUnits[0]} /> : (
        <>
          <div className="property-detail-toolbar">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9 w-[240px]" onChange={(e) => setQuery(e.target.value)} placeholder="Search Units.." value={query} />
            </div>
            <div className="property-detail-filter-group" aria-label="Unit filters">
              {([{ key: "all", label: `All (${counts.all})` }, { key: "occupied", label: `Occupied (${counts.occupied})` }, { key: "vacant", label: `Vacant (${counts.vacant})` }, { key: "maintenance", label: `Maintenance (${counts.maintenance})` }] as const).map((f) => (
                <button className={activeFilter === f.key ? "is-active" : ""} key={f.key} onClick={() => setActiveFilter(f.key)} type="button">{f.label}</button>
              ))}
            </div>
            <Button className="ml-auto"><Plus size={16} /> Add New Unit</Button>
          </div>

          <div className="property-unit-groups">
            {groupedUnits.map(({ group, units: gUnits }) => {
              const occupied = gUnits.filter((u) => u.status === "occupied").length;
              return (
                <section className="property-unit-group" key={group.id}>
                  <header><div><h2>{group.name}</h2><p>Floor 1 <i /> {gUnits.length} units <i /> {occupied} Occupied</p></div><ChevronUp size={20} /></header>
                  <div className="property-unit-grid">{gUnits.map((u) => <UnitCard key={u.id} unit={u} />)}</div>
                </section>
              );
            })}
            {ungroupedUnits.length ? (
              <section className="property-unit-group">
                <header><div><h2>Ungrouped Units</h2><p>{ungroupedUnits.length} units</p></div><ChevronUp size={20} /></header>
                <div className="property-unit-grid">{ungroupedUnits.map((u) => <UnitCard key={u.id} unit={u} />)}</div>
              </section>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
