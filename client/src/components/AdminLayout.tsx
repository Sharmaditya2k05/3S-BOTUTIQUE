import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ivory-dark">
        <p className="text-sm text-warmgray">Loading...</p>
      </div>
    );
  }

  if (!admin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex min-h-screen bg-ivory-dark">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setMobileOpen(false)} />
          <div className="relative">
            <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="focus-ring absolute right-3 top-6 text-ivory"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-charcoal/10 bg-ivory px-5 py-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="focus-ring text-charcoal"
          >
            <Menu size={22} />
          </button>
          <span className="font-serif-display text-lg text-wine">Admin</span>
        </div>
        <div className="flex-1 p-5 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
