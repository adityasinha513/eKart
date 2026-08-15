import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ListTree, MessageSquare, Package, Tags, Users, ShoppingBag } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: ListTree },
  { to: "/admin/offers", label: "Offers", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-24 rounded-[24px] border border-mithai-200 bg-white p-3 shadow-sm">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Admin</p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-maroon-700 text-white" : "text-stone-600 hover:bg-mithai-50"
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
