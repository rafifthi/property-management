"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRupiah } from "@/lib/format";
import { propertyOccupancy } from "@/lib/metrics";
import { organization, properties, units } from "@/lib/sample-data";
import type { BillingCycle, Property, PropertyType, Unit } from "@/lib/types";

type NewPropertyFormValues = {
  address: string;
  billingCycle: BillingCycle | "flexible";
  defaultDeposit: number;
  defaultRent: number;
  defaultUnitType: string;
  dueDay: number;
  labels: string[];
  name: string;
  phone: string;
  startingNumber: number;
  unitNamePrefix: string;
  unitQuantity: number;
  unitSystem: "single" | "multi";
};

type StoredPropertyRecord = { property: Property; units: Unit[] };

const createdPropertiesStorageKey = "rentra.createdProperties.v1";

const propertyTypeMeta: Record<PropertyType, { label: string }> = {
  kontrakan: { label: "Kontrakan" }, kos: { label: "Kos" }, ruko: { label: "Ruko" }, apartemen: { label: "Apartemen" }, custom: { label: "Custom" }
};

const bannerColors: Record<PropertyType, string> = {
  kontrakan: "#f0fdf4", kos: "#f5f0ff", ruko: "#fffbeb", apartemen: "#eff6ff", custom: "#f8fafc"
};

type PropertyNotes = { unitSetup?: { labels?: string[]; unitSystem?: "single" | "multi" } };

function parsePropertyNotes(property: Property): PropertyNotes {
  if (!property.notes) return {};
  try { return JSON.parse(property.notes) as PropertyNotes; } catch { return {}; }
}

function propertyLabels(property: Property): string[] {
  const labels = parsePropertyNotes(property).unitSetup?.labels;
  return labels?.length ? labels : [propertyTypeMeta[property.type].label];
}

function propertyUnitSystem(property: Property, allUnits: Unit[]): "single" | "multi" {
  const us = parsePropertyNotes(property).unitSetup?.unitSystem;
  if (us) return us;
  return allUnits.filter((u) => u.propertyId === property.id).length <= 1 ? "single" : "multi";
}

function localPropertyOccupancy(propertyId: string, allUnits: Unit[]) {
  if (!allUnits.some((u) => u.propertyId === propertyId)) return propertyOccupancy(propertyId);
  const propertyUnits = allUnits.filter((u) => u.propertyId === propertyId);
  const occupied = propertyUnits.filter((u) => u.status === "occupied").length;
  return { total: propertyUnits.length, occupied, vacant: propertyUnits.filter((u) => u.status === "vacant").length, maintenance: propertyUnits.filter((u) => u.status === "maintenance").length, rate: propertyUnits.length ? occupied / propertyUnits.length : 0 };
}

function createUnitsForProperty(propertyId: string, values: NewPropertyFormValues): Unit[] {
  const prefix = values.unitNamePrefix?.trim();
  const unitCount = values.unitSystem === "single" ? 1 : Math.max(1, values.unitQuantity);
  const groupId = values.unitSystem === "multi" ? `${propertyId}-generated-units` : undefined;
  return Array.from({ length: unitCount }).map((_, i) => {
    const n = values.startingNumber + i;
    const code = values.unitSystem === "single" ? (values.defaultUnitType.trim() || "Main Unit") : prefix ? `${prefix}-${n}` : String(n);
    return { id: `${propertyId}-unit-${i + 1}`, propertyId, groupId, code, baseRent: values.defaultRent, defaultBillingCycle: values.billingCycle === "yearly" ? "yearly" : "monthly", status: "vacant" as const, attributes: { billingCycle: values.billingCycle, depositAmount: values.defaultDeposit, dueDay: values.dueDay, groupName: values.unitSystem === "multi" ? "Generated Units" : "", unitSystem: values.unitSystem, unitType: values.defaultUnitType } };
  });
}

