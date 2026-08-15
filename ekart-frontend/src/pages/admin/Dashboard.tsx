import { Package, ShoppingBag, Tags, Users } from "lucide-react";
import AdminPlaceholder from "./AdminPlaceholder";

const STATS = [
  { label: "Total orders", icon: ShoppingBag },
  { label: "Total products", icon: Package },
  { label: "Active offers", icon: Tags },
  { label: "Customers", icon: Users },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-maroon-900">Admin dashboard</h1>
      <p className="mt-2 text-sm text-stone-500">Overview of Mithai Junction operations.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-[20px] border border-mithai-200 bg-white p-5 shadow-sm">
            <stat.icon className="text-maroon-700" size={20} />
            <p className="mt-3 text-2xl font-semibold text-maroon-900">—</p>
            <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <AdminPlaceholder title="Analytics" description="Order volume, revenue, and top-selling products will appear here." />
      </div>
    </div>
  );
}
