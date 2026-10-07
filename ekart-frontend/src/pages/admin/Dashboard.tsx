import { useCallback, useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, Package, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import * as adminApi from "../../services/api/admin";
import type { Order } from "../../types/Order";
import type { Product } from "../../types/Product";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersUnavailable, setOrdersUnavailable] = useState(false);
  const [productsUnavailable, setProductsUnavailable] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = () => Promise.allSettled([adminApi.getAdminOrders(), adminApi.getAdminProducts()])
      .then(([ordersResult, productsResult]) => {
        if (!active) return;
        setOrdersUnavailable(ordersResult.status === "rejected");
        setProductsUnavailable(productsResult.status === "rejected");
        if (ordersResult.status === "fulfilled") setOrders(ordersResult.value);
        if (productsResult.status === "fulfilled") setProducts(productsResult.value);
      }).finally(() => { if (active) setLoading(false); });
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const updateOrder = useCallback(async (order: Order, status: "CONFIRMED" | "CANCELLED") => {
    if (status === "CANCELLED" && !window.confirm(`Reject order #${order.orderId}?`)) return;
    setUpdating(order.orderId);
    try {
      const updated = await adminApi.updateAdminOrderStatus(order.orderId, status, status === "CANCELLED" ? "Rejected by shopkeeper" : undefined);
      setOrders((current) => current.map((item) => item.orderId === updated.orderId ? { ...item, ...updated } : item));
    } finally {
      setUpdating(null);
    }
  }, []);

  const openOrders = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.orderStatus)).length;
  const unavailableProducts = products.filter((product) => !product.available || product.availableQuantity <= 0).length;
  const outOfStockProducts = products.filter((product) => product.availableQuantity <= 0).length;
  const todayOrders = orders.filter((order) => new Date(order.dateOfOrder).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.filter((order) => order.paymentStatus === "PAID").reduce((sum, order) => sum + order.totalPrice, 0);
  const metrics = [
    ["Today's orders", todayOrders.length], ["Today's revenue", `₹${todayRevenue.toLocaleString("en-IN")}`],
    ["New orders", orders.filter((order) => order.orderStatus === "PLACED").length],
    ["Packing", orders.filter((order) => order.orderStatus === "PREPARING").length],
    ["Ready", orders.filter((order) => order.orderStatus === "READY_FOR_PICKUP").length],
    ["Out for delivery", orders.filter((order) => order.orderStatus === "OUT_FOR_DELIVERY").length],
    ["Completed", orders.filter((order) => order.orderStatus === "DELIVERED").length],
    ["Out of stock", outOfStockProducts],
  ] as const;

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.17em] text-maroon-700">Mithai Junction</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-darkbrown">Business dashboard</h1>
      <p className="mt-2 text-sm text-stone-600">Keep up with today’s orders and what’s available in the menu.</p>

      {ordersUnavailable || productsUnavailable ? <div role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{ordersUnavailable && productsUnavailable ? "Shop data is temporarily unavailable." : ordersUnavailable ? "The order count is unavailable. Check the Orders page for details." : "The product count is unavailable. Check the Products page for details."}</div> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => <article key={label} className="rounded-2xl border border-mithai-200 bg-white p-4 shadow-sm"><p className="text-sm text-stone-500">{label}</p><p className="mt-2 text-2xl font-bold text-darkbrown">{loading || (label === "Out of stock" ? productsUnavailable : ordersUnavailable) ? "—" : value}</p></article>)}
      </div>
      <section className="mt-7 rounded-3xl border border-mithai-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="attention-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-maroon-700">Shop floor</p><h2 id="attention-heading" className="mt-1 text-xl font-semibold text-darkbrown">New orders</h2><p className="mt-1 text-sm text-stone-500">This list refreshes automatically every 15 seconds.</p></div>
          <Link to="/admin/orders" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-mithai-200 px-4 py-2 text-sm font-semibold text-maroon-800">All orders <ArrowRight size={16} /></Link>
        </div>
        {ordersUnavailable ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">New orders could not be loaded. Try the Orders page or refresh shortly.</p> : null}
        {!ordersUnavailable && !loading && orders.filter((order) => order.orderStatus === "PLACED").length === 0 ? <p className="mt-4 rounded-xl bg-cream-50 p-4 text-sm text-stone-600">No new orders waiting right now.</p> : null}
        <div className="mt-4 space-y-3">
          {orders.filter((order) => order.orderStatus === "PLACED").slice(0, 5).map((order) => <article key={order.orderId} className="rounded-2xl border border-mithai-200 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-semibold text-darkbrown">Order #{order.orderId} <span className="font-normal text-stone-500">· {order.customerName || order.customerEmailId}</span></p><p className="mt-1 text-sm text-stone-600">{order.orderedProducts.map((item) => `${item.quantity} × ${item.product.name}`).join(" · ")}</p><p className="mt-1 text-sm text-stone-500">{order.deliveryType === "PICKUP" ? "Pickup" : "Delivery"} · {order.paymentThrough === "COD" ? "COD" : order.paymentStatus}</p></div>
              <p className="text-lg font-bold text-darkbrown">₹{order.totalPrice.toLocaleString("en-IN")}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2"><Link to={`/admin/orders`} className="inline-flex min-h-10 items-center rounded-xl border border-mithai-200 px-3 py-2 text-sm font-semibold text-maroon-800">View order</Link><button type="button" disabled={updating === order.orderId} onClick={() => void updateOrder(order, "CONFIRMED")} className="min-h-10 rounded-xl bg-maroon-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{updating === order.orderId ? "Saving…" : "Accept"}</button><button type="button" disabled={updating === order.orderId} onClick={() => void updateOrder(order, "CANCELLED")} className="min-h-10 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60">Reject</button></div>
          </article>)}
        </div>
      </section>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/orders" className="group rounded-3xl border border-mithai-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mithai-100 text-maroon-700"><ShoppingBag size={20} /></span><ArrowRight size={18} className="text-maroon-700 transition-transform group-hover:translate-x-1" /></div>
          <p className="mt-5 text-sm font-semibold text-stone-600">Orders to follow up</p>
          <p className="mt-1 text-3xl font-bold text-darkbrown">{loading ? <LoaderCircle className="animate-spin" size={24} /> : ordersUnavailable ? "—" : openOrders}</p>
          <p className="mt-2 text-sm text-stone-500">Open the order queue and update progress.</p>
        </Link>
        <Link to="/admin/products" className="group rounded-3xl border border-mithai-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
          <div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mithai-100 text-maroon-700"><Package size={20} /></span><ArrowRight size={18} className="text-maroon-700 transition-transform group-hover:translate-x-1" /></div>
          <p className="mt-5 text-sm font-semibold text-stone-600">Unavailable products</p>
          <p className="mt-1 text-3xl font-bold text-darkbrown">{loading ? <LoaderCircle className="animate-spin" size={24} /> : productsUnavailable ? "—" : unavailableProducts}</p>
          <p className="mt-2 text-sm text-stone-500">Review availability in the live catalogue.</p>
        </Link>
      </div>
      <div className="mt-6 rounded-3xl bg-[#3D2B1F] p-5 text-[#F7E7CE] sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E0B084]">Shopkeeper tip</p><p className="mt-2 max-w-2xl text-sm leading-6">New customer orders appear in Orders. Update their status as you confirm, prepare, and hand them over.</p></div>
    </div>
  );
}
