import { Link, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Users, ShoppingBag } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/inventory", label: "Inventory", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/admin" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3D2B1F] text-lg text-[#F7E7CE]">✦</span><span><span className="block font-semibold text-[#3D2B1F]">Mithai Junction</span><span className="block text-xs text-stone-500">Shop management</span></span></Link>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-stone-600 sm:inline">{user?.name ?? "Shopkeeper"}</span><button type="button" onClick={logout} className="min-h-10 rounded-xl border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-50">Sign out</button></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-5 sm:px-6 sm:py-8 md:flex-row md:gap-6 lg:px-8">
        <aside className="w-full shrink-0 md:w-56">
          <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm md:sticky md:top-5 md:rounded-3xl md:p-3">
            <p className="hidden px-3 py-2 text-xs font-bold uppercase tracking-[0.15em] text-stone-500 md:block">Shopkeeper</p>
            <nav aria-label="Shopkeeper navigation" className="flex gap-1 overflow-x-auto md:flex-col">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors md:w-full ${isActive ? "bg-[#3D2B1F] text-white" : "text-stone-600 hover:bg-stone-100 hover:text-[#3D2B1F]"}`}>
                  <item.icon size={16} />{item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>
        <main className="min-w-0 flex-1 rounded-2xl sm:rounded-3xl"><Outlet /></main>
      </div>
    </div>
  );
}