function PropertyCard({ allUnits, property }: { allUnits: Unit[]; property: Property }) {
  const occupancy = localPropertyOccupancy(property.id, allUnits);
  const rate = Math.round(occupancy.rate * 100);
  const unitSystem = propertyUnitSystem(property, allUnits);
  const propertyUnits = allUnits.filter((u) => u.propertyId === property.id);
  const singleUnit = propertyUnits[0];
  const singleStatus = singleUnit?.status ?? "vacant";
  const singleRent = singleUnit?.baseRent ?? 0;
  const labels = propertyLabels(property);
  const rents = propertyUnits.map((u) => u.baseRent).filter(Boolean);
  const minRent = rents.length ? Math.min(...rents) : 0;
  const maxRent = rents.length ? Math.max(...rents) : 0;
  const nonOccupied = occupancy.total - occupancy.occupied;
  const badgeStatus = unitSystem === "single" ? singleStatus : nonOccupied === 0 ? "full" : "vacant";
  const badgeLabel = unitSystem === "single" ? singleStatus : nonOccupied === 0 ? "Full" : `${nonOccupied} vacant`;
  const rentDisplay = unitSystem === "single" ? formatRupiah(singleRent).replace(",00", "") : minRent === maxRent ? formatRupiah(minRent).replace(",00", "") : `${formatRupiah(minRent).replace(",00", "")} – ${formatRupiah(maxRent).replace(",00", "")}`;

  return (
    <Link className="property-card" href={`/properties/${property.id}`} aria-label={`Open ${property.name}`}>
      <div className="property-card__banner" style={{ background: property.image ? `linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.4)), center / cover no-repeat url("${property.image}")` : bannerColors[property.type] }}>
        {labels.length > 0 && (<div className="property-card__banner-labels">{labels.map((l) => (<span className="property-card__label-pill" key={l}>{l}</span>))}</div>)}
        <span className={`property-card__badge property-card__badge--${badgeStatus}`}>{badgeLabel}</span>
      </div>
      <div className="property-card__body">
        <div className="property-card__name">{property.name}</div>
        <div className="property-card__address">{property.address}</div>
        {unitSystem === "multi" ? (
          <div className="property-card__occupancy">
            <div className="property-card__occupancy-row"><span>{occupancy.occupied} of {occupancy.total} units</span><strong>{rate}%</strong></div>
            <div className="property-card__track"><div className="property-card__fill" style={{ width: `${rate}%` }} /></div>
          </div>
        ) : null}
      </div>
      <div className="property-card__rent">{rentDisplay}<span> / bulan</span></div>
    </Link>
  );
}

