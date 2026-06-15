import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, CreditCard, MessageCircle, ReceiptText, Settings2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const modules = [
    {
      href: "/settings/general",
      title: "General",
      desc: "Owner profile, billing contact, and payout bank account.",
      status: "Ready",
      variant: "success" as const,
      icon: <Settings2 size={18} />
    },
    {
      href: "/settings/billing",
      title: "Billing & Invoice",
      desc: "Monthly rent policy, invoice timing, fees, and deposits.",
      status: "Needs review",
      variant: "warning" as const,
      icon: <ReceiptText size={18} />
    },
    {
      href: "/settings/payments",
      title: "Payment Gateway",
      desc: "Provider mode, API credentials, and connection tests.",
      status: "Stub mode",
      variant: "warning" as const,
      icon: <CreditCard size={18} />
    },
    {
      href: "/settings/chatbot",
      title: "WA Chatbot",
      desc: "WhatsApp sender, templates, and automation limits.",
      status: "Stub mode",
      variant: "warning" as const,
      icon: <MessageCircle size={18} />
    },
    {
      href: "/settings/users",
      title: "Users & Roles",
      desc: "Team access, roles, and operational permissions.",
      status: "Ready",
      variant: "success" as const,
      icon: <Users size={18} />
    },
    {
      href: "/settings/notifications",
      title: "Notifications",
      desc: "Owner alerts for invoices, tickets, and lease dates.",
      status: "Attention",
      variant: "warning" as const,
      icon: <CircleAlert size={18} />
    }
  ];

  return (
    <section className="settings-overview">
      <Card>
        <CardHeader className="settings-overview__header">
          <div>
            <CardTitle>Setup health</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review the configuration areas that affect invoices, provider connections, and team access.
            </p>
          </div>
          <Badge variant="secondary">Prototype providers active</Badge>
        </CardHeader>
        <CardContent className="settings-status-list">
          {modules.map((module) => (
            <Link className="settings-status-row" href={module.href} key={module.href}>
              <span className="settings-status-row__icon">{module.icon}</span>
              <span className="settings-status-row__body">
                <span className="settings-status-row__title">{module.title}</span>
                <span className="settings-status-row__desc">{module.desc}</span>
              </span>
              <Badge variant={module.variant}>{module.status}</Badge>
              <ArrowRight size={16} className="settings-status-row__arrow" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended next checks</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start with the settings that can change tenant-facing money movement.
          </p>
        </CardHeader>
        <CardContent className="settings-checklist">
          <div className="settings-checklist__item">
            <CheckCircle2 size={16} />
            Confirm Billing & Invoice before sending the next rent batch.
          </div>
          <div className="settings-checklist__item">
            <CheckCircle2 size={16} />
            Test Payment Gateway before switching any provider to live mode.
          </div>
          <div className="settings-checklist__item">
            <CheckCircle2 size={16} />
            Keep one owner and one backup admin in Users & Roles.
          </div>
          <Button asChild variant="outline" className="w-fit">
            <Link href="/settings/billing">Review billing policy</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
