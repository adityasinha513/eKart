import { Heart, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types/Product";
import { effectivePrice } from "../../types/Product";
import { formatCurrency } from "../../utils/helpers";
import VegBadge from "../../components/ui/VegBadge";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const price = effectivePrice(product);
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;

  const handleAddToCart = async () => {
    const ok = await addToCart(product, 1);
    if (ok) toast.success(`${product.name} added to your cart.`);
  };

  return (
    <article className="group overflow-hidden rounded-[28px] border border-mithai-200 bg-white shadow-[0_10px_40px_rgba(120,66,31,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(120,66,31,0.16)]">
      <div className="relative">
        <Link to={`/product/${product.productId}`}>
          <img
            src={product.imageUrl ?? FALLBACK_IMAGE}
            alt={product.name}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>
        {hasDiscount ? (
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-maroon-700">
            {Math.round(product.discountPercent ?? 0)}% off
          </div>
        ) : null}
        {product.bestSeller ? (
          <div className="absolute left-4 bottom-4 rounded-full bg-saffron-500/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Bestseller
          </div>
        ) : null}
        <button
          onClick={() => toggleWishlist(product.productId)}
          className={`absolute right-4 top-4 rounded-full border border-white bg-white/90 p-2 shadow-sm transition hover:text-red-500 ${
            isAuthenticated && isWishlisted(product.productId) ? "text-red-500" : "text-stone-600"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={16} fill={isAuthenticated && isWishlisted(product.productId) ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-stone-500">
          <span className="inline-flex items-center gap-2">
            <VegBadge veg={product.veg} />
            {product.category}
          </span>
          <span>★ {product.avgRating ? product.avgRating.toFixed(1) : "New"}</span>
        </div>

        <Link to={`/product/${product.productId}`}>
          <h3 className="mt-3 line-clamp-2 min-h-[3.2rem] text-lg font-semibold text-maroon-900 transition hover:text-maroon-700">
            {product.name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 text-sm text-stone-500">{product.description}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xl font-semibold text-maroon-800">{formatCurrency(price)}</span>
          {hasDiscount ? <span className="text-sm text-stone-400 line-through">{formatCurrency(product.price)}</span> : null}
          {product.unitQuantity ? (
            <span className="text-sm text-stone-400">
              / {product.unitQuantity}
              {product.unit === "GRAM" ? "g" : product.unit === "KG" ? "kg" : product.unit === "BOX" ? " box" : " pc"}
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-stone-500">
          <span>{product.available ? "In stock" : "Out of stock"}</span>
          {product.newArrival ? <span className="font-medium text-maroon-600">New arrival</span> : null}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.available}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-maroon-700 py-3 font-semibold text-white transition hover:bg-maroon-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          <ShoppingCart size={18} />
          {product.available ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}
