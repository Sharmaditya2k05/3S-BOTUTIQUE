import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShirtIcon,
  PlusCircle,
  Tags,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Ticket,
  MessageCircle,
  ClipboardList,
  HardDrive,
  BookOpen,
  Users,
} from "lucide-react";
import Logo from "./Logo";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, section: null },
  { to: "/admin/products", label: "All Sarees", icon: ShirtIcon, section: "Catalog" },
  { to: "/admin/products/new", label: "Add Saree", icon: PlusCircle, section: null },
  { to: "/admin/categories", label: "Categories", icon: Tags, section: null },
  { to: "/admin/blog", label: "Blog / Lookbook", icon: BookOpen, section: "Content" },
  { to: "/admin/analytics", label: "Enquiries / Analytics", icon: MessageSquare, section: "Business" },
  { to: "/admin/whatsapp-log", label: "WhatsApp Log", icon: MessageCircle, section: null },
  { to: "/admin/whatsapp-templates", label: "Message Templates", icon: ClipboardList, section: null },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket, section: null },
  { to: "/admin/customers", label: "Customers", icon: Users, section: null },
  { to: "/admin/settings", label: "Settings", icon: Settings, section: null },
  { to: "/admin/backup", label: "Backup & Restore", icon: HardDrive, section: "Operations" },
];

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { logout, admin } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="flex h-full w-64 flex-col bg-wine text-ivory">
      <div className="border-b border-ivory/10 px-6 py-6">
        <Logo light size="sm" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {LINKS.map((link) => (
          <div key={link.to}>
            {link.section && (
              <p className="mb-1.5 mt-5 px-3 text-[10px] font-semibold tracking-[0.15em] text-rose-light/70">
                {link.section.toUpperCase()}
              </p>
            )}
            <NavLink
              to={link.to}
              end={link.to === "/admin/dashboard"}
              onClick={onNavigate}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-ivory/15 text-ivory"
                    : "text-rose-light hover:bg-ivory/10 hover:text-ivory"
                }`
              }
            >
              <link.icon size={16} />
              {link.label}
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-ivory/10 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-rose-light hover:bg-ivory/10 hover:text-ivory"
        >
          <ExternalLink size={16} /> View Website
        </a>
        <button
          onClick={handleLogout}
          className="focus-ring flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm text-rose-light hover:bg-ivory/10 hover:text-ivory"
        >
          <LogOut size={16} /> Logout
        </button>
        {admin && (
          <p className="px-3 pt-2 text-[11px] text-rose-light/70">Signed in as {admin.name}</p>
        )}
      </div>
    </div>
  );
}
