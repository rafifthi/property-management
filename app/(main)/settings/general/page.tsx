"use client";

import { useState } from "react";
import { Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { SettingsActionBar } from "../_components/settings-action-bar";

export default function GeneralSettingsPage() {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const handleSave = () => {
    setDirty(false);
    setSaved(true);
  };

  const handleReset = () => {
    setDirty(false);
    setSaved(false);
  };

  return (
    <section className="content-grid" onChange={markDirty}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <p className="text-sm text-muted-foreground">Configure account ownership, billing contact, and payout bank details.</p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <div className="w-[42px] h-[42px] rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
              <Building2 size={18} />
            </div>
            <Button variant="outline" size="sm"><Upload size={14} /> Update</Button>
            <Button variant="ghost" size="sm">Remove</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Budi" placeholder="First name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Prakoso" placeholder="Last name" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" defaultValue="owner@rentra.id" placeholder="owner@example.com" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" defaultValue="+628121110001" placeholder="+628..." />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Account Role</Label>
            <Input id="role" defaultValue="Owner" placeholder="Owner" />
            <p className="text-xs text-muted-foreground">Shown internally to other users.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Contact</CardTitle>
          <p className="text-sm text-muted-foreground">Used for invoices, receipts, and payment provider registration.</p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="billingName">Billing Name</Label>
            <Input id="billingName" defaultValue="Budi Prakoso" placeholder="Billing contact name" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Company / Brand</Label>
            <Input id="company" defaultValue="Rentra Property Management" placeholder="Company or brand name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="billingEmail">Billing Email</Label>
              <Input id="billingEmail" defaultValue="billing@rentra.id" placeholder="billing@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="billingPhone">Billing Phone</Label>
              <Input id="billingPhone" defaultValue="+628121110001" placeholder="+628..." />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="taxId">Tax ID / NPWP</Label>
            <Input id="taxId" defaultValue="09.123.456.7-012.000" placeholder="NPWP number" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Billing Address</Label>
            <textarea
              id="address"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue="Jl. Melati No. 12, Jakarta Selatan"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Account</CardTitle>
          <p className="text-sm text-muted-foreground">Default payout destination for collected rent and manual reconciliation.</p>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="bank">Bank</Label>
            <Select defaultValue="bca" onValueChange={markDirty}>
              <SelectTrigger id="bank"><SelectValue placeholder="Select bank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bca">BCA</SelectItem>
                <SelectItem value="mandiri">Mandiri</SelectItem>
                <SelectItem value="bni">BNI</SelectItem>
                <SelectItem value="bri">BRI</SelectItem>
                <SelectItem value="cimb">CIMB Niaga</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bankAccountName">Account Name</Label>
              <Input id="bankAccountName" defaultValue="Budi Prakoso" placeholder="Account holder name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankAccountNumber">Account Number</Label>
              <Input id="bankAccountNumber" defaultValue="1234567890" placeholder="Account number" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select defaultValue="id" onValueChange={markDirty}>
                <SelectTrigger id="country"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Indonesia</SelectItem>
                  <SelectItem value="sg">Singapore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="swift">SWIFT Code</Label>
              <Input id="swift" defaultValue="CENAIDJA" placeholder="SWIFT code" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="defaultPayout" defaultChecked onCheckedChange={markDirty} />
            <Label htmlFor="defaultPayout" className="text-sm font-normal">Set as default bank account</Label>
          </div>
        </CardContent>
      </Card>
      <SettingsActionBar dirty={dirty} saved={saved} onReset={handleReset} onSave={handleSave} />
    </section>
  );
}
