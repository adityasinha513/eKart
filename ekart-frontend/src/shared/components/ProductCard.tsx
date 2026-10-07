import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import type { Product } from "../../types/Product";
import { effectivePrice } from "../../types/Product";
import { formatCurrency } from "../../utils/helpers";
import { shopCategoryForProduct } from "../../utils/catalogue";
import ProductImage from "./ProductImage";

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);
  const price = effectivePrice(product);
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const available = product.available && product.availableQuantity > 0;
  const unit = product.unit === "GRAM" ? "g" : product.unit === "KG" ? "kg" : product.unit === "BOX" ? "box" : "pc";
  const category = shopCategoryForProduct(product);

  const handleAddToCart = async () => {
    if (!available || adding) return;
    setAdding(true);
    const ok = await addToCart(product, 1);
    if (ok) toast.success(`${product.name} added to your cart.`);
    setAdding(false);
  };

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-mithai-200 bg-white shadow-[0_8px_28px_rgba(61,43,31,0.07)] transition-shadow hover:shadow-[0_14px_34px_rgba(61,43,31,0.13)]">
      <div className="relative overflow-hidden bg-mithai-100">
        <Link to={`/product/${product.productId}`} aria-label={`View ${product.name}`} className="block aspect-[4/3] w-full">
          <ProductImage product={product} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
        </Link>
        {hasDiscount ? <span className="absolute left-3 top-3 rounded-full bg-cream-50 px-3 py-1 text-xs font-bold text-maroon-800 shadow-sm">{Math.round(product.discountPercent ?? 0)}% off</span> : null}
        {product.bestSeller ? <span className="absolute bottom-3 left-3 rounded-full bg-darkbrown/90 px-3 py-1 text-xs font-semibold text-white">Shop favourite</span> : null}
        <button
          type="button"
          onClick={() => toggleWishlist(product.productId)}
          className={`absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-sm transition-colors hover:text-maroon-700 ${isAuthenticated && isWishlisted(product.productId) ? "text-rose-600" : "text-stone-600"}`}
          aria-label={isAuthenticated && isWishlisted(product.productId) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={18} fill={isAuthenticated && isWishlisted(product.productId) ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-h-6 items-center justify-between gap-2 text-xs font-medium text-stone-500">
          <span>{category ?? product.category}</span>
          <span className={`rounded-full px-2.5 py-1 ${product.available ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
            {available ? "In stock" : "Unavailable"}
          </span>
        </div>

        <Link to={`/product/${product.productId}`} className="mt-3 block text-darkbrown hover:text-maroon-700">
          <h3 className="line-clamp-2 min-h-12 text-[1.05rem] font-semibold leading-6">{product.name}</h3>
        </Link>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-xl font-bold text-darkbrown">{formatCurrency(price)}</span>
          {hasDiscount ? <span className="text-sm text-stone-400 line-through">{formatCurrency(product.price)}</span> : null}
          <span className="text-sm text-stone-500">{product.unitQuantity ? `${product.unitQuantity} ${unit}` : unit}</span>
        </div>

        <button
          type="button"
          onClick={() => void handleAddToCart()}
          disabled={!available || adding}
          className="mt-auto flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-maroon-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-maroon-800 disabled:bg-stone-300 disabled:text-stone-600"
        >
          <ShoppingBag size={17} />
          {adding ? "Adding…" : available ? "Add to cart" : "Currently unavailable"}
        </button>
      </div>
    </article>
  );
}
