import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as ordersApi from "../services/api/orders";
import type { Order } from "../types/Order";
import { formatCurrency } from "../utils/helpers";
import EmptyState from "../components/ui/EmptyState";
import PrimaryButton from "../components/ui/PrimaryButton";
import SectionHeading from "../shared/components/SectionHeading";

const STATUS_STYLES: Record<string, string> = {
  PLACED: "bg-stone-100 text-stone-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  PREPARING: "bg-amber-50 text-amber-700",
  READY_FOR_PICKUP: "bg-indigo-50 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    ordersApi
      .getOrdersForCustomer(user.emailId)
      .then((data) => setOrders([...data].sort((a, b) => b.orderId - a.orderId)))
      .catch(() => setError("Could not load your orders."))
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading title="My orders" subtitle="Track and manage your recent orders" />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[24px] bg-mithai-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">{error}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package size={40} />}
          title="No orders yet"
          description="Once you place an order, you'll be able to track it here."
          action={
            <Link to="/catalog">
              <PrimaryButton>Start shopping</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.orderId}
              to={`/orders/${order.orderId}`}
              className="flex flex-col gap-3 rounded-[24px] border border-mithai-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-maroon-900">Order #{order.orderId}</p>
                <p className="mt-1 text-sm text-stone-500">
                  {new Date(order.dateOfOrder).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} • {order.orderedProducts?.length ?? 0} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[order.orderStatus] ?? "bg-stone-100 text-stone-700"}`}>
                  {order.orderStatus.replaceAll("_", " ")}
                </span>
                <span className="font-semibold text-maroon-800">{formatCurrency(order.totalPrice)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
