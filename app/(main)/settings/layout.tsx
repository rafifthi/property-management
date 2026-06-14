"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, CreditCard, MessageCircle, ReceiptText, Settings2, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const submodules = [
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
        <nav className="settings-nav" aria-label="Settings submodules">
          {submodules.map((item) => {
            const isActive = pathname === item.key || (item.key === "/settings/general" && pathname === "/settings");
            return (
              <Link
                className={`settings-nav__item ${isActive ? "settings-nav__item--active" : ""}`}
                href={item.key}
                key={item.key}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <main className="settings-content">{children}</main>
      </div>
    </div>
  );
}
