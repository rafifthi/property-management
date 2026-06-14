"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  Gauge,
  Home,
  Landmark,
  LogOut,
  ReceiptText,
  Search,
  Settings,
  Users,
  Wrench
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

const navItems = [
  { key: "/", label: "Dashboard", icon: <Gauge size={16} /> },
  { key: "/properties", label: "Properties", icon: <Building2 size={16} /> },
  { key: "/tenants", label: "Tenants", icon: <Users size={16} /> },
  { key: "/leases", label: "Leases", icon: <Home size={16} /> },
  { key: "/invoices", label: "Payments", icon: <ReceiptText size={16} />, badge: 2, badgeVariant: "default" },
  { key: "/tickets", label: "Maintenance", icon: <Wrench size={16} />, badge: 2, badgeVariant: "warning" },
  { key: "/utilities", label: "Utilities & PPOB", icon: <Landmark size={16} /> },
  { key: "/documents", label: "Documents", icon: <FileArchive size={16} /> }
];

const secondaryNavItems = [
  { key: "/settings", label: "Settings", icon: <Settings size={16} /> }
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();

  const initials = user
    ? user.fullName
        .split(" ")
        .map((s) => s[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const displayName = user?.fullName ?? user?.email ?? "User";

  const selectedKey =
    [...navItems, ...secondaryNavItems].find((item) => item.key !== "/" && pathname.startsWith(item.key))?.key ?? "/";

  return (
    <TooltipProvider>
      <div className="shell">
        <aside className={`shell-sidebar${collapsed ? " shell-sidebar--collapsed" : ""}`}>
          <div className="brand">
            <div className="brand__mark">
              <Building2 size={14} />
            </div>
            {!collapsed && <div className="brand__name">Rentra</div>}
            <button
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="sidebar-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              type="button"
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="sidebar-nav__section">
              {navItems.map((item) => (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <Link
                      className={`sidebar-nav__link${selectedKey === item.key ? " sidebar-nav__link--active" : ""}`}
                      href={item.key}
                    >
                      {item.icon}
                      {!collapsed && (
                        <span className="nav-label-with-badge">
                          <span>{item.label}</span>
                          {"badge" in item && item.badge ? (
                            <Badge variant={item.badgeVariant as "default" | "warning"} className="ml-1">
                              {item.badge}
                            </Badge>
                          ) : null}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              ))}
            </div>
            <div className="sidebar-divider" />
            <div className="sidebar-nav__section">
              {secondaryNavItems.map((item) => (
                <Tooltip key={item.key}>
                  <TooltipTrigger asChild>
                    <Link
                      className={`sidebar-nav__link${selectedKey === item.key ? " sidebar-nav__link--active" : ""}`}
                      href={item.key}
                    >
                      {item.icon}
                      {!collapsed && item.label}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              ))}
            </div>
          </nav>

          <div className="sidebar-profile">
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-[26px] w-[26px]">
                  <AvatarFallback className="bg-[#bed0ff] text-[#2563eb] text-[10px]">{initials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">{displayName}</TooltipContent>}
            </Tooltip>
            {!collapsed && (
              <>
                <div className="sidebar-profile__meta">
                  <div className="sidebar-profile__name">{displayName}</div>
                  <div className="sidebar-profile__role">Owner</div>
                </div>
                <button
                  aria-label="Sign out"
                  className="sidebar-profile__logout"
                  onClick={signOut}
                  type="button"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </aside>

        <div className="shell-main">
          <header className="shell-header">
            <div className="global-search">
              <Search size={15} color="#9ca3af" />
              <input placeholder="Search tenant, unit, ticket..." />
            </div>
            <div className="header-actions">
              <button className="header-action-btn" aria-label="Calendar" type="button">
                <CalendarDays size={17} />
              </button>
              <div className="notification-indicator">
                <button className="header-action-btn header-action-btn--primary" aria-label="Notifications" type="button">
                  <Bell size={17} />
                </button>
                <span className="notification-indicator__count">3</span>
              </div>
            </div>
          </header>
          <main className="shell-content">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
