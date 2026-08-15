import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as categoriesApi from "../../services/api/categories";
import type { Category } from "../../types/Category";

const EMOJI_BY_CATEGORY: Record<string, string> = {
  "Mithai": "🍬",
  "Bengali Sweets": "🍮",
  "Cakes": "🍰",
  "Pastries": "🥐",
  "Namkeen": "🥨",
  "Chocolates": "🍫",
  "Dry Fruits": "🌰",
  "Beverages": "🥤",
  "Combos & Gift Boxes": "🎁",
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .getCategories()
      .then((data) => {
        if (!cancelled) setCategories([...data].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)));
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-3xl font-bold text-maroon-900">Shop by Category</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-mithai-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.categoryId}
              to={`/catalog?categoryId=${category.categoryId}`}
              className="cursor-pointer rounded-xl border border-mithai-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-lg"
            >
              {category.imageUrl ? (
                <img src={category.imageUrl} alt={category.name} className="mx-auto h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="mx-auto text-4xl">{EMOJI_BY_CATEGORY[category.name] ?? "🍭"}</div>
              )}
              <p className="mt-4 font-semibold text-maroon-900">{category.name}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
