"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, LayoutList, MessageCircle, ReceiptText, Settings2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const submodules = [
  { key: "/settings", label: "Overview", icon: <LayoutList size={16} /> },
  { key: "/settings/general", label: "General", icon: <Settings2 size={16} /> },
  { key: "/settings/billing", label: "Billing & Invoice", icon: <ReceiptText size={16} /> },
  { key: "/settings/payments", label: "Payment Gateway", icon: <CreditCard size={16} /> },
  { key: "/settings/chatbot", label: "WA Chatbot", icon: <MessageCircle size={16} /> },
  { key: "/settings/users", label: "Users & Roles", icon: <Users size={16} /> },
  { key: "/settings/notifications", label: "Notifications", icon: <Bell size={16} /> }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="settings-module">
      <PageHeader
        breadcrumbs={[{ href: "/", label: "Home" }, { label: "Settings" }]}
        title="Settings"
        copy="Prototype mode keeps providers stubbed while preserving the exact settings surface needed for live adapters later."
      />

      <div className="settings-layout">
        <Tabs value={pathname} className="module-tabs-root">
          <TabsList className="module-tabs" aria-label="Settings submodules">
            {submodules.map((item) => (
              <TabsTrigger asChild className="module-tabs__trigger" key={item.key} value={item.key}>
                <Link href={item.key}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <main className="settings-content">{children}</main>
      </div>
    </div>
  );
}
