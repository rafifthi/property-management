"use client";

import { useState } from "react";
import { CalendarDays, Clock, Coins, Percent, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import { SettingsActionBar } from "../_components/settings-action-bar";

function MoneyInput({ id, defaultValue }: { id: string; defaultValue: number }) {
  return (
    <div className="flex">
      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">Rp</span>
      <Input id={id} type="number" min={0} defaultValue={defaultValue} className="rounded-l-none" />
    </div>
  );
}

function UnitInput({
  id,
  defaultValue,
  max,
  min = 0,
  step,
  unit
}: {
  id: string;
  defaultValue: number;
  max?: number;
  min?: number;
  step?: number;
  unit: string;
}) {
  return (
    <div className="flex">
      <Input id={id} type="number" min={min} max={max} step={step} defaultValue={defaultValue} className="rounded-r-none" />
      <span className="inline-flex items-center rounded-r-md border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">{unit}</span>
    </div>
  );
}

export default function BillingSettingsPage() {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  return (
    <section className="content-grid" onChange={markDirty}>
      <Card>
        <CardHeader className="settings-overview__header">
          <div>
            <CardTitle>Current billing policy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly invoices are generated on day 1, due on day 10, with a 3 day grace period.
            </p>
          </div>
          <Badge variant="warning">Review before rent batch</Badge>
        </CardHeader>
        <CardContent className="settings-policy-summary">
          <div>
            <span className="settings-policy-summary__label">Cycle</span>
            <strong>Monthly</strong>
          </div>
          <div>
            <span className="settings-policy-summary__label">Due date</span>
            <strong>Day 10</strong>
          </div>
          <div>
            <span className="settings-policy-summary__label">Late fee</span>
            <strong>Rp50.000 every 7 days</strong>
          </div>
          <div>
            <span className="settings-policy-summary__label">Deposit</span>
            <strong>1 month rent</strong>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Core invoice settings</CardTitle>
          <p className="text-sm text-muted-foreground">Keep the common rent flow visible. Less frequent rules live below.</p>
        </CardHeader>
        <CardContent className="settings-form-grid">
          <div className="grid gap-2">
            <Label htmlFor="billingCycle">Default billing cycle</Label>
            <Select defaultValue="monthly" onValueChange={markDirty}>
              <SelectTrigger id="billingCycle"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invoicePeriod">Invoice period</Label>
            <UnitInput id="invoicePeriod" min={1} max={12} defaultValue={1} unit="months" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="generationDay">Invoice generation day</Label>
            <Input id="generationDay" type="number" min={1} max={28} defaultValue={1} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDay">Payment due day</Label>
            <Input id="dueDay" type="number" min={1} max={28} defaultValue={10} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="gracePeriod">Grace period</Label>
            <UnitInput id="gracePeriod" max={30} defaultValue={3} unit="days" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced billing rules</CardTitle>
          <p className="text-sm text-muted-foreground">Only adjust these when the default rent policy needs exceptions.</p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="settings-accordion">
            <AccordionItem value="late-fee">
              <AccordionTrigger>
                <span className="settings-accordion__label"><Coins size={16} /> Late fee rules</span>
              </AccordionTrigger>
              <AccordionContent className="settings-form-grid">
                <div className="grid gap-2">
                  <Label>Late fee type</Label>
                  <Select defaultValue="fixed" onValueChange={markDirty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                      <SelectItem value="percent">Percentage of rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lateFeeAmount">Late fee amount</Label>
                  <MoneyInput id="lateFeeAmount" defaultValue={50000} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lateFeeInterval">Late fee interval</Label>
                  <UnitInput id="lateFeeInterval" min={1} defaultValue={7} unit="days" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxLateFee">Maximum late fee</Label>
                  <MoneyInput id="maxLateFee" defaultValue={500000} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="deposit">
              <AccordionTrigger>
                <span className="settings-accordion__label"><Shield size={16} /> Deposit rules</span>
              </AccordionTrigger>
              <AccordionContent className="settings-form-grid">
                <div className="grid gap-2">
                  <Label htmlFor="depositMultiplier">Deposit multiplier</Label>
                  <UnitInput id="depositMultiplier" max={6} step={0.5} defaultValue={1} unit="months" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="refundPeriod">Refund processing period</Label>
                  <UnitInput id="refundPeriod" max={90} defaultValue={14} unit="days" />
                </div>
                <div className="settings-switch-row">
                  <Label htmlFor="depositDeduction" className="text-sm font-normal">Allow deposit deduction</Label>
                  <Switch id="depositDeduction" defaultChecked onCheckedChange={markDirty} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="proration">
              <AccordionTrigger>
                <span className="settings-accordion__label"><Percent size={16} /> Proration and adjustments</span>
              </AccordionTrigger>
              <AccordionContent className="settings-form-grid">
                <div className="grid gap-2">
                  <Label>Proration method</Label>
                  <Select defaultValue="daily" onValueChange={markDirty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily rate (days in month)</SelectItem>
                      <SelectItem value="daily30">Daily rate (30-day fixed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="settings-switch-row">
                  <Label htmlFor="rounding" className="text-sm font-normal">Apply rounding</Label>
                  <Switch id="rounding" defaultChecked onCheckedChange={markDirty} />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reminders">
              <AccordionTrigger>
                <span className="settings-accordion__label"><Clock size={16} /> Reminder timing</span>
              </AccordionTrigger>
              <AccordionContent className="settings-form-grid">
                <div className="grid gap-2">
                  <Label htmlFor="firstReminder">First reminder before due date</Label>
                  <UnitInput id="firstReminder" max={14} defaultValue={3} unit="days" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="overdueReminder">Overdue reminder cadence</Label>
                  <UnitInput id="overdueReminder" min={1} max={14} defaultValue={2} unit="days" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="calendar">
              <AccordionTrigger>
                <span className="settings-accordion__label"><CalendarDays size={16} /> Calendar exceptions</span>
              </AccordionTrigger>
              <AccordionContent className="settings-form-grid">
                <div className="settings-switch-row">
                  <Label htmlFor="weekendMove" className="text-sm font-normal">Move due dates from weekends to next business day</Label>
                  <Switch id="weekendMove" defaultChecked onCheckedChange={markDirty} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <SettingsActionBar
        dirty={dirty}
        saved={saved}
        onReset={() => {
          setDirty(false);
          setSaved(false);
        }}
        onSave={() => {
          setDirty(false);
          setSaved(true);
        }}
      />
    </section>
  );
}
