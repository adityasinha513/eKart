import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, MapPin, Package, RotateCcw, Store } from "lucide-react";
import * as ordersApi from "../services/api/orders";
import type { Order, OrderStatus } from "../types/Order";
import { formatCurrency } from "../utils/helpers";
import PrimaryButton from "../components/ui/PrimaryButton";

const STATUS_FLOW: OrderStatus[] = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
const PICKUP_STATUS_FLOW: OrderStatus[] = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (!id) return;
    ordersApi
      .getOrder(Number(id))
      .then(setOrder)
      .catch(() => setError("Could not find this order."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    setIsReordering(true);
    try {
      await ordersApi.reorder(order.orderId);
      toast.success("Items added back to your cart.");
    } catch {
      toast.error("Could not reorder right now.");
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-[28px] bg-mithai-100" />
      </div>
    );
  }

  if (error || !order) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-stone-600">{error ?? "Order not found."}</div>;
  }

  const isCancelled = order.orderStatus === "CANCELLED";
  const flow = order.deliveryType === "PICKUP" ? PICKUP_STATUS_FLOW : STATUS_FLOW;
  const currentIndex = flow.indexOf(order.orderStatus);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-maroon-600">Order #{order.orderId}</p>
            <h1 className="mt-1 text-2xl font-semibold text-maroon-900">
              {new Date(order.dateOfOrder).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </h1>
          </div>
          <PrimaryButton onClick={handleReorder} disabled={isReordering} icon={<RotateCcw size={16} />}>
            {isReordering ? "Adding..." : "Reorder"}
          </PrimaryButton>
        </div>

        {isCancelled ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-700">This order was cancelled.</div>
        ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {flow.map((status, index) => {
                const reached = index <= currentIndex;
                return (
                  <div key={status} className="flex flex-1 flex-col items-center text-center">
                    <div className="flex w-full items-center">
                      <div className={`h-1 flex-1 ${index === 0 ? "invisible" : reached ? "bg-maroon-700" : "bg-mithai-200"}`} />
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${reached ? "bg-maroon-700 text-white" : "bg-mithai-200 text-stone-500"}`}>
                        {reached ? <Check size={14} /> : index + 1}
                      </div>
                      <div className={`h-1 flex-1 ${index === flow.length - 1 ? "invisible" : reached ? "bg-maroon-700" : "bg-mithai-200"}`} />
                    </div>
                    <p className={`mt-2 text-xs font-medium ${reached ? "text-maroon-800" : "text-stone-400"}`}>{status.replaceAll("_", " ")}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-cream-100 p-4 text-sm text-stone-600">
            <div className="flex items-center gap-2 font-semibold text-maroon-900">
              {order.deliveryType === "DELIVERY" ? <MapPin size={16} /> : <Store size={16} />}
              {order.deliveryType === "DELIVERY" ? "Delivery address" : "Pickup location"}
            </div>
            <p className="mt-2">{order.deliveryAddressSnapshot ?? order.pickupStoreLocation ?? "Not specified"}</p>
          </div>
          <div className="rounded-2xl bg-cream-100 p-4 text-sm text-stone-600">
            <div className="flex items-center gap-2 font-semibold text-maroon-900">
              <Package size={16} /> Delivery / pickup time
            </div>
            <p className="mt-2">{new Date(order.dateOfDelivery).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            <p className="mt-1">Payment: {order.paymentThrough === "COD" ? "Cash on Delivery" : "Online"}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-maroon-900">Items</h2>
          <div className="mt-4 space-y-3">
            {order.orderedProducts?.map((item) => (
              <div key={item.orderedProductId} className="flex items-center justify-between rounded-2xl border border-mithai-200 p-4 text-sm">
                <div>
                  <p className="font-medium text-maroon-900">{item.product?.name ?? "Product"}</p>
                  <p className="text-stone-500">Qty {item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="font-semibold text-maroon-800">{formatCurrency(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end text-lg font-semibold text-maroon-900">
            Total: <span className="ml-2 text-maroon-700">{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>

        {order.statusHistory?.length ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-maroon-900">Status history</h2>
            <div className="mt-4 space-y-3">
              {order.statusHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3 text-sm">
                  <span className="font-medium text-maroon-900">{entry.status.replaceAll("_", " ")}</span>
                  <span className="text-stone-500">{new Date(entry.changedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
