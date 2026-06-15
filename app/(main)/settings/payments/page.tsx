"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, Eye, EyeOff, Landmark, PlugZap, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { integrationSettings } from "@/lib/sample-data";
import { titleCase } from "@/lib/format";
import { SettingsActionBar } from "../_components/settings-action-bar";

const gatewayIcons: Record<string, React.ReactNode> = {
  payment: <CreditCard size={20} />,
  wa: <Landmark size={20} />,
  ppob: <Wallet size={20} />
};

const helperCopy: Record<string, string> = {
  payment: "Payment links and tenant payment reconciliation.",
  wa: "WhatsApp reminders, ticket updates, and tenant follow-up.",
  ppob: "Utility purchases and admin fee defaults."
};

export default function PaymentSettingsPage() {
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [tested, setTested] = useState<Record<string, boolean>>({});

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  return (
    <section className="content-grid" onChange={markDirty}>
      <Card>
        <CardHeader className="settings-overview__header">
          <div>
            <CardTitle>Gateway safety</CardTitle>
            <p className="text-sm text-muted-foreground">
              Keep providers in stub mode until the connection test succeeds and credentials are confirmed.
            </p>
          </div>
          <Badge variant="warning">Live mode requires review</Badge>
        </CardHeader>
      </Card>

      <div className="content-grid grid-2">
        {integrationSettings.map((setting) => {
          const isVisible = visibleKeys[setting.id] ?? false;
          const isTested = tested[setting.id] ?? false;

          return (
            <Card key={setting.id}>
              <CardHeader>
                <div className="settings-card-title-row">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {gatewayIcons[setting.kind]} {titleCase(setting.kind)}
                  </CardTitle>
                  <Badge variant={setting.mode === "live" ? "default" : "secondary"}>{setting.mode}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{helperCopy[setting.kind]}</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="settings-connection-state">
                  <div>
                    <div className="font-semibold">{setting.provider}</div>
                    <p className="text-sm text-muted-foreground">
                      {isTested ? "Connection test passed just now." : "No connection test has been run in this session."}
                    </p>
                  </div>
                  <Badge variant={isTested ? "success" : "warning"}>
                    {isTested ? "Tested" : "Needs test"}
                  </Badge>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${setting.id}-provider`}>Provider</Label>
                  <Input id={`${setting.id}-provider`} defaultValue={setting.provider} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${setting.id}-api-key`}>API key</Label>
                  <div className="settings-password-field">
                    <Input
                      id={`${setting.id}-api-key`}
                      type={isVisible ? "text" : "password"}
                      defaultValue="sk_test_************"
                      aria-describedby={`${setting.id}-api-help`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={isVisible ? "Hide API key" : "Show API key"}
                      onClick={() => setVisibleKeys((current) => ({ ...current, [setting.id]: !isVisible }))}
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <p id={`${setting.id}-api-help`} className="text-xs text-muted-foreground">
                    Stored keys stay masked. Reveal only when confirming credentials.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Mode</Label>
                  <Select defaultValue={setting.mode} onValueChange={markDirty}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stub">Stub</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="settings-warning">
                    <AlertTriangle size={14} />
                    Live mode should only be saved after a successful test.
                  </div>
                </div>

                <div className="settings-switch-row">
                  <Label className="text-sm font-normal">Enabled</Label>
                  <Switch defaultChecked={setting.enabled} onCheckedChange={markDirty} />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTested((current) => ({ ...current, [setting.id]: true }))}
                >
                  {isTested ? <CheckCircle2 size={14} /> : <PlugZap size={14} />}
                  {isTested ? "Connection verified" : "Test connection"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
