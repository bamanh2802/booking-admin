import { NavLink } from "react-router-dom";
import {
  Car,
  Users,
  Ticket,
  Wallet,
  MessageSquare,
  BarChart3,
  Building,
  BusFront,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: BarChart3 },
  { to: "/admin/routes", label: "Quản lý Tuyến xe", icon: Car },
  { to: "/admin/tickets", label: "Quản lý Vé", icon: Ticket },
  { to: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  { to: "/admin/agents", label: "Quản lý Đại lý", icon: Building },
  { to: "/admin/refunds", label: "Quản lý Hoàn tiền", icon: Wallet },
  { to: "/admin/feedback", label: "Phản hồi", icon: MessageSquare },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 p-4 md:flex">
      <div className="mb-8 flex items-center gap-3">
        <BusFront className="h-8 w-8 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Vexekhach Admin</h2>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary
               ${isActive ? "bg-primary text-primary-foreground" : ""}`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
