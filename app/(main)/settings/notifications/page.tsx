"use client";

import { BellOff, Mail, MessageCircle, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const channels = [
  { key: "wa", label: "WhatsApp", icon: <MessageCircle size={18} style={{ color: "#25D366" }} />, desc: "Send notifications via WhatsApp" },
  { key: "email", label: "Email", icon: <Mail size={18} style={{ color: "#2563eb" }} />, desc: "Send notifications via email" },
  { key: "push", label: "Push Notification", icon: <Smartphone size={18} style={{ color: "#8b5cf6" }} />, desc: "In-app and mobile push notifications" }
];

const notificationEvents = [
  {
    key: "rent", label: "Rent Reminders",
    events: [
      { name: "rent_reminder", label: "Rent due reminder", default: true },
      { name: "rent_overdue", label: "Rent overdue alert", default: true },
      { name: "payment_received", label: "Payment confirmation", default: true }
    ]
  },
  {
    key: "lease", label: "Lease Events",
    events: [
      { name: "lease_expiring", label: "Lease expiring soon", default: true },
      { name: "lease_ended", label: "Lease ended", default: false },
      { name: "move_in_reminder", label: "Move-in reminder", default: true }
    ]
  },
  {
    key: "tickets", label: "Maintenance Tickets",
    events: [
      { name: "ticket_new", label: "New ticket created", default: true },
      { name: "ticket_assigned", label: "Ticket assigned", default: true },
      { name: "ticket_resolved", label: "Ticket resolved", default: true }
    ]
  },
  {
    key: "general", label: "General",
    events: [
      { name: "document_expiring", label: "Document expiry reminder", default: false },
      { name: "utility_reading_due", label: "Utility reading due", default: false }
    ]
  }
];

export default function NotificationsSettingsPage() {
  return (
    <section className="content-grid grid-3">
      <Card>
        <CardHeader><CardTitle>Notification Channels</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {channels.map((ch) => (
            <div key={ch.key} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm">{ch.icon} {ch.label}</div>
                <p className="text-xs text-muted-foreground">{ch.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader><CardTitle>Event Subscriptions</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {notificationEvents.map((group) => (
            <div key={group.key}>
              <h4 className="text-sm font-semibold mb-2">{group.label}</h4>
              <div className="grid gap-2">
                {group.events.map((evt) => (
                  <div key={evt.name} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{evt.label}</span>
                    <Switch defaultChecked={evt.default} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff size={18} /> Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Enable quiet hours</Label>
            <Switch />
          </div>
          <div className="grid gap-2">
            <Label>Start time (hour)</Label>
            <div className="flex">
              <Input type="number" min={0} max={23} defaultValue={22} className="rounded-r-none" />
              <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">:00</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>End time (hour)</Label>
            <div className="flex">
              <Input type="number" min={0} max={23} defaultValue={7} className="rounded-r-none" />
              <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">:00</span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select defaultValue="Asia/Jakarta">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                <SelectItem value="Asia/Makassar">Asia/Makassar (WITA)</SelectItem>
                <SelectItem value="Asia/Jayapura">Asia/Jayapura (WIT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
