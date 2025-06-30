"use client";

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Wallet,
  Building,
  Bus,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dữ liệu cho các mục menu (không đổi)
const navItems = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Xử lý Yêu cầu", icon: ListChecks },
  { to: "/admin/trips", label: "Quản lý Chuyến đi", icon: Bus },
  { to: "/admin/tickets", label: "Quản lý Vé", icon: Ticket },
  { to: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  { to: "/admin/companies", label: "Quản lý Nhà xe", icon: Building },
  { to: "/admin/commission", label: "Quản lý Hoàn tiền", icon: Wallet },
];

export function Sidebar() {
  return (
    <aside className="hidden h-full flex-col border-r bg-muted/40 md:flex">
      <div className="flex h-20 items-center justify-center border-b px-4 lg:h-24 lg:px-6">
        <NavLink
          to="/admin"
          className="flex flex-col items-center gap-2 font-bold text-primary transition-transform hover:scale-105"
        >
          <Bus className="h-8 w-8" />
          <span className="text-xl tracking-tight">Vé Xe Này</span>
        </NavLink>
      </div>

      {/* 3. Vùng Menu chính (không đổi) */}
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start gap-1 px-2 py-4 text-sm font-medium lg:px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  isActive &&
                    "bg-primary text-primary-foreground hover:text-primary-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* 4. Footer của Sidebar (không đổi) */}
      <div className="mt-auto border-t p-4">
        <p className="text-xs text-center text-muted-foreground">
          © {new Date().getFullYear()} Vexenay Admin
        </p>
      </div>
    </aside>
  );
}
