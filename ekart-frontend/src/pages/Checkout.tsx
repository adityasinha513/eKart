import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, MapPin, Package, Plus, ShieldCheck, Store, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/helpers";
import { effectivePrice } from "../types/Product";
import * as addressesApi from "../services/api/addresses";
import * as ordersApi from "../services/api/orders";
import * as paymentsApi from "../services/api/payments";
import type { Address, AddressInput } from "../types/Address";
import type { DeliveryType, PaymentThrough } from "../types/Order";
import { extractErrorMessage } from "../utils/errors";

function defaultDeliveryDateTime(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() + 1);
  dt.setHours(12, 0, 0, 0);
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

const emptyAddressForm: AddressInput = {
  label: "Home",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, subtotal, deliveryFee, grandTotal, clearCart } = useCart();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("DELIVERY");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressInput>(emptyAddressForm);
  const [savingAddress, setSavingAddress] = useState(false);

  const [dateOfDelivery, setDateOfDelivery] = useState(defaultDeliveryDateTime());
  const [paymentThrough, setPaymentThrough] = useState<PaymentThrough>("COD");
  const [isPlacing, setIsPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    addressesApi
      .getAddresses(user.emailId)
      .then((data) => {
        setAddresses(data);
        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddress) setSelectedAddressId(defaultAddress.addressId);
        else setShowAddressForm(true);
      })
      .catch(() => setAddresses([]))
      .finally(() => setAddressesLoading(false));
  }, [user]);

  const canPlaceOrder = useMemo(() => {
    if (deliveryType === "DELIVERY" && !selectedAddressId) return false;
    if (!dateOfDelivery) return false;
    return true;
  }, [deliveryType, selectedAddressId, dateOfDelivery]);

  if (cartItems.length === 0 && !placedOrderId) {
    return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-stone-600">Your cart is empty. Add products before checkout.</div>;
  }

  const handleSaveAddress = async () => {
    if (!user) return;
    if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error("Please fill in address line, city, state, and pincode.");
      return;
    }
    setSavingAddress(true);
    try {
      const created = await addressesApi.addAddress(user.emailId, addressForm);
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.addressId);
      setShowAddressForm(false);
      setAddressForm(emptyAddressForm);
      toast.success("Address saved.");
    } catch {
      toast.error("Could not save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    if (!canPlaceOrder) {
      toast.error("Please complete the delivery details first.");
      return;
    }

    setIsPlacing(true);
    try {
      const isoDate = new Date(dateOfDelivery).toISOString();
      const message = await ordersApi.placeOrder({
        customerEmailId: user.emailId,
        deliveryType,
        addressId: deliveryType === "DELIVERY" ? selectedAddressId ?? undefined : undefined,
        paymentThrough,
        dateOfDelivery: isoDate,
      });

      const orderId = ordersApi.parseOrderIdFromMessage(message);

      if (paymentThrough === "ONLINE" && orderId) {
        try {
          const transaction = await paymentsApi.createPaymentOrder(user.emailId, orderId);
          await paymentsApi.openRazorpayCheckout(transaction, user.name, user.emailId);
          toast.success("Payment successful!");
        } catch {
          setPaymentNotice(
            "Online payments aren't fully connected yet, so this order is placed and awaiting payment confirmation. Please contact support or retry payment from your order details."
          );
        }
      } else {
        toast.success("Order placed successfully!");
      }

      await clearCart();
      setPlacedOrderId(orderId);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Could not place your order."));
    } finally {
      setIsPlacing(false);
    }
  };

  if (placedOrderId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
          <h1 className="mt-5 text-3xl font-semibold text-maroon-900">Order confirmed!</h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">
            Order <span className="font-semibold">#{placedOrderId}</span> has been placed successfully.
          </p>
          {paymentNotice ? (
            <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{paymentNotice}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryButton onClick={() => navigate(`/orders/${placedOrderId}`)}>Track order</PrimaryButton>
            <SecondaryButton onClick={() => navigate("/catalog")}>Continue shopping</SecondaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-maroon-700">Secure checkout</p>
        <h1 className="text-3xl font-semibold text-maroon-900">Complete your order</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Truck className="text-maroon-700" />
              <h2 className="text-xl font-semibold text-maroon-900">Delivery or pickup</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setDeliveryType("DELIVERY")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${deliveryType === "DELIVERY" ? "border-maroon-600 bg-mithai-50" : "border-mithai-200 bg-white hover:bg-cream-50"}`}
              >
                <Truck size={20} className="text-maroon-700" />
                <div>
                  <p className="font-semibold text-maroon-900">Home delivery</p>
                  <p className="mt-1 text-sm text-stone-500">Delivered fresh to your address</p>
                </div>
              </button>
              <button
                onClick={() => setDeliveryType("PICKUP")}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${deliveryType === "PICKUP" ? "border-maroon-600 bg-mithai-50" : "border-mithai-200 bg-white hover:bg-cream-50"}`}
              >
                <Store size={20} className="text-maroon-700" />
                <div>
                  <p className="font-semibold text-maroon-900">Store pickup</p>
                  <p className="mt-1 text-sm text-stone-500">Pick up from our nearest outlet</p>
                </div>
              </button>
            </div>
          </div>

          {deliveryType === "DELIVERY" ? (
            <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-maroon-700" />
                  <h2 className="text-xl font-semibold text-maroon-900">Delivery address</h2>
                </div>
                <button onClick={() => setShowAddressForm((v) => !v)} className="inline-flex items-center gap-1 text-sm font-semibold text-maroon-700">
                  <Plus size={16} /> Add new
                </button>
              </div>

              {addressesLoading ? (
                <div className="mt-4 h-20 animate-pulse rounded-2xl bg-mithai-100" />
              ) : addresses.length === 0 && !showAddressForm ? (
                <p className="mt-4 text-sm text-stone-500">No saved addresses yet. Add one to continue.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.addressId}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selectedAddressId === address.addressId ? "border-maroon-600 bg-mithai-50" : "border-mithai-200 bg-white"}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-maroon-700"
                        checked={selectedAddressId === address.addressId}
                        onChange={() => setSelectedAddressId(address.addressId)}
                      />
                      <div className="text-sm">
                        <p className="font-semibold text-maroon-900">{address.label ?? "Address"} {address.isDefault ? <span className="ml-1 text-xs font-normal text-maroon-600">(default)</span> : null}</p>
                        <p className="mt-1 text-stone-600">
                          {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.landmark ? <p className="mt-1 text-stone-500">Landmark: {address.landmark}</p> : null}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <div className="mt-5 rounded-2xl border border-dashed border-mithai-300 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Label (Home, Work...)" value={addressForm.label ?? ""} onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))} />
                    <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value }))} />
                    <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Address line 1" value={addressForm.line1} onChange={(e) => setAddressForm((f) => ({ ...f, line1: e.target.value }))} />
                    <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Address line 2 (optional)" value={addressForm.line2 ?? ""} onChange={(e) => setAddressForm((f) => ({ ...f, line2: e.target.value }))} />
                    <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} />
                    <input className="rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} />
                    <input className="sm:col-span-2 rounded-xl border border-mithai-200 px-3 py-2 outline-none focus:border-maroon-400" placeholder="Landmark (optional)" value={addressForm.landmark ?? ""} onChange={(e) => setAddressForm((f) => ({ ...f, landmark: e.target.value }))} />
                  </div>
                  <div className="mt-3 flex gap-3">
                    <PrimaryButton onClick={handleSaveAddress} disabled={savingAddress}>{savingAddress ? "Saving..." : "Save address"}</PrimaryButton>
                    <SecondaryButton onClick={() => setShowAddressForm(false)}>Cancel</SecondaryButton>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Store className="text-maroon-700" />
                <h2 className="text-xl font-semibold text-maroon-900">Pickup store</h2>
              </div>
              <p className="mt-3 text-sm text-stone-500">Mithai Junction Flagship Store, Sector 18, Gurgaon, Haryana</p>
            </div>
          )}

          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="text-maroon-700" />
              <h2 className="text-xl font-semibold text-maroon-900">
                {deliveryType === "DELIVERY" ? "Delivery" : "Pickup"} date & time
              </h2>
            </div>
            <input
              type="datetime-local"
              value={dateOfDelivery}
              min={defaultDeliveryDateTime()}
              onChange={(event) => setDateOfDelivery(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-mithai-200 px-4 py-3 outline-none focus:border-maroon-400"
            />
          </div>

          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <CreditCard className="text-maroon-700" />
              <h2 className="text-xl font-semibold text-maroon-900">Payment method</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <button
                onClick={() => setPaymentThrough("COD")}
                className={`rounded-2xl border p-4 text-left transition ${paymentThrough === "COD" ? "border-maroon-600 bg-mithai-50" : "border-mithai-200 bg-white hover:bg-cream-50"}`}
              >
                <p className="font-semibold text-maroon-900">Cash on Delivery</p>
                <p className="mt-2 text-sm text-stone-500">Pay when your order arrives</p>
              </button>
              <button
                onClick={() => setPaymentThrough("ONLINE")}
                className={`rounded-2xl border p-4 text-left transition ${paymentThrough === "ONLINE" ? "border-maroon-600 bg-mithai-50" : "border-mithai-200 bg-white hover:bg-cream-50"}`}
              >
                <p className="font-semibold text-maroon-900">Pay online</p>
                <p className="mt-2 text-sm text-stone-500">UPI / Card via Razorpay (setup in progress)</p>
              </button>
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-maroon-700" />
            <h2 className="text-xl font-semibold text-maroon-900">Order summary</h2>
          </div>
          <div className="mt-5 space-y-2 text-sm text-stone-600">
            {cartItems.map((item) => (
              <div key={item.cartProductId} className="flex justify-between">
                <span>{item.product.name} × {item.quantity}</span>
                <span>{formatCurrency(effectivePrice(item.product) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-mithai-200 pt-4 text-sm text-stone-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span></div>
          </div>
          <div className="mt-5 border-t border-mithai-200 pt-4 text-lg font-semibold text-maroon-900">
            <div className="flex items-center justify-between"><span>Grand total</span><span className="text-maroon-700">{formatCurrency(grandTotal)}</span></div>
          </div>
          <PrimaryButton fullWidth className="mt-6" onClick={handlePlaceOrder} disabled={!canPlaceOrder || isPlacing}>
            {isPlacing ? "Placing order..." : `Place order — ${formatCurrency(grandTotal)}`}
          </PrimaryButton>
        </aside>
      </div>
    </div>
  );
}
