import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Leaf, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../shared/components/ProductCard";
import ProductCardSkeleton from "../shared/components/ProductCardSkeleton";
import { useProducts } from "../hooks/useProducts";
import { usePagination } from "../hooks/usePagination";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { appConfig } from "../config/app";
import { shopCategoryForProduct, type ShopCategory } from "../utils/catalogue";
import EmptyState from "../components/ui/EmptyState";

const CATEGORIES: Array<ShopCategory | "All"> = ["All", "Sweet", "Namkeen", "Beverages"];
type SortOption = "" | "priceLowToHigh" | "priceHighToLow" | "rating" | "newest";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebouncedValue(searchText, 250);
  const category = searchParams.get("category") ?? "All";
  const vegOnly = searchParams.get("vegOnly") === "true";
  const bestSellerOnly = searchParams.get("bestSellerOnly") === "true";
  const newArrivalsOnly = searchParams.get("newArrivalsOnly") === "true";
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = (searchParams.get("sortBy") ?? "") as SortOption;
  const { products: allProducts, isLoading, error } = useProducts({});

  useEffect(() => {
    if ((searchParams.get("search") ?? "") === debouncedSearch) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const visibleProducts = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = allProducts.filter((product) => {
      const productCategory = shopCategoryForProduct(product);
      if (!productCategory) return false;
      if (category !== "All" && productCategory !== category) return false;
      if (query && !`${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query)) return false;
      if (vegOnly && !product.veg) return false;
      if (bestSellerOnly && !product.bestSeller) return false;
      if (newArrivalsOnly && !product.newArrival) return false;
      if (maxPrice && (product.discountedPrice ?? product.price) > Number(maxPrice)) return false;
      return true;
    });
    if (sortBy === "priceLowToHigh") filtered.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price));
    if (sortBy === "priceHighToLow") filtered.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price));
    if (sortBy === "rating") filtered.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    if (sortBy === "newest") filtered.sort((a, b) => b.productId - a.productId);
    return filtered;
  }, [allProducts, category, debouncedSearch, vegOnly, bestSellerOnly, newArrivalsOnly, maxPrice, sortBy]);

  const { currentPage, pagedItems, totalPages, goToPage } = usePagination(visibleProducts, appConfig.paginationLimit);
  useEffect(() => { goToPage(1); }, [category, debouncedSearch, vegOnly, bestSellerOnly, newArrivalsOnly, maxPrice, sortBy]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("categoryId");
    setSearchParams(next, { replace: true });
  };
  const selectCategory = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete("categoryId");
    if (value === "All") next.delete("category");
    else next.set("category", value);
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => { setSearchText(""); setSearchParams(new URLSearchParams(), { replace: true }); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-maroon-700">Fresh from our kitchen</p>
        <h1 className="font-serif text-3xl font-semibold text-darkbrown sm:text-4xl">Shop the menu</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">Browse sweets, namkeen and traditional beverages. Choose your pack, check availability and add it straight to your bag.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="tablist" aria-label="Product categories">
        {CATEGORIES.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} onClick={() => selectCategory(item)} className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors sm:px-5 ${category === item ? "bg-maroon-700 text-white" : "border border-mithai-300 bg-white text-darkbrown hover:bg-mithai-100"}`}>{item === "All" ? "All products" : item}</button>)}
      </div>

      <section className="mb-5 rounded-3xl border border-mithai-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Menu filters">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <label><span className="mb-1.5 block text-sm font-semibold text-darkbrown">Find a favourite</span><span className="relative block"><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Try kaju katli or masala chai" className="min-h-12 w-full rounded-2xl border border-mithai-200 bg-cream-50 pl-11 pr-4 text-base outline-none focus:border-maroon-600 focus:bg-white" /></span></label>
          <label className="sm:min-w-52"><span className="mb-1.5 block text-sm font-semibold text-darkbrown">Sort by</span><select value={sortBy} onChange={(event) => updateParam("sortBy", event.target.value || null)} className="min-h-12 w-full rounded-2xl border border-mithai-200 bg-cream-50 px-3 text-sm outline-none focus:border-maroon-600"><option value="">Recommended</option><option value="priceLowToHigh">Price: low to high</option><option value="priceHighToLow">Price: high to low</option><option value="rating">Top rated</option><option value="newest">Newest</option></select></label>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-mithai-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex min-h-11 items-center gap-3 rounded-xl bg-cream-50 px-3 text-sm font-medium text-stone-700"><input type="checkbox" checked={vegOnly} onChange={(event) => updateParam("vegOnly", event.target.checked ? "true" : null)} className="h-5 w-5 accent-maroon-700" /><Leaf size={16} className="text-emerald-700" /> Pure veg</label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl bg-cream-50 px-3 text-sm font-medium text-stone-700"><input type="checkbox" checked={bestSellerOnly} onChange={(event) => updateParam("bestSellerOnly", event.target.checked ? "true" : null)} className="h-5 w-5 accent-maroon-700" /> Shop favourites</label>
          <label className="flex min-h-11 items-center gap-3 rounded-xl bg-cream-50 px-3 text-sm font-medium text-stone-700"><input type="checkbox" checked={newArrivalsOnly} onChange={(event) => updateParam("newArrivalsOnly", event.target.checked ? "true" : null)} className="h-5 w-5 accent-maroon-700" /> New arrivals</label>
          <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-cream-50 px-3 text-sm font-medium text-stone-700 sm:min-w-64"><span className="shrink-0">Up to ₹{maxPrice ?? "2000"}</span><input aria-label="Maximum price" type="range" min="100" max="2000" step="50" value={maxPrice ?? "2000"} onChange={(event) => updateParam("maxPrice", event.target.value)} className="w-full accent-maroon-700" /></label>
          <button type="button" onClick={clearFilters} className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl px-3 text-sm font-semibold text-maroon-700 hover:bg-mithai-50 sm:ml-auto sm:self-auto"><RotateCcw size={16} /> Clear filters</button>
        </div>
      </section>

      <div className="mb-5 flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-mithai-100/70 px-4 py-2 text-sm text-stone-700">
        <span className="inline-flex items-center gap-2"><SlidersHorizontal size={16} />{isLoading ? "Loading the menu…" : `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`}</span>
        {category !== "All" ? <span className="rounded-full bg-white px-3 py-1 font-semibold text-darkbrown">{category}</span> : null}
      </div>

      {error ? (
        <EmptyState icon={<AlertCircle size={34} />} title="We couldn't load the menu" description="The shop catalogue could not be reached. Check your connection and try refreshing." action={<button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-maroon-700 px-5 font-semibold text-white">Try again</button>} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <ProductCardSkeleton key={item} />)}</div>
      ) : visibleProducts.length === 0 ? (
        <EmptyState title="No matching treats" description="Try another search or loosen your filters. There is plenty more to discover in the menu." action={<button type="button" onClick={clearFilters} className="min-h-11 rounded-xl bg-maroon-700 px-5 font-semibold text-white">Show the full menu</button>} />
      ) : (
        <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-3">{pagedItems.map((product) => <ProductCard key={product.productId} product={product} />)}</div>
      )}

      {!isLoading && !error && visibleProducts.length > appConfig.paginationLimit ? <nav aria-label="Product pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button key={page} type="button" aria-current={currentPage === page ? "page" : undefined} onClick={() => goToPage(page)} className={`min-h-11 min-w-11 rounded-xl border px-3 text-sm font-semibold ${currentPage === page ? "border-maroon-700 bg-maroon-700 text-white" : "border-mithai-200 bg-white text-stone-700 hover:bg-mithai-50"}`}>{page}</button>)}</nav> : null}
      <div className="mt-8 text-center"><Link to="/" className="text-sm font-semibold text-maroon-700 hover:text-maroon-800">Back to Mithai Junction</Link></div>
    </div>
  );
}
