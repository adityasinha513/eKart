import { Heart, Leaf, Minus, Plus, ShieldAlert, ShieldCheck, Store, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../shared/components/ProductCard";
import ProductImage from "../shared/components/ProductImage";
import * as productsApi from "../services/api/products";
import type { Product } from "../types/Product";
import { effectivePrice } from "../types/Product";
import { formatCurrency } from "../utils/helpers";
import { shopCategoryForProduct } from "../utils/catalogue";

function unitLabel(product: Product) {
  if (!product.unitQuantity) return null;
  const unit = product.unit === "GRAM" ? "g" : product.unit === "KG" ? "kg" : product.unit === "BOX" ? "box" : "pc";
  return `${product.unitQuantity} ${unit}`;
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
  const [loadError, setLoadError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setIsLoading(true);
    setLoadError(false);
    setProduct(null);
    setRelated([]);
    setQuantity(1);

    productsApi.getProductById(Number(id))
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setIsLoading(false);
        void productsApi.getProducts({})
          .then((items) => {
            if (active) setRelated(items.filter((item) => item.productId !== data.productId && shopCategoryForProduct(item) === shopCategoryForProduct(data) && item.available).slice(0, 4));
          })
          .catch(() => { if (active) setRelated([]); });
      })
      .catch(() => { if (active) { setLoadError(true); setIsLoading(false); } });

    return () => { active = false; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || !product.available || product.availableQuantity <= 0) return;
    const ok = await addToCart(product, quantity);
    if (ok) toast.success(`${product.name} added to your cart.`);
  };

  const handleBuyNow = async () => {
    if (!product || !product.available || product.availableQuantity <= 0) return;
    if (!isAuthenticated) {
      toast.error("Sign in to continue to checkout.");
      navigate("/login");
      return;
    }
    const ok = await addToCart(product, quantity);
    if (ok) navigate("/checkout");
  };

  if (isLoading) return <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:px-8"><div className="aspect-[4/3] animate-pulse rounded-3xl bg-mithai-100" /><div className="h-[28rem] animate-pulse rounded-3xl bg-mithai-100" /></div>;

  if (loadError || !product) return <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6"><div className="rounded-3xl border border-mithai-200 bg-white p-8 shadow-sm"><h1 className="font-serif text-2xl font-semibold text-darkbrown">This product isn’t available</h1><p className="mt-3 text-sm text-stone-600">We couldn’t open this item. Please return to the menu and choose another.</p><Link to="/catalog" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-maroon-700 px-5 font-semibold text-white">Back to the menu</Link></div></div>;

  const available = product.available && product.availableQuantity > 0;
  const price = effectivePrice(product);
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.price;
  const category = shopCategoryForProduct(product) ?? product.category;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-stone-500"><Link to="/catalog" className="font-medium text-maroon-700 hover:underline">Menu</Link><span className="mx-2">/</span><span>{category}</span><span className="mx-2">/</span><span className="text-darkbrown">{product.name}</span></nav>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[1fr_0.9fr] lg:gap-8">
        <div className="overflow-hidden rounded-3xl border border-mithai-200 bg-mithai-100 p-2 shadow-sm sm:p-3">
          <ProductImage product={product} width={1000} eager className="aspect-[4/3] w-full rounded-[1.35rem] object-cover lg:aspect-[4/3]" />
        </div>

        <section className="min-w-0 rounded-3xl border border-mithai-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8" aria-labelledby="product-title">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-mithai-100 px-3 py-1.5 text-sm font-semibold text-darkbrown">{category}</span>
            <button type="button" onClick={() => toggleWishlist(product.productId)} aria-label={isAuthenticated && isWishlisted(product.productId) ? "Remove from wishlist" : "Add to wishlist"} className={`flex h-11 w-11 items-center justify-center rounded-full border border-mithai-200 transition hover:bg-mithai-50 ${isAuthenticated && isWishlisted(product.productId) ? "text-rose-600" : "text-stone-600"}`}><Heart size={19} fill={isAuthenticated && isWishlisted(product.productId) ? "currentColor" : "none"} /></button>
          </div>

          <h1 id="product-title" className="mt-4 font-serif text-3xl font-semibold leading-tight text-darkbrown sm:text-4xl">{product.name}</h1>
          <p className="mt-3 text-base leading-7 text-stone-600">{product.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className={`rounded-full px-3 py-1.5 font-semibold ${available ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>{available ? "Available" : "Currently unavailable"}</span>
            {unitLabel(product) ? <span className="rounded-full bg-cream-100 px-3 py-1.5 font-medium text-stone-700">Pack of {unitLabel(product)}</span> : null}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-mithai-100 pb-5">
            <span className="text-3xl font-bold text-darkbrown">{formatCurrency(price)}</span>
            {hasDiscount ? <><span className="text-lg text-stone-400 line-through">{formatCurrency(product.price)}</span><span className="rounded-full bg-mithai-100 px-2.5 py-1 text-xs font-bold text-maroon-800">Save {Math.round(product.discountPercent ?? 0)}%</span></> : null}
            <span className="w-full text-sm text-stone-500">{product.unit === "GRAM" ? "Price for" : "Price per"} {unitLabel(product) ?? "pack"}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-xl border border-mithai-300" aria-label="Select quantity">
              <button type="button" disabled={!available || quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="flex h-11 w-11 items-center justify-center rounded-l-xl hover:bg-mithai-50 disabled:opacity-40" aria-label="Decrease quantity"><Minus size={16} /></button>
              <span className="min-w-10 text-center font-semibold tabular-nums" aria-live="polite">{quantity}</span>
              <button type="button" disabled={!available || quantity >= product.availableQuantity} onClick={() => setQuantity((current) => Math.min(product.availableQuantity, current + 1))} className="flex h-11 w-11 items-center justify-center rounded-r-xl hover:bg-mithai-50 disabled:opacity-40" aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
            <p className="text-sm text-stone-500">{available ? `${product.availableQuantity} pack${product.availableQuantity === 1 ? "" : "s"} available` : "This item is temporarily unavailable."}</p>
          </div>
          <div className="mt-4 grid gap-3 min-[420px]:grid-cols-2">
            <button type="button" onClick={() => void handleAddToCart()} disabled={!available} className="min-h-12 rounded-2xl bg-maroon-700 px-5 py-3 font-semibold text-white hover:bg-maroon-800 disabled:bg-stone-300">Add to cart</button>
            <button type="button" onClick={() => void handleBuyNow()} disabled={!available} className="min-h-12 rounded-2xl border border-maroon-700 px-5 py-3 font-semibold text-maroon-800 hover:bg-mithai-50 disabled:border-stone-300 disabled:text-stone-400">Buy now</button>
          </div>

          <dl className="mt-6 grid gap-3 rounded-2xl bg-cream-50 p-4 text-sm sm:grid-cols-2">
            {product.ingredients ? <div><dt className="font-semibold text-darkbrown">Ingredients</dt><dd className="mt-1 leading-6 text-stone-600">{product.ingredients}</dd></div> : null}
            {product.allergens ? <div className="flex items-start gap-2"><ShieldAlert size={17} className="mt-0.5 shrink-0 text-maroon-700" /><div><dt className="font-semibold text-darkbrown">Allergens</dt><dd className="mt-1 leading-6 text-stone-600">{product.allergens}</dd></div></div> : null}
            {product.shelfLifeDays ? <div><dt className="font-semibold text-darkbrown">Shelf life</dt><dd className="mt-1 text-stone-600">{product.shelfLifeDays} days from preparation</dd></div> : null}
            <div className="flex items-start gap-2"><Leaf size={17} className="mt-0.5 shrink-0 text-emerald-700" /><div><dt className="font-semibold text-darkbrown">Diet</dt><dd className="mt-1 text-stone-600">{product.veg ? "Vegetarian" : "Non-vegetarian ingredients"}</dd></div></div>
          </dl>
          <div className="mt-4 flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:gap-5"><span className="inline-flex items-center gap-2"><Truck size={16} className="text-maroon-700" /> Delivery within 20 km</span><span className="inline-flex items-center gap-2"><Store size={16} className="text-maroon-700" /> Store pickup available</span></div>
        </section>
      </div>

      <section className="mt-8 rounded-3xl border border-mithai-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="reviews-heading"><div className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 text-maroon-700" /><div><h2 id="reviews-heading" className="text-lg font-semibold text-darkbrown">Customer reviews</h2><p className="mt-1 text-sm text-stone-600">Reviews aren’t available yet. We’ll show verified customer feedback here when it’s supported.</p></div></div></section>

      {related.length ? <section className="mt-9" aria-labelledby="related-heading"><h2 id="related-heading" className="mb-5 font-serif text-2xl font-semibold text-darkbrown">More from {category}</h2><div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">{related.map((item) => <ProductCard key={item.productId} product={item} />)}</div></section> : null}
    </div>
  );
}