function NewPropertyModal({ onCancel, onCreate, open }: { onCancel: () => void; onCreate: (record: StoredPropertyRecord) => void; open: boolean }) {
  const [form, setForm] = useState<NewPropertyFormValues>({
    name: "", address: "", phone: "", labels: ["Boarding House"],
    unitSystem: "multi", billingCycle: "monthly", defaultUnitType: "Standard Unit",
    defaultRent: 1850000, defaultDeposit: 1850000, dueDay: 5,
    unitNamePrefix: "A", startingNumber: 101, unitQuantity: 8
  });

  const handleSubmit = () => {
    const propertyId = `prop-${crypto.randomUUID()}`;
    const property: Property = {
      id: propertyId, orgId: organization.id, name: form.name.trim(),
      type: form.unitSystem === "single" ? "kontrakan" : "kos",
      address: form.address.trim(),
      notes: JSON.stringify({ unitSetup: { labels: form.labels, unitSystem: form.unitSystem } })
    };
    onCreate({ property, units: createUnitsForProperty(propertyId, form) });
    setForm({ name: "", address: "", phone: "", labels: ["Boarding House"], unitSystem: "multi", billingCycle: "monthly", defaultUnitType: "Standard Unit", defaultRent: 1850000, defaultDeposit: 1850000, dueDay: 5, unitNamePrefix: "A", startingNumber: 101, unitQuantity: 8 });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-[980px]">
        <DialogHeader><DialogTitle>New Property</DialogTitle></DialogHeader>
        <div className="grid gap-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid gap-4">
            <h3 className="font-semibold text-sm">Basic information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Property name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kos Melati Baru" />
              </div>
              <div className="grid gap-2">
                <Label>Contact phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+628..." />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Labels</Label>
                <Input value={form.labels.join(", ")} onChange={(e) => setForm({ ...form, labels: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Boarding House, Apartment, etc" />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label>Address</Label>
                <textarea className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, area, city" rows={2} />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-semibold text-sm">Unit system</h3>
            <div className="segmented">
              <button className={`segmented__item${form.unitSystem === "single" ? " segmented__item--active" : ""}`} onClick={() => setForm({ ...form, unitSystem: "single" })} type="button">Single Unit</button>
              <button className={`segmented__item${form.unitSystem === "multi" ? " segmented__item--active" : ""}`} onClick={() => setForm({ ...form, unitSystem: "multi" })} type="button">Multi Unit</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Billing cycle</Label>
                <Select value={form.billingCycle} onValueChange={(v) => setForm({ ...form, billingCycle: v as BillingCycle | "flexible" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="flexible">Flexible per unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Due day</Label>
                <Input type="number" min={1} max={31} value={form.dueDay} onChange={(e) => setForm({ ...form, dueDay: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="font-semibold text-sm">Default unit type</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Unit type name</Label>
                <Input value={form.defaultUnitType} onChange={(e) => setForm({ ...form, defaultUnitType: e.target.value })} placeholder="Standard Room" />
              </div>
              <div className="grid gap-2">
                <Label>Default price</Label>
                <Input type="number" min={0} value={form.defaultRent} onChange={(e) => setForm({ ...form, defaultRent: Number(e.target.value) })} />
              </div>
              <div className="grid gap-2">
                <Label>Default deposit</Label>
                <Input type="number" min={0} value={form.defaultDeposit} onChange={(e) => setForm({ ...form, defaultDeposit: Number(e.target.value) })} />
              </div>
            </div>
          </div>

          {form.unitSystem === "multi" && (
            <div className="grid gap-4">
              <h3 className="font-semibold text-sm">Generate units</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Unit prefix</Label>
                  <Input value={form.unitNamePrefix} onChange={(e) => setForm({ ...form, unitNamePrefix: e.target.value })} placeholder="A, M, Kamar" />
                </div>
                <div className="grid gap-2">
                  <Label>Starting number</Label>
                  <Input type="number" min={1} value={form.startingNumber} onChange={(e) => setForm({ ...form, startingNumber: Number(e.target.value) })} />
                </div>
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" min={1} value={form.unitQuantity} onChange={(e) => setForm({ ...form, unitQuantity: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSubmit}>Create Property</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PropertiesPage() {
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false);
  const [createdRecords, setCreatedRecords] = useState<StoredPropertyRecord[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<("single" | "multi")[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(createdPropertiesStorageKey);
    if (stored) setCreatedRecords(JSON.parse(stored) as StoredPropertyRecord[]);
  }, []);

  const allProperties = useMemo(() => [...properties, ...createdRecords.map((r) => r.property)], [createdRecords]);
  const allUnits = useMemo(() => [...units, ...createdRecords.flatMap((r) => r.units)], [createdRecords]);
  const unitSystemMap = useMemo(() => {
    const map = new Map<string, "single" | "multi">();
    allProperties.forEach((p) => map.set(p.id, propertyUnitSystem(p, allUnits)));
    return map;
  }, [allProperties, allUnits]);
  const availableLabels = useMemo(() => [...new Set(allProperties.flatMap((p) => propertyLabels(p)))], [allProperties]);

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allProperties.filter((p) => {
      const sys = unitSystemMap.get(p.id) ?? "single";
      if (selectedSystems.length && !selectedSystems.includes(sys)) return false;
      if (selectedLabels.length && !propertyLabels(p).some((l) => selectedLabels.includes(l))) return false;
      if (q && !`${p.name} ${p.address}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allProperties, unitSystemMap, selectedSystems, selectedLabels, query]);

  const handleCreate = (record: StoredPropertyRecord) => {
    setCreatedRecords((prev) => {
      const next = [...prev, record];
      window.localStorage.setItem(createdPropertiesStorageKey, JSON.stringify(next));
      return next;
    });
    setIsNewPropertyOpen(false);
  };

  return (
    <div className="properties-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Properties" }]}
        title="Properties"
        copy={`${allProperties.length} properties / ${allUnits.length} total units`}
        actions={<Button onClick={() => setIsNewPropertyOpen(true)}><Plus size={16} /> Add Property</Button>}
      />

      <div className="property-toolbar">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-[240px]" onChange={(e) => setQuery(e.target.value)} placeholder="Search properties..." value={query} />
        </div>
        <div className="flex gap-1">
          {(["single", "multi"] as const).map((sys) => (
            <button className={`properties-filter-pill${selectedSystems.includes(sys) ? " properties-filter-pill--active" : ""}`} key={sys} onClick={() => setSelectedSystems((prev) => prev.includes(sys) ? prev.filter((s) => s !== sys) : [...prev, sys])} type="button">
              {sys === "single" ? "Single Unit" : "Multi Unit"}
            </button>
          ))}
          {availableLabels.length > 0 && <span aria-hidden="true" className="w-px bg-border mx-1" />}
          {availableLabels.map((label) => (
            <button className={`properties-filter-pill${selectedLabels.includes(label) ? " properties-filter-pill--active" : ""}`} key={label} onClick={() => setSelectedLabels((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])} type="button">
              {label}
            </button>
          ))}
        </div>
      </div>

      <section aria-label="Property list" className="property-card-grid">
        {filteredProperties.map((property) => (<PropertyCard allUnits={allUnits} key={property.id} property={property} />))}
        {filteredProperties.length === 0 && <p className="text-sm text-muted-foreground">No properties match the current filter.</p>}
      </section>

      <NewPropertyModal onCancel={() => setIsNewPropertyOpen(false)} onCreate={handleCreate} open={isNewPropertyOpen} />
    </div>
  );
}
