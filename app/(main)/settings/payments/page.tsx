"use client";

import { CreditCard, Landmark, Wallet } from "lucide-react";
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
import { integrationSettings } from "@/lib/sample-data";
import { titleCase } from "@/lib/format";

const gatewayIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard size={20} />,
  wa: <Landmark size={20} />,
  ppob: <Wallet size={20} />
};

export default function PaymentSettingsPage() {
  return (
    <section className="content-grid grid-2">
      {integrationSettings.map((setting) => (
        <Card key={setting.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {gatewayIcons[setting.kind]} {titleCase(setting.kind)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{setting.provider}</div>
                <p className="text-sm text-muted-foreground">Mode and provider can switch to live without changing workflows.</p>
              </div>
              <Badge variant={setting.mode === "live" ? "default" : "secondary"}>{setting.mode}</Badge>
            </div>
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Input defaultValue={setting.provider} />
            </div>
            <div className="grid gap-2">
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter API key" />
            </div>
            <div className="grid gap-2">
              <Label>Mode</Label>
              <Select defaultValue={setting.mode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stub">Stub</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-normal">Enabled</Label>
              <Switch defaultChecked={setting.enabled} />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
