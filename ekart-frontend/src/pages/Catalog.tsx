import { useEffect, useMemo, useState } from "react";
import { Filter, Leaf, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../shared/components/ProductCard";
import ProductCardSkeleton from "../shared/components/ProductCardSkeleton";
import SectionHeading from "../shared/components/SectionHeading";
import { useProducts } from "../hooks/useProducts";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { usePagination } from "../hooks/usePagination";
import { appConfig } from "../config/app";
import * as categoriesApi from "../services/api/categories";
import type { Category } from "../types/Category";
import type { ProductQuery } from "../services/api/products";

type SortOption = NonNullable<ProductQuery["sortBy"]> | "";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);

  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");
  const debouncedSearch = useDebouncedValue(searchText, 300);

  const categoryId = searchParams.get("categoryId");
  const categoryName = searchParams.get("category");
  const vegOnly = searchParams.get("vegOnly") === "true";
  const bestSellerOnly = searchParams.get("bestSellerOnly") === "true";
  const newArrivalsOnly = searchParams.get("newArrivalsOnly") === "true";
  const maxPrice = searchParams.get("maxPrice");
  const sortBy = (searchParams.get("sortBy") as SortOption) ?? "";

  useEffect(() => {
    categoriesApi.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Keep the URL in sync with the debounced search box without fighting the user's typing.
  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch === current) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const resolvedCategoryId = useMemo(() => {
    if (categoryId) return Number(categoryId);
    if (categoryName && categories.length) {
      return categories.find((c) => c.name === categoryName)?.categoryId;
    }
    return undefined;
  }, [categoryId, categoryName, categories]);

  const query: ProductQuery = useMemo(
    () => ({
      categoryId: resolvedCategoryId,
      search: debouncedSearch || undefined,
      vegOnly: vegOnly || undefined,
      bestSellerOnly: bestSellerOnly || undefined,
      newArrivalsOnly: newArrivalsOnly || undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy || undefined,
    }),
    [resolvedCategoryId, debouncedSearch, vegOnly, bestSellerOnly, newArrivalsOnly, maxPrice, sortBy]
  );

  const { products, isLoading, error } = useProducts(query);
  const { currentPage, pagedItems, totalPages, goToPage } = usePagination(products, appConfig.paginationLimit);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "categoryId") next.delete("category");
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchText("");
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeading title="Shop the full menu" subtitle="Fresh mithai, snacks, cakes, and gift boxes made daily" />

      <div className="mb-8 rounded-[32px] border border-mithai-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="flex-1">
            <span className="mb-2 block text-sm font-medium text-stone-700">Search</span>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="w-full rounded-2xl border border-mithai-200 bg-cream-50 py-3 pl-11 pr-4 outline-none transition focus:border-maroon-400 focus:bg-white"
                placeholder="Search for kaju katli, rasgulla, namkeen..."
              />
            </div>
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="min-w-[200px]">
              <span className="mb-2 block text-sm font-medium text-stone-700">Category</span>
              <select
                value={categoryId ?? ""}
                onChange={(event) => updateParam("categoryId", event.target.value || null)}
                className="w-full rounded-2xl border border-mithai-200 bg-cream-50 px-3 py-3 outline-none"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="min-w-[180px]">
              <span className="mb-2 block text-sm font-medium text-stone-700">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => updateParam("sortBy", event.target.value || null)}
                className="w-full rounded-2xl border border-mithai-200 bg-cream-50 px-3 py-3 outline-none"
              >
                <option value="">Recommended</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex items-center gap-2 rounded-2xl border border-mithai-200 bg-cream-50 px-4 py-3">
            <input type="checkbox" checked={vegOnly} onChange={(event) => updateParam("vegOnly", event.target.checked ? "true" : null)} className="accent-green-600" />
            <Leaf size={16} className="text-green-600" />
            <span className="text-sm font-medium text-stone-700">Veg only</span>
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-mithai-200 bg-cream-50 px-4 py-3">
            <input type="checkbox" checked={bestSellerOnly} onChange={(event) => updateParam("bestSellerOnly", event.target.checked ? "true" : null)} className="accent-maroon-700" />
            <span className="text-sm font-medium text-stone-700">Best sellers</span>
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-mithai-200 bg-cream-50 px-4 py-3">
            <input type="checkbox" checked={newArrivalsOnly} onChange={(event) => updateParam("newArrivalsOnly", event.target.checked ? "true" : null)} className="accent-maroon-700" />
            <span className="text-sm font-medium text-stone-700">New arrivals</span>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-stone-700">Max price: ₹{maxPrice ?? "1000"}</span>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxPrice ?? "2000"}
              onChange={(event) => updateParam("maxPrice", event.target.value)}
              className="w-full accent-maroon-700"
            />
          </label>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-mithai-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-stone-600">
          <Filter size={16} />
          {isLoading ? "Loading..." : `Showing ${products.length} products`}
        </div>
        <button onClick={clearFilters} className="text-sm font-semibold text-maroon-700">
          Clear filters
        </button>
      </div>

      {error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-10 text-center text-red-700">{error}</div>
      ) : isLoading ? (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[28px] border border-mithai-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-xl font-semibold text-maroon-900">No matching products</h3>
          <p className="mt-2 text-sm text-stone-500">Try a different search term or clear some filters to view more items.</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {pagedItems.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}

      {!isLoading && products.length > 0 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`h-10 w-10 rounded-full border text-sm font-semibold transition ${currentPage === page ? "border-maroon-700 bg-maroon-700 text-white" : "border-mithai-200 bg-white text-stone-700 hover:bg-mithai-50"}`}
            >
              {page}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
