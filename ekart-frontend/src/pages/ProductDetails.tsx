import { Heart, Leaf, Minus, Plus, ShieldAlert, ShieldCheck, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../shared/components/ProductCard";
import VegBadge from "../components/ui/VegBadge";
import * as productsApi from "../services/api/products";
import * as reviewsApi from "../services/api/reviews";
import type { Product } from "../types/Product";
import { effectivePrice } from "../types/Product";
import { formatCurrency } from "../utils/helpers";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900&q=80&auto=format&fit=crop";

function unitLabel(product: Product) {
  if (!product.unitQuantity) return null;
  const unit = product.unit === "GRAM" ? "g" : product.unit === "KG" ? "kg" : product.unit === "BOX" ? " box" : " pc";
  return `${product.unitQuantity}${unit}`;
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reviewsState, setReviewsState] = useState<"loading" | "unavailable">("loading");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setNotFound(false);
    setQuantity(1);

    productsApi
      .getProductById(Number(id))
      .then((data) => {
        setProduct(data);
        return productsApi.getProducts({ categoryId: data.categoryId });
      })
      .then((siblings) => setRelated(siblings.filter((item) => item.productId !== Number(id)).slice(0, 4)))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));

    reviewsApi
      .getProductReviews(Number(id))
      .catch(() => setReviewsState("unavailable"));
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const ok = await addToCart(product, quantity);
    if (ok) toast.success(`${product.name} added to your cart.`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to continue.");
      navigate("/login");
      return;
    }
    const ok = await addToCart(product, quantity);
    if (ok) {
      toast.success(`Proceeding to checkout.`);
      navigate("/checkout");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-[420px] animate-pulse rounded-[32px] bg-mithai-100" />
          <div className="h-[420px] animate-pulse rounded-[32px] bg-mithai-100" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-stone-600">Product not found.</div>;
  }

  const price = effectivePrice(product);
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-mithai-200 bg-white p-4 shadow-sm sm:p-6">
          <img src={product.imageUrl ?? FALLBACK_IMAGE} alt={product.name} className="h-[420px] w-full rounded-[24px] object-cover" />
        </div>

        <div className="rounded-[32px] border border-mithai-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full bg-mithai-100 px-3 py-1 text-sm font-semibold text-maroon-700">
              <VegBadge veg={product.veg} /> {product.category}
            </div>
            <button
              onClick={() => toggleWishlist(product.productId)}
              className={`rounded-full border border-mithai-200 p-2 transition hover:text-red-500 ${isAuthenticated && isWishlisted(product.productId) ? "text-red-500" : "text-stone-500"}`}
            >
              <Heart size={18} fill={isAuthenticated && isWishlisted(product.productId) ? "currentColor" : "none"} />
            </button>
          </div>

          <h1 className="mt-5 text-3xl font-semibold text-maroon-900 sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-stone-600">{product.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
              <Star size={16} fill="currentColor" />
              {product.avgRating ? product.avgRating.toFixed(1) : "New"} ({product.ratingCount ?? 0} reviews)
            </div>
            {unitLabel(product) ? <span className="text-sm text-stone-500">Per {unitLabel(product)}</span> : null}
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-3xl font-semibold text-maroon-900">{formatCurrency(price)}</span>
            {hasDiscount ? <span className="text-lg text-stone-400 line-through">{formatCurrency(product.price)}</span> : null}
            {hasDiscount ? (
              <span className="rounded-full bg-mithai-100 px-2 py-1 text-xs font-semibold text-maroon-700">{Math.round(product.discountPercent ?? 0)}% off</span>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl bg-cream-100 p-4 text-sm text-stone-600 sm:grid-cols-2">
            {product.ingredients ? (
              <div>
                <p className="font-semibold text-maroon-900">Ingredients</p>
                <p className="mt-1">{product.ingredients}</p>
              </div>
            ) : null}
            {product.allergens ? (
              <div className="flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-semibold text-maroon-900">Allergens</p>
                  <p className="mt-1">{product.allergens}</p>
                </div>
              </div>
            ) : null}
            {product.shelfLifeDays ? (
              <div>
                <p className="font-semibold text-maroon-900">Shelf life</p>
                <p className="mt-1">{product.shelfLifeDays} days</p>
              </div>
            ) : null}
            <div className="flex items-start gap-2">
              <Leaf size={16} className="mt-0.5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-maroon-900">Diet</p>
                <p className="mt-1">{product.veg ? "Pure vegetarian" : "Contains non-vegetarian ingredients"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-mithai-200">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-full p-3 transition hover:bg-mithai-50" aria-label="Decrease quantity">
                <Minus size={16} />
              </button>
              <span className="min-w-10 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="rounded-full p-3 transition hover:bg-mithai-50" aria-label="Increase quantity">
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.available}
              className="rounded-2xl bg-maroon-700 px-6 py-3 font-semibold text-white transition hover:bg-maroon-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {product.available ? "Add to cart" : "Out of stock"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!product.available}
              className="rounded-2xl border border-mithai-300 px-6 py-3 font-semibold text-maroon-700 transition hover:bg-mithai-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy now
            </button>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-mithai-200 p-4 text-sm text-stone-600 sm:grid-cols-2">
            <div className="flex items-center gap-2"><Truck size={16} className="text-maroon-700" /> Delivered fresh within 24-48 hours</div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-maroon-700" /> Sold by Mithai Junction</div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[32px] border border-mithai-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-maroon-900">Reviews</h2>
        {reviewsState === "unavailable" ? (
          <div className="mt-5 rounded-2xl bg-cream-100 p-6 text-center text-sm text-stone-500">
            Reviews are coming soon. Be the first to share your experience once this feature launches.
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-cream-100 p-6 text-center text-sm text-stone-500">Loading reviews...</div>
        )}
      </div>

      {related.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-maroon-900">You may also like</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.productId} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
