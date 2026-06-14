"use client";

import { Bot, MessageCircle, MessageSquare } from "lucide-react";
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

export default function ChatbotSettingsPage() {
  return (
    <section className="content-grid grid-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot size={18} /> Chatbot Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">WhatsApp Chatbot</div>
              <p className="text-sm text-muted-foreground">Automated responses and conversation flows</p>
            </div>
            <Badge variant="secondary">stub</Badge>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Enable chatbot</Label>
            <Switch />
          </div>
          <div className="grid gap-2">
            <Label>Provider</Label>
            <Select defaultValue="twilio">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="waba">WhatsApp Business API</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://your-domain.com/webhook/wa" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare size={18} /> Auto Reply Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Rent inquiry reply</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Payment confirmation</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Ticket status updates</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-normal">Lease expiry reminders</Label>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-2">
            <Label>Fallback message</Label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              defaultValue="Hello! How can we help you?"
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <Select defaultValue="id">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle size={18} /> WA Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Default reminder template</Label>
            <Select defaultValue="rent_reminder">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rent_reminder">Rent Reminder</SelectItem>
                <SelectItem value="payment_confirmed">Payment Confirmed</SelectItem>
                <SelectItem value="ticket_update">Ticket Update</SelectItem>
                <SelectItem value="lease_expiry">Lease Expiry</SelectItem>
                <SelectItem value="token_ready">Token Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Broadcast rate limit (per minute)</Label>
            <Input type="number" min={1} max={100} defaultValue={10} />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
