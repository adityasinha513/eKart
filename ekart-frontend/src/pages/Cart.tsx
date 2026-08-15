import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import EmptyState from "../components/ui/EmptyState";
import PrimaryButton from "../components/ui/PrimaryButton";
import SecondaryButton from "../components/ui/SecondaryButton";
import VegBadge from "../components/ui/VegBadge";
import { formatCurrency } from "../utils/helpers";
import { effectivePrice } from "../types/Product";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80&auto=format&fit=crop";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, isLoading, updateQuantity, removeFromCart, clearCart, subtotal, deliveryFee, grandTotal } = useCart();

  if (!isLoading && cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <EmptyState
          icon={<ShoppingBag size={40} />}
          title="Your cart is empty"
          description="Add a few sweets or snacks to get started."
          action={
            <Link to="/catalog">
              <PrimaryButton>Continue Shopping</PrimaryButton>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-[28px] border border-mithai-200 bg-white p-4 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold text-maroon-900">Your Cart</h1>
              <p className="text-sm text-stone-500">{cartItems.length} item(s) ready for checkout</p>
            </div>
            {cartItems.length > 0 ? (
              <button onClick={clearCart} className="text-sm font-semibold text-red-500 transition hover:text-red-600">
                Clear Cart
              </button>
            ) : null}
          </div>

          {isLoading && cartItems.length === 0 ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-[28px] bg-mithai-100" />
              ))}
            </div>
          ) : (
            cartItems.map((item) => {
              const price = effectivePrice(item.product);
              return (
                <div key={item.cartProductId} className="flex flex-col gap-4 rounded-[28px] border border-mithai-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                  <img src={item.product.imageUrl ?? FALLBACK_IMAGE} alt={item.product.name} className="h-28 w-full rounded-2xl object-cover sm:w-28" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <VegBadge veg={item.product.veg} />
                          <h2 className="text-lg font-semibold text-maroon-900">{item.product.name}</h2>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm text-stone-500">{item.product.description}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.productId)}
                        className="rounded-full p-2 text-stone-400 transition hover:bg-mithai-50 hover:text-red-500"
                        aria-label={`Remove ${item.product.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center rounded-full border border-mithai-200">
                        <button
                          onClick={() => updateQuantity(item.product.productId, item.quantity - 1)}
                          className="rounded-full p-2 transition hover:bg-mithai-50"
                          aria-label={`Decrease ${item.product.name}`}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.productId, item.quantity + 1)}
                          className="rounded-full p-2 transition hover:bg-mithai-50"
                          aria-label={`Increase ${item.product.name}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-stone-500">Unit price</p>
                        <p className="font-semibold text-maroon-900">{formatCurrency(price)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="h-fit rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-maroon-900">Order Summary</h2>
          <div className="mt-6 space-y-3 text-sm text-stone-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="inline-flex items-center gap-1"><Truck size={14} /> Delivery</span>
              <span>{deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}</span>
            </div>
          </div>

          {deliveryFee > 0 ? (
            <p className="mt-3 rounded-xl bg-mithai-50 p-3 text-xs text-maroon-700">
              Add {formatCurrency(499 - subtotal)} more to unlock free delivery.
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-between border-t border-mithai-200 pt-4">
            <span className="text-lg font-semibold text-maroon-900">Grand total</span>
            <span className="text-lg font-semibold text-maroon-700">{formatCurrency(grandTotal)}</span>
          </div>
          <div className="mt-6 space-y-3">
            <PrimaryButton fullWidth onClick={() => navigate("/checkout")} disabled={cartItems.length === 0}>
              Checkout
            </PrimaryButton>
            <Link to="/catalog">
              <SecondaryButton fullWidth>Continue Shopping</SecondaryButton>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
