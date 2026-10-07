import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Search, Users } from "lucide-react";
import * as adminApi from "../../services/api/admin";
import type { AdminCustomer } from "../../services/api/admin";
import { extractErrorMessage } from "../../utils/errors";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getAdminCustomers()
      .then((data) => { setCustomers(data); setError(null); })
      .catch((cause) => setError(extractErrorMessage(cause, "Could not load customers.")))
      .finally(() => setLoading(false));
  }, []);

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => `${customer.name} ${customer.emailId} ${customer.phoneNumber}`.toLowerCase().includes(query));
  }, [customers, search]);

  return <section>
    <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-200 text-[#3D2B1F]"><Users size={20}/></span><div><h1 className="text-2xl font-semibold text-[#3D2B1F]">Customers</h1><p className="mt-1 text-sm text-stone-500">Customer contact details and order counts.</p></div></div>
    <label className="mt-5 flex min-h-11 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3"><Search size={16} className="text-stone-400"/><input aria-label="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email or phone" className="w-full bg-transparent text-sm outline-none"/></label>
    {error ? <div role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error}</div> : null}
    {loading ? <div className="mt-8 flex justify-center text-stone-600"><LoaderCircle className="animate-spin"/></div> : !error && visibleCustomers.length === 0 ? <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500">{customers.length ? "No customers match your search." : "No customer accounts yet."}</div> : null}
    {!loading && visibleCustomers.length > 0 ? <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500"><tr><th className="p-4">Customer</th><th className="p-4">Email</th><th className="p-4">Phone</th><th className="p-4">Orders</th></tr></thead><tbody>{visibleCustomers.map((customer) => <tr key={customer.emailId} className="border-t border-stone-100"><td className="p-4 font-semibold text-stone-800">{customer.name}</td><td className="p-4 text-stone-600">{customer.emailId}</td><td className="p-4 text-stone-600">{customer.phoneNumber}</td><td className="p-4 font-semibold text-stone-800">{customer.orderCount}</td></tr>)}</tbody></table></div></div> : null}
  </section>;
}
