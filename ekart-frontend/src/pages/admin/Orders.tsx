import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "../../types/Order";
import { formatCurrency } from "../../utils/helpers";
import { extractErrorMessage } from "../../utils/errors";
import * as adminApi from "../../services/api/admin";

function nextStatus(order: Order): OrderStatus | null {
  if (order.paymentThrough === "ONLINE" && order.paymentStatus !== "PAID") return null;
  if (order.orderStatus === "PLACED") return "CONFIRMED";
  if (order.orderStatus === "CONFIRMED") return "PREPARING";
  if (order.orderStatus === "PREPARING") return "READY_FOR_PICKUP";
  if (order.orderStatus === "READY_FOR_PICKUP" && order.deliveryType === "DELIVERY") return "OUT_FOR_DELIVERY";
  if (order.orderStatus === "READY_FOR_PICKUP" || order.orderStatus === "OUT_FOR_DELIVERY") return "DELIVERED";
  return null;
}

const FILTERS: Array<{ label: string; matches: (order: Order) => boolean }> = [
  { label: "All", matches: () => true }, { label: "New", matches: (o) => o.orderStatus === "PLACED" },
  { label: "Accepted", matches: (o) => o.orderStatus === "CONFIRMED" }, { label: "Packing", matches: (o) => o.orderStatus === "PREPARING" },
  { label: "Ready", matches: (o) => o.orderStatus === "READY_FOR_PICKUP" }, { label: "Out for delivery", matches: (o) => o.orderStatus === "OUT_FOR_DELIVERY" },
  { label: "Delivered", matches: (o) => o.orderStatus === "DELIVERED" && o.deliveryType === "DELIVERY" },
  { label: "Picked up", matches: (o) => o.orderStatus === "DELIVERED" && o.deliveryType === "PICKUP" },
  { label: "Cancelled", matches: (o) => o.orderStatus === "CANCELLED" },
];
const statusLabel = (order: Order) => order.orderStatus === "PLACED" ? "New"
  : order.orderStatus === "CONFIRMED" ? "Accepted" : order.orderStatus === "PREPARING" ? "Packing"
  : order.orderStatus === "READY_FOR_PICKUP" ? order.deliveryType === "PICKUP" ? "Ready for pickup" : "Ready"
  : order.orderStatus === "DELIVERED" ? order.deliveryType === "PICKUP" ? "Picked up" : "Delivered"
  : order.orderStatus.replaceAll("_", " ");

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const refresh = useCallback(async () => {
    try { setOrders(await adminApi.getAdminOrders()); setError(null); }
    catch (cause) { setError(extractErrorMessage(cause, "Could not load orders.")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    const rejectionReasons = ["Product unavailable", "Shop closed", "Delivery unavailable", "Customer request", "Other"];
    const selectedReason = status === "CANCELLED" ? window.prompt(`Choose a cancellation reason:\n${rejectionReasons.map((reason, i) => `${i + 1}. ${reason}`).join("\n")}`, "1")?.trim() : undefined;
    const note = selectedReason && /^[1-5]$/.test(selectedReason)
      ? rejectionReasons[Number(selectedReason) - 1]
      : selectedReason?.trim();
    if (status === "CANCELLED" && !note) return;
    setUpdating(order.orderId);
    try {
      const updated = await adminApi.updateAdminOrderStatus(order.orderId, status, note);
      setOrders((current) => current.map((item) => item.orderId === updated.orderId ? updated : item));
      toast.success(`Order #${order.orderId} is ${status.toLowerCase().replaceAll("_", " ")}.`);
    } catch (cause) { toast.error(extractErrorMessage(cause, "Could not update order status.")); }
    finally { setUpdating(null); }
  };

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-semibold text-maroon-900">Orders</h1><p className="mt-2 text-sm text-stone-500">New orders refresh automatically every 15 seconds.</p></div>
      <button onClick={() => void refresh()} className="inline-flex items-center gap-2 rounded-xl border border-mithai-200 bg-white px-4 py-2 text-sm font-semibold text-maroon-800"><RefreshCw size={16}/> Refresh</button>
    </div>
    {error && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <nav aria-label="Filter orders" className="mt-5 flex gap-2 overflow-x-auto pb-2">{FILTERS.map((item) => <button key={item.label} onClick={() => setFilter(item.label)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${filter === item.label ? "bg-maroon-800 text-white" : "border border-mithai-200 bg-white text-stone-700"}`}>{item.label}</button>)}</nav>
    {loading ? <div className="mt-8 flex justify-center text-maroon-700"><LoaderCircle className="animate-spin"/></div> : orders.length === 0 ? <div className="mt-8 rounded-2xl border border-mithai-200 bg-white p-8 text-center text-stone-500">No orders yet. New customer orders will appear here.</div> :
      <div className="mt-6 space-y-4">{orders.filter(FILTERS.find((item) => item.label === filter)!.matches).length === 0 ? <div className="rounded-2xl border border-mithai-200 bg-white p-8 text-center text-stone-500">No {filter.toLowerCase()} orders.</div> : orders.filter(FILTERS.find((item) => item.label === filter)!.matches).map((order) => {
        const next = nextStatus(order);
        return <article key={order.orderId} className="rounded-2xl border border-mithai-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="font-semibold text-maroon-900">{order.orderStatus === "PLACED" ? "NEW ORDER " : "Order "}#{order.orderId} <span className="ml-2 rounded-full bg-mithai-100 px-3 py-1 text-xs">{statusLabel(order)}</span></h2><p className="mt-2 text-sm text-stone-500">{new Date(order.dateOfOrder).toLocaleString("en-IN")} · {order.deliveryType === "PICKUP" ? "Pickup" : order.deliveryType === "DELIVERY" ? "Delivery" : "Legacy delivery type unknown"} · {order.paymentThrough} · Payment {order.paymentStatus}</p><p className="mt-1 text-sm text-stone-500">Customer: {order.customerName ?? order.customerEmailId} · {order.customerPhoneNumber ?? order.customerEmailId}</p></div>
            <p className="text-lg font-semibold text-maroon-800">{formatCurrency(order.totalPrice)}</p>
          </div>
          <div className="mt-4 grid gap-4 border-t border-mithai-100 pt-4 md:grid-cols-[1fr_1fr_auto]">
            <div><p className="text-xs font-semibold uppercase text-stone-400">Items</p>{order.orderedProducts?.map((item) => <p key={item.orderedProductId} className="mt-1 text-sm text-stone-700">{item.product?.name ?? "Product"} × {item.quantity}</p>)}</div>
            <div><p className="text-xs font-semibold uppercase text-stone-400">{order.deliveryType === "DELIVERY" ? "Deliver to" : "Pickup"}</p><p className="mt-1 text-sm text-stone-700">{order.deliveryAddressSnapshot ?? order.pickupStoreLocation ?? "—"}</p><p className="mt-2 text-xs text-stone-500">Requested {order.dateOfDelivery ? new Date(order.dateOfDelivery).toLocaleString("en-IN") : "time not set"}</p></div>
            <div className="flex flex-wrap items-start gap-2">{next && <button disabled={updating === order.orderId} onClick={() => void changeStatus(order, next)} className="rounded-xl bg-maroon-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{updating === order.orderId ? "Saving…" : next === "CONFIRMED" ? "Accept order" : next === "PREPARING" ? "Start packing" : next === "READY_FOR_PICKUP" ? "Mark ready" : next === "OUT_FOR_DELIVERY" ? "Start delivery" : order.deliveryType === "PICKUP" ? "Mark picked up" : "Mark delivered"}</button>}{order.orderStatus === "PLACED" ? <button disabled={updating === order.orderId} onClick={() => void changeStatus(order, "CANCELLED")} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">Reject order</button> : null}</div>
          </div>
        </article>;
      })}</div>}
  </div>;
}
