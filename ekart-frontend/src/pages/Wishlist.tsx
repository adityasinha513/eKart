import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import EmptyState from "../components/ui/EmptyState";
import PrimaryButton from "../components/ui/PrimaryButton";
import VegBadge from "../components/ui/VegBadge";
import SectionHeading from "../shared/components/SectionHeading";
import { formatCurrency } from "../utils/helpers";
import { effectivePrice } from "../types/Product";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80&auto=format&fit=crop";

export default function Wishlist() {
  const { items, isLoading, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading title="Your wishlist" subtitle="Sweets you've saved for later" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[24px] bg-mithai-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} />}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          action={
            <Link to="/catalog">
              <PrimaryButton>Browse products</PrimaryButton>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.wishlistItemId} className="flex items-center gap-4 rounded-[24px] border border-mithai-200 bg-white p-4 shadow-sm">
              <Link to={`/product/${item.product.productId}`}>
                <img src={item.product.imageUrl ?? FALLBACK_IMAGE} alt={item.product.name} className="h-20 w-20 rounded-2xl object-cover" />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <VegBadge veg={item.product.veg} />
                  <Link to={`/product/${item.product.productId}`} className="font-semibold text-maroon-900 hover:text-maroon-700">
                    {item.product.name}
                  </Link>
                </div>
                <p className="mt-1 text-sm font-medium text-maroon-800">{formatCurrency(effectivePrice(item.product))}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const ok = await addToCart(item.product, 1);
                      if (ok) toast.success("Added to cart.");
                    }}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-maroon-700"
                  >
                    <ShoppingCart size={14} /> Add to cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(item.product.productId)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-red-500"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
