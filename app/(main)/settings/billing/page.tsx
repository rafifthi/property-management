"use client";

import { CalendarDays, Clock, Coins, Percent, Shield } from "lucide-react";
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

const iconStyle = { color: "#2563eb", flexShrink: 0 };

const sections = [
  {
    key: "cycle",
    label: "Rent Cycle",
    icon: <CalendarDays size={18} style={iconStyle} />,
    desc: "Global default billing cycle and invoice period",
    content: (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Default billing cycle</Label>
          <Select defaultValue="monthly">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Invoice period (months)</Label>
          <Input type="number" min={1} max={12} defaultValue={1} />
        </div>
      </div>
    )
  },
  {
    key: "dates",
    label: "Invoice Generation & Due Dates",
    icon: <Clock size={18} style={iconStyle} />,
    desc: "When invoices are created and when payment is due",
    content: (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Invoice generation day of month</Label>
          <Input type="number" min={1} max={28} defaultValue={1} />
        </div>
        <div className="grid gap-2">
          <Label>Due date day of month</Label>
          <Input type="number" min={1} max={28} defaultValue={10} />
        </div>
        <div className="grid gap-2">
          <Label>Grace period (days)</Label>
          <div className="flex">
            <Input type="number" min={0} max={30} defaultValue={3} className="rounded-r-none" />
            <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">days</span>
          </div>
        </div>
      </div>
    )
  },
  {
    key: "late-fee",
    label: "Late Fee Rules",
    icon: <Coins size={18} style={iconStyle} />,
    desc: "Penalty applied when payment is overdue",
    content: (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Late fee type</Label>
          <Select defaultValue="fixed">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed amount</SelectItem>
              <SelectItem value="percent">Percentage of rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Late fee amount</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground">Rp</span>
            <Input type="number" min={0} defaultValue={50000} className="rounded-l-none" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Late fee interval (days)</Label>
          <div className="flex">
            <Input type="number" min={1} defaultValue={7} className="rounded-r-none" />
            <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">days</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Maximum late fee</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-sm text-muted-foreground">Rp</span>
            <Input type="number" min={0} defaultValue={500000} className="rounded-l-none" />
          </div>
        </div>
      </div>
    )
  },
  {
    key: "deposit",
    label: "Deposit Rules",
    icon: <Shield size={18} style={iconStyle} />,
    desc: "Security deposit terms and refund rules",
    content: (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Deposit multiplier (months of rent)</Label>
          <div className="flex">
            <Input type="number" min={0} max={6} step={0.5} defaultValue={1} className="rounded-r-none" />
            <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">months</span>
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Refund processing period (days)</Label>
          <div className="flex">
            <Input type="number" min={0} max={90} defaultValue={14} className="rounded-r-none" />
            <span className="inline-flex items-center px-3 border border-l-0 border-input rounded-r-md bg-muted text-sm text-muted-foreground">days</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Allow deposit deduction</Label>
          <Switch defaultChecked />
        </div>
      </div>
    )
  },
  {
    key: "prorata",
    label: "Proration & Adjustments",
    icon: <Percent size={18} style={iconStyle} />,
    desc: "Mid-cycle move-in/out proration rules",
    content: (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Proration method</Label>
          <Select defaultValue="daily">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily rate (days in month)</SelectItem>
              <SelectItem value="daily30">Daily rate (30-day fixed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-normal">Apply rounding</Label>
          <Switch defaultChecked />
        </div>
      </div>
    )
  }
];

export default function BillingSettingsPage() {
  return (
    <section className="content-grid grid-2">
      {sections.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {section.icon} {section.label}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{section.desc}</p>
          </CardHeader>
          <CardContent>{section.content}</CardContent>
        </Card>
      ))}
    </section>
  );
}
