import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import * as categoriesApi from "../../services/api/categories";
import type { Category } from "../../types/Category";
import { shopCategoryForName, type ShopCategory } from "../../utils/catalogue";

const ARTWORK: Record<ShopCategory, string> = {
  Sweet: "/images/products/kaju-katli.jpg",
  Namkeen: "/images/products/navratan-mixture.jpg",
  Beverages: "/images/products/thandai.jpg",
};
const DESCRIPTIONS: Record<ShopCategory, string> = {
  Sweet: "Traditional mithai, made fresh",
  Namkeen: "Crunchy savoury favourites",
  Beverages: "A refreshing sip with every bite",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    categoriesApi.getCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch(() => { if (!cancelled) setHasError(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const available = new Set(categories.map((category) => shopCategoryForName(category.name)).filter((category): category is ShopCategory => category !== null));
  const groups = (["Sweet", "Namkeen", "Beverages"] as const).filter((category) => available.has(category));

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="shop-categories-title">
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-maroon-700">The collection</p>
          <h2 id="shop-categories-title" className="text-2xl font-semibold text-darkbrown sm:text-3xl">Made for every craving</h2>
        </div>
        <Link to="/catalog" className="hidden min-h-11 items-center gap-2 text-sm font-semibold text-maroon-700 hover:text-maroon-800 sm:inline-flex">View all <ArrowRight size={16} /></Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-3xl bg-mithai-100 sm:h-40" />)}</div>
      ) : hasError ? (
        <div className="rounded-2xl border border-mithai-200 bg-white p-5 text-sm text-stone-600">Categories could not be loaded. You can still browse the full menu.</div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-mithai-200 bg-white p-5 text-sm text-stone-600">No categories are available right now.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {groups.map((category) => (
            <Link key={category} to={`/catalog?category=${encodeURIComponent(category)}`} className="group flex min-h-28 items-center gap-4 rounded-3xl border border-mithai-200 bg-white p-4 shadow-sm transition-colors hover:border-maroon-400 hover:bg-cream-50 sm:min-h-40 sm:flex-col sm:items-start sm:justify-between sm:p-5">
              <img src={ARTWORK[category]} alt="" className="h-20 w-24 shrink-0 rounded-2xl bg-mithai-50 object-cover sm:h-24 sm:w-full" loading="lazy" />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:w-full">
                <div><h3 className="text-lg font-semibold text-darkbrown">{category}</h3><p className="mt-1 text-sm text-stone-600">{DESCRIPTIONS[category]}</p></div>
                <ArrowRight size={18} className="shrink-0 text-maroon-700 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
