"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Flag,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Star,
  UserCircle
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatRupiah } from "@/lib/format";
import { getProperty, getUnit } from "@/lib/metrics";
import { properties, tickets, vendors } from "@/lib/sample-data";
import type { Ticket, TicketStatus, Vendor } from "@/lib/types";

type TicketView = "Kanban" | "List";
type VendorView = "Card" | "List";

type MaintenanceTicket = Ticket & { assignedVendorName?: string; body?: string };
type MaintenanceVendor = Vendor & { rating: number; avgCost: number; visits: number; coverage: string };
type TicketPatch = Partial<Pick<MaintenanceTicket, "assignedVendorId" | "assignedVendorName" | "body" | "priority" | "scheduledAt" | "status">>;

const extraTickets: MaintenanceTicket[] = [
  { id: "ticket-003", unitId: "unit-m101", tenantId: "tenant-andini", reporterName: "Andini Prasetya", reporterPhone: "+628121110001", category: "Lighting", title: "Ceiling light flickers", description: "The ceiling light in the living room flickers intermittently, especially at night.", priority: "medium", status: "new", source: "form", createdAt: "2026-06-12T00:24:00.000Z" },
  { id: "ticket-004", unitId: "unit-rb03", tenantId: "tenant-cv-sinar", reporterName: "Pak Arif", reporterPhone: "+628571110003", category: "Electrical", title: "Wall outlets stopped working", description: "Two wall outlets in the second floor office stopped working after a power trip.", priority: "urgent", status: "scheduled", source: "form", createdAt: "2026-06-12T00:24:00.000Z", assignedVendorId: "vendor-wahyu", assignedVendorName: "Pak Wahyu Listrik", scheduledAt: "2026-06-15T05:45:00.000Z", estimatedCost: 350000 },
  { id: "ticket-005", unitId: "unit-a1511", reporterName: "Staff inspection", reporterPhone: "+628000000000", category: "Furniture", title: "Wardrobe hinge broken", description: "Left door hinge broken.", priority: "low", status: "in_progress", source: "manual", createdAt: "2026-06-09T03:00:00.000Z", assignedVendorId: "vendor-rizal", assignedVendorName: "Pak Rizal Teknisi", scheduledAt: "2026-06-14T05:45:00.000Z", estimatedCost: 300000 },
  { id: "ticket-006", unitId: "unit-a1207", tenantId: "tenant-della", reporterName: "Della Kartika", reporterPhone: "+628771110004", category: "Doors & Locks", title: "Bedroom window lock stuck", description: "Window lock stuck.", priority: "high", status: "resolved", source: "form", createdAt: "2026-06-07T00:24:00.000Z", assignedVendorId: "vendor-rizal", assignedVendorName: "Pak Rizal Teknisi", scheduledAt: "2026-06-12T05:45:00.000Z", estimatedCost: 350000 },
  { id: "ticket-007", unitId: "unit-rb03", tenantId: "tenant-cv-sinar", reporterName: "CV Sinar Jaya", reporterPhone: "+628571110003", category: "General Maintenance", title: "Kitchen sink drains slowly", description: "Water drains slowly.", priority: "low", status: "closed", source: "form", createdAt: "2026-06-06T00:24:00.000Z", assignedVendorId: "vendor-doni", assignedVendorName: "Pak Doni Fajar", scheduledAt: "2026-06-10T05:00:00.000Z", estimatedCost: 250000 }
];

const maintenanceTickets: MaintenanceTicket[] = [
  ...tickets.map((t) => ({ ...t, assignedVendorName: vendors.find((v) => v.id === t.assignedVendorId)?.name, body: t.description })),
  ...extraTickets.map((t) => ({ ...t, body: t.description }))
];

