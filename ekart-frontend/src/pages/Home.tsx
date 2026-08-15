import { ArrowRight, Sparkles, Tag, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import SectionHeading from "../shared/components/SectionHeading";
import ProductCard from "../shared/components/ProductCard";
import ProductCardSkeleton from "../shared/components/ProductCardSkeleton";
import { useProducts } from "../hooks/useProducts";

function ProductRow({
  isLoading,
  error,
  products,
}: {
  isLoading: boolean;
  error: string | null;
  products: ReturnType<typeof useProducts>["products"];
}) {
  if (isLoading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-2xl border border-mithai-200 bg-white p-6 text-sm text-stone-500">{error}</p>;
  }

  if (products.length === 0) {
    return <p className="rounded-2xl border border-mithai-200 bg-white p-6 text-sm text-stone-500">Nothing here yet — check back soon.</p>;
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      {products.slice(0, 8).map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  );
}

export default function Home() {
  const bestSellers = useProducts({ bestSellerOnly: true });
  const newArrivals = useProducts({ newArrivalsOnly: true });
  const combos = useProducts({ search: "" });
  const discounted = useProducts({ sortBy: "newest" });

  const comboProducts = combos.products.filter((p) => p.category === "Combos & Gift Boxes");
  const offerProducts = discounted.products.filter((p) => p.discountedPrice != null);

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <Truck className="text-maroon-700" />
            <h3 className="mt-4 font-semibold text-maroon-900">Fresh, fast delivery</h3>
            <p className="mt-2 text-sm text-stone-500">Made-to-order sweets delivered same day across the city.</p>
          </div>
          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <ShieldCheck className="text-maroon-700" />
            <h3 className="mt-4 font-semibold text-maroon-900">100% pure ingredients</h3>
            <p className="mt-2 text-sm text-stone-500">No preservatives — just ghee, milk, and love, the traditional way.</p>
          </div>
          <div className="rounded-[28px] border border-mithai-200 bg-white p-6 shadow-sm">
            <Tag className="text-maroon-700" />
            <h3 className="mt-4 font-semibold text-maroon-900">Festive offers</h3>
            <p className="mt-2 text-sm text-stone-500">Seasonal discounts on gift boxes and family packs, always fresh.</p>
          </div>
        </div>
      </section>

      <Categories />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="Best sellers"
          subtitle="Loved by mithai lovers across the city"
          action={<Link to="/catalog?bestSellerOnly=true" className="text-sm font-semibold text-maroon-700">View all</Link>}
        />
        <ProductRow {...bestSellers} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          title="Popular combos & gift boxes"
          subtitle="Perfect for festivals, weddings, and celebrations"
          action={<Link to="/catalog?category=Combos%20%26%20Gift%20Boxes" className="text-sm font-semibold text-maroon-700">View all</Link>}
        />
        {combos.isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        ) : comboProducts.length === 0 ? (
          <p className="rounded-2xl border border-mithai-200 bg-white p-6 text-sm text-stone-500">No combos available right now.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {comboProducts.slice(0, 4).map((product) => <ProductCard key={product.productId} product={product} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="New arrivals" subtitle="Freshly launched and ready to impress" action={<Link to="/catalog?newArrivalsOnly=true" className="text-sm font-semibold text-maroon-700">View all</Link>} />
        <ProductRow {...newArrivals} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading title="Deals & offers" subtitle="Instant savings, no coupon needed" />
        {discounted.isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
          </div>
        ) : offerProducts.length === 0 ? (
          <div className="rounded-[24px] border border-mithai-200 bg-white p-8 text-center shadow-sm">
            <Sparkles className="mx-auto text-maroon-400" />
            <p className="mt-3 text-sm text-stone-500">No live offers right now — check back during festive season!</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {offerProducts.slice(0, 8).map((product) => <ProductCard key={product.productId} product={product} />)}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-gradient-to-br from-maroon-800 to-mithai-700 p-8 text-center text-white shadow-sm sm:p-12">
          <h3 className="text-2xl font-semibold sm:text-3xl">Craving something sweet?</h3>
          <p className="mx-auto mt-3 max-w-xl text-mithai-100">
            Browse our full range of mithai, Bengali sweets, namkeen, cakes, and gift boxes — freshly made and delivered to your door.
          </p>
          <Link to="/catalog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-maroon-800">
            Explore full menu <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