const maintenanceVendors: MaintenanceVendor[] = [
  { id: "vendor-hendra", name: "Pak Hendra Susilo", serviceType: "Plumbing", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-wahyu", name: "Pak Wahyu Listrik", serviceType: "Electrical", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-arktik", name: "CV Arktik Cool", serviceType: "Air Conditioner", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-doni", name: "Pak Doni Fajar", serviceType: "Lighting", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-cleaning", name: "Bersih Jaya Cleaning", serviceType: "Doors & Locks", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-rizal", name: "Pak Rizal Teknisi", serviceType: "Furniture", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  { id: "vendor-agus", name: "Pak Agus Handyman", serviceType: "General", phone: "08561234001", rating: 4.8, avgCost: 350000, visits: 12, coverage: "Jakarta Pusat, Jakarta Selatan" },
  ...vendors.map((v) => ({ ...v, rating: 4.7, avgCost: 425000, visits: 8, coverage: "Jakarta Selatan" }))
];

const ticketColumns: Array<{ key: string; label: string; statuses: TicketStatus[]; dropStatus: TicketStatus; tone: string }> = [
  { key: "submitted", label: "Submitted", statuses: ["new", "triaged", "assigned"], dropStatus: "assigned", tone: "blue" },
  { key: "scheduled", label: "Scheduled", statuses: ["scheduled"], dropStatus: "scheduled", tone: "purple" },
  { key: "in_progress", label: "In Progress", statuses: ["in_progress"], dropStatus: "in_progress", tone: "orange" },
  { key: "resolved", label: "Completed", statuses: ["resolved", "closed"], dropStatus: "resolved", tone: "green" }
];

function getTicketLocation(ticket: Ticket) {
  const unit = getUnit(ticket.unitId);
  const property = unit ? getProperty(unit) : undefined;
  return { property: property?.name ?? "Unknown property", unit: unit?.code ?? "-" };
}

function priorityTone(priority: Ticket["priority"]) { return priority === "urgent" || priority === "high" ? "danger" : priority === "medium" ? "warning" : "neutral"; }
function statusLabel(status: TicketStatus) { return status === "new" ? "Submitted" : status === "triaged" ? "Triaged" : status === "assigned" ? "Assigned" : status === "scheduled" ? "Scheduled" : status === "in_progress" ? "In Progress" : status === "resolved" ? "Resolved" : "Closed"; }
function vendorNameFor(ticket: MaintenanceTicket) { return ticket.assignedVendorName ?? maintenanceVendors.find((v) => v.id === ticket.assignedVendorId)?.name; }
function plainTicketBody(value: string) { return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }

function TicketActionMenu({ children, onDelete, onPatch, ticket }: { children: ReactNode; onDelete: (id: string) => void; onPatch: (id: string, patch: TicketPatch) => void; ticket: MaintenanceTicket }) {
  const firstVendor = maintenanceVendors[0];
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPoint, setMenuPoint] = useState({ x: 0, y: 0 });

  const openContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setMenuPoint({ x: event.clientX, y: event.clientY });
    window.requestAnimationFrame(() => triggerRef.current?.click());
  };

  return (
    <DropdownMenu>
      <div className="ticket-context-target" onContextMenu={openContextMenu}>
        {children}
        <DropdownMenuTrigger asChild>
          <button
            aria-hidden="true"
            className="ticket-context-trigger"
            ref={triggerRef}
            style={{ left: menuPoint.x, top: menuPoint.y }}
            tabIndex={-1}
            type="button"
          />
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Edit priority</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {["low", "medium", "high", "urgent"].map((p) => (
              <DropdownMenuItem key={p} onClick={() => onPatch(ticket.id, { priority: p as Ticket["priority"] })}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ticketColumns.map((c) => (
              <DropdownMenuItem key={c.key} onClick={() => onPatch(ticket.id, { status: c.dropStatus })}>{c.label}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => onPatch(ticket.id, { scheduledAt: "2026-06-20T05:00:00.000Z" })}>Set due date to 20 Jun</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPatch(ticket.id, { assignedVendorId: firstVendor.id, assignedVendorName: firstVendor.name })}>Assign {firstVendor.name}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-500" onClick={() => onDelete(ticket.id)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RichTicketEditor({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const blockOptions = [
    { key: "h1", label: "Heading 1" }, { key: "h2", label: "Heading 2" }, { key: "h3", label: "Heading 3" },
    { key: "table", label: "Table" }, { key: "blockquote", label: "Blockquote" },
    { key: "bullet", label: "Bulleted list" }, { key: "number", label: "Numbered list" }, { key: "code", label: "Code block" }
  ];

  useEffect(() => { if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value; }, [value]);

  const handleInput = () => {
    const next = editorRef.current?.innerHTML ?? "";
    onChange(next);
    setSlashOpen((editorRef.current?.innerText ?? "").trimEnd().endsWith("/"));
  };

  return (
    <div className="ticket-editor">
      <div aria-label="Ticket body rich text editor" className="ticket-editor__surface" contentEditable onInput={handleInput} onKeyUp={handleInput} ref={editorRef} role="textbox" suppressContentEditableWarning />
      {slashOpen ? (
        <div className="ticket-editor__slash" role="menu" aria-label="Block options">
          {blockOptions.map((o) => (
            <button key={o.key} onMouseDown={(e) => e.preventDefault()} onClick={() => { if (editorRef.current) { onChange(editorRef.current.innerHTML); setSlashOpen(false); } }} type="button">{o.label}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TicketDetailContent({ onPatch, ticket }: { onPatch: (id: string, patch: TicketPatch) => void; ticket: MaintenanceTicket }) {
  const location = getTicketLocation(ticket);
  const vendorName = vendorNameFor(ticket) ?? "Unassigned";
  return (
    <div className="ticket-detail">
      <div className="ticket-detail__summary">
        <Badge variant={ticket.status === "resolved" || ticket.status === "closed" ? "success" : ticket.status === "in_progress" ? "default" : ticket.status === "scheduled" ? "warning" : "secondary"}>{statusLabel(ticket.status)}</Badge>
        <h2 className="text-lg font-bold mt-2">{ticket.title}</h2>
        <p className="text-sm text-muted-foreground">{location.property} / Unit {location.unit} / {ticket.category}</p>
      </div>
      <div className="grid grid-cols-[1fr_220px] gap-6 mt-4">
        <section>
          <h3 className="text-sm font-semibold mb-2">Ticket body</h3>
          <RichTicketEditor value={ticket.body ?? ticket.description} onChange={(body) => onPatch(ticket.id, { body })} />
        </section>
        <aside className="grid gap-4 text-sm">
          <div><span className="text-muted-foreground block">Reporter</span><strong>{ticket.reporterName}</strong><p className="text-muted-foreground">{ticket.reporterPhone}</p></div>
          <div><span className="text-muted-foreground block">Priority</span><strong className={priorityTone(ticket.priority) === "danger" ? "text-red-500" : priorityTone(ticket.priority) === "warning" ? "text-amber-500" : ""}>{ticket.priority}</strong></div>
          <div><span className="text-muted-foreground block">Vendor</span><strong>{vendorName}</strong></div>
          <div><span className="text-muted-foreground block">Schedule</span><strong>{ticket.scheduledAt ? formatDate(ticket.scheduledAt) : "No date"}</strong></div>
          <div><span className="text-muted-foreground block">Estimated cost</span><strong>{ticket.estimatedCost ? formatRupiah(ticket.estimatedCost).replace(",00", "") : "-"}</strong></div>
        </aside>
      </div>
    </div>
  );
}

function TicketCard({ isDragging, onDelete, onDragStart, onOpen, onPatch, ticket }: {
  isDragging: boolean; onDelete: (id: string) => void; onDragStart: (id: string) => void; onOpen: (id: string) => void; onPatch: (id: string, patch: TicketPatch) => void; ticket: MaintenanceTicket;
}) {
  const location = getTicketLocation(ticket);
  const vName = vendorNameFor(ticket);
  return (
    <TicketActionMenu ticket={ticket} onPatch={onPatch} onDelete={onDelete}>
      <article className={`maintenance-ticket-card ${isDragging ? "maintenance-ticket-card--dragging" : ""}`} draggable onClick={() => onOpen(ticket.id)} onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", ticket.id); onDragStart(ticket.id); }}>
        <div className="maintenance-ticket-card__meta">
          <div><span>{formatDate(ticket.createdAt)}</span><div>{location.property}<i /> Unit {location.unit}</div></div>
          <span className={`maintenance-priority maintenance-priority--${priorityTone(ticket.priority)}`}><Flag size={14} /></span>
        </div>
        <div className="maintenance-ticket-card__body"><strong>{ticket.title}</strong><p>{plainTicketBody(ticket.body ?? ticket.description)}</p></div>
        <div className="maintenance-ticket-card__footer">
          <span>{ticket.reporterName}</span>
          {vName ? <span className="maintenance-ticket-card__vendor"><UserCircle size={14} /> {vName}</span> : null}
          {ticket.scheduledAt ? <time>{formatDate(ticket.scheduledAt)}</time> : null}
        </div>
      </article>
    </TicketActionMenu>
  );
}

function TicketsKanban({ draggedTicketId, onDelete, onDragEnd, onDragStart, onDropTicket, onOpen, onPatch, ticketsData }: {
  draggedTicketId: string | null; onDelete: (id: string) => void; onDragEnd: () => void; onDragStart: (id: string) => void; onDropTicket: (id: string, status: TicketStatus) => void; onOpen: (id: string) => void; onPatch: (id: string, patch: TicketPatch) => void; ticketsData: MaintenanceTicket[];
}) {
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  return (
    <div className="maintenance-kanban-shell">
      <div className="maintenance-kanban">
        {ticketColumns.map((column) => {
          const colTickets = ticketsData.filter((t) => column.statuses.includes(t.status));
          return (
            <section className="maintenance-kanban-column" key={column.key}>
              <header className={`maintenance-kanban-column__header maintenance-kanban-column__header--${column.tone}`}>
                <div><span /> {column.label}</div>
                <b>{colTickets.length}</b>
              </header>
              <div className={`maintenance-kanban-column__cards ${activeColumn === column.key ? "maintenance-kanban-column__cards--over" : ""}`}
                onDragEnd={() => { setActiveColumn(null); onDragEnd(); }}
                onDragLeave={() => setActiveColumn(null)}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setActiveColumn(column.key); }}
                onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain") || draggedTicketId; if (id) onDropTicket(id, column.dropStatus); setActiveColumn(null); onDragEnd(); }}
              >
                {colTickets.map((t) => <TicketCard isDragging={draggedTicketId === t.id} key={t.id} onDelete={onDelete} onDragStart={onDragStart} onOpen={onOpen} onPatch={onPatch} ticket={t} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TicketsList({ onDelete, onOpen, onPatch, ticketsData }: {
  onDelete: (id: string) => void; onOpen: (id: string) => void; onPatch: (id: string, patch: TicketPatch) => void; ticketsData: MaintenanceTicket[];
}) {
  return (
    <Accordion type="multiple" defaultValue={ticketColumns.map((c) => c.key)} className="maintenance-ticket-groups">
      {ticketColumns.map((column) => {
        const colTickets = ticketsData.filter((t) => column.statuses.includes(t.status));
        return (
          <AccordionItem key={column.key} value={column.key}>
            <AccordionTrigger className="text-sm font-semibold">
              <span className={`w-2 h-2 rounded-full bg-${column.tone}-500`} /> {column.label} <Badge variant="secondary" className="ml-2">{colTickets.length}</Badge>
            </AccordionTrigger>
            <AccordionContent>
              <div className="maintenance-table" role="table">
                <div className="maintenance-table__row maintenance-table__row--head" role="row">
                  <div>Ticket</div><div>Property / Unit</div><div>Reporter</div><div>Vendor</div><div>Schedule</div><div>Status</div><div />
                </div>
                {colTickets.map((t) => (
                  <TicketActionMenu key={t.id} ticket={t} onPatch={onPatch} onDelete={onDelete}>
                    <div className="maintenance-table__row" role="row" onClick={() => onOpen(t.id)}>
                      <div className="maintenance-table__ticket"><strong>{t.title}</strong><span>{t.category}</span></div>
                      <div><strong>{getTicketLocation(t).property}</strong><span>Unit {getTicketLocation(t).unit}</span></div>
                      <div>{t.reporterName}</div>
                      <div>{vendorNameFor(t) ?? "-"}</div>
                      <div>{t.scheduledAt ? formatDate(t.scheduledAt) : "-"}</div>
                      <div><Badge variant={t.status === "resolved" || t.status === "closed" ? "success" : t.status === "in_progress" ? "default" : t.status === "scheduled" ? "warning" : "secondary"}>{statusLabel(t.status)}</Badge></div>
                      <div><MoreVertical size={16} /></div>
                    </div>
                  </TicketActionMenu>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function TicketsPanel() {
  const [view, setView] = useState<TicketView>("Kanban");
  const [ticketsData, setTicketsData] = useState<MaintenanceTicket[]>(maintenanceTickets);
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [fullPageTicketId, setFullPageTicketId] = useState<string | null>(null);
  const selectedTicket = useMemo(() => ticketsData.find((t) => t.id === selectedTicketId), [selectedTicketId, ticketsData]);
  const fullPageTicket = useMemo(() => ticketsData.find((t) => t.id === fullPageTicketId), [fullPageTicketId, ticketsData]);

  const patchTicket = (id: string, patch: TicketPatch) => setTicketsData((prev) => prev.map((t) => t.id === id ? { ...t, ...patch } : t));
  const deleteTicket = (id: string) => { setTicketsData((prev) => prev.filter((t) => t.id !== id)); if (selectedTicketId === id) setSelectedTicketId(null); if (fullPageTicketId === id) setFullPageTicketId(null); };

  if (fullPageTicket) return (
    <div className="ticket-full-page">
      <header className="ticket-full-page__top"><Button variant="outline" onClick={() => setFullPageTicketId(null)}><ArrowLeft size={16} /> Back</Button><span className="text-sm text-muted-foreground">Full page ticket</span></header>
      <TicketDetailContent ticket={fullPageTicket} onPatch={patchTicket} />
    </div>
  );

  return (
    <div className="maintenance-panel">
      <div className="maintenance-filters">
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9 w-[200px]" placeholder="Search Tenant, unit..." aria-label="Search tickets" /></div>
        <Select defaultValue="all-properties">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-properties">All Properties</SelectItem>
            {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue="all-type">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-type">All Type</SelectItem>
            <SelectItem value="ac">Air Conditioner</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="recent">
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="schedule">Schedule</SelectItem>
          </SelectContent>
        </Select>
        <div className="segmented ml-auto">
          <button className={`segmented__item${view === "Kanban" ? " segmented__item--active" : ""}`} onClick={() => setView("Kanban")} type="button">Kanban</button>
          <button className={`segmented__item${view === "List" ? " segmented__item--active" : ""}`} onClick={() => setView("List")} type="button">List</button>
        </div>
      </div>

      {view === "Kanban" ? (
        <TicketsKanban draggedTicketId={draggedTicketId} onDelete={deleteTicket} onDragEnd={() => setDraggedTicketId(null)} onDragStart={setDraggedTicketId} onDropTicket={(id, status) => patchTicket(id, { status })} onOpen={setSelectedTicketId} onPatch={patchTicket} ticketsData={ticketsData} />
      ) : (
        <TicketsList ticketsData={ticketsData} onOpen={setSelectedTicketId} onPatch={patchTicket} onDelete={deleteTicket} />
      )}

      <Dialog open={Boolean(selectedTicket)} onOpenChange={(v) => !v && setSelectedTicketId(null)}>
        <DialogContent className="max-w-[920px]">
          <DialogHeader><DialogTitle>{selectedTicket?.title}</DialogTitle></DialogHeader>
          {selectedTicket ? <TicketDetailContent ticket={selectedTicket} onPatch={patchTicket} /> : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => { if (selectedTicket) { setFullPageTicketId(selectedTicket.id); setSelectedTicketId(null); } }}><ExternalLink size={15} /> Open full page</Button>
            <DialogClose asChild><Button>Done</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: MaintenanceVendor }) {
  return (
    <article className="maintenance-vendor-card">
      <header>
        <div><strong>{vendor.name}</strong><span>{vendor.serviceType}</span></div>
        <div className="maintenance-vendor-rating"><Star size={12} fill="#fadb14" stroke="#fadb14" /> {vendor.rating.toFixed(1)}</div>
      </header>
      <div className="maintenance-vendor-contact">
        <span><Phone size={14} /> {vendor.phone}</span>
        <span><MapPin size={14} /> {vendor.coverage}</span>
      </div>
      <footer>
        <div>
          <span>Avg cost</span><i /><span>{vendor.visits} Visit</span>
          <strong>{formatRupiah(vendor.avgCost).replace(",00", "")}</strong>
        </div>
        <Button size="sm"><MessageCircle size={15} /> Whatsapp</Button>
      </footer>
    </article>
  );
}

function VendorsPanel() {
  const [view, setView] = useState<VendorView>("Card");
  return (
    <div className="maintenance-panel">
      <div className="maintenance-filters maintenance-filters--vendors">
        <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9 w-[200px]" placeholder="Search vendor..." /></div>
        <Select defaultValue="all-services">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all-services">All Services</SelectItem>
            <SelectItem value="plumbing">Plumbing</SelectItem>
            <SelectItem value="electrical">Electrical</SelectItem>
            <SelectItem value="ac">Air Conditioner</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="rating">
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest rating</SelectItem>
            <SelectItem value="cost">Lowest cost</SelectItem>
            <SelectItem value="visits">Most visits</SelectItem>
          </SelectContent>
        </Select>
        <div className="segmented ml-auto">
          <button className={`segmented__item${view === "Card" ? " segmented__item--active" : ""}`} onClick={() => setView("Card")} type="button">Card</button>
          <button className={`segmented__item${view === "List" ? " segmented__item--active" : ""}`} onClick={() => setView("List")} type="button">List</button>
        </div>
      </div>
      {view === "Card" ? (
        <div className="maintenance-vendor-grid">{maintenanceVendors.map((v) => <VendorCard key={v.id} vendor={v} />)}</div>
      ) : (
        <div className="maintenance-vendor-list" role="table">
          <div className="maintenance-vendor-list__row maintenance-vendor-list__row--head" role="row">
            <div>Vendor</div><div>Service</div><div>Coverage</div><div>Visits</div><div>Avg cost</div><div>Rating</div><div />
          </div>
          {maintenanceVendors.map((v) => (
            <div className="maintenance-vendor-list__row" key={v.id} role="row">
              <div><strong>{v.name}</strong><span>{v.phone}</span></div>
              <div>{v.serviceType}</div>
              <div>{v.coverage}</div>
              <div>{v.visits}</div>
              <div>{formatRupiah(v.avgCost).replace(",00", "")}</div>
              <div className="maintenance-vendor-rating"><Star size={12} fill="#fadb14" stroke="#fadb14" /> {v.rating.toFixed(1)}</div>
              <div><Button size="sm"><MessageCircle size={15} /> Whatsapp</Button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TicketsPage() {
  return (
    <div className="maintenance-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Maintenance" }]}
        title="Maintenance"
        copy={`June 2026 / ${maintenanceTickets.length} Total Tickets`}
        actions={<Button><Plus size={16} /> Create Ticket</Button>}
      />

      <div className="module-surface">
        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="vendors">Vendors List</TabsTrigger>
          </TabsList>
          <TabsContent value="tickets"><TicketsPanel /></TabsContent>
          <TabsContent value="vendors"><VendorsPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
