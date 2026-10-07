import { ArrowRight, Clock3, Store, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "../components/home/Hero";
import Categories from "../components/home/Categories";
import SectionHeading from "../shared/components/SectionHeading";
import ProductCard from "../shared/components/ProductCard";
import ProductCardSkeleton from "../shared/components/ProductCardSkeleton";
import { useProducts } from "../hooks/useProducts";
import { isV1Product } from "../utils/catalogue";
import EmptyState from "../components/ui/EmptyState";

export default function Home() {
  const { products, isLoading, error } = useProducts({});
  const shopProducts = products.filter(isV1Product);
  const featured = shopProducts.filter((product) => product.available && product.bestSeller).slice(0, 4);
  const popular = shopProducts.filter((product) => product.available && !featured.includes(product) && product.bestSeller).slice(0, 4);
  const firstAvailable = shopProducts.filter((product) => product.available).slice(0, 4);
  const firstSection = featured.length ? featured : firstAvailable;

  const ProductGrid = ({ items }: { items: typeof shopProducts }) => (
    <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
      {items.map((product) => <ProductCard key={product.productId} product={product} />)}
    </div>
  );

  const LoadingGrid = () => <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <ProductCardSkeleton key={item} />)}</div>;

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8" aria-labelledby="featured-heading">
        <SectionHeading title="A few house favourites" subtitle="A good place to start. Find the one you love." action={<Link to="/catalog" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-maroon-700">Full menu <ArrowRight size={16} /></Link>} />
        {error ? <EmptyState title="The menu is taking a moment" description="We could not reach the shop right now. Please refresh this page or try again shortly." action={<Link to="/catalog" className="font-semibold text-maroon-700">Open the full menu</Link>} /> : isLoading ? <LoadingGrid /> : firstSection.length ? <ProductGrid items={firstSection} /> : <EmptyState title="Fresh batches are on their way" description="There are no available products to show right now. Please check back soon." action={<Link to="/catalog" className="font-semibold text-maroon-700">Browse the menu</Link>} />}
      </section>

      <Categories />

      {popular.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8" aria-labelledby="popular-heading">
          <SectionHeading title="More to savour" subtitle="Customer favourites from the shop catalogue." action={<Link to="/catalog?bestSellerOnly=true" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-maroon-700">See favourites <ArrowRight size={16} /></Link>} />
          <ProductGrid items={popular} />
        </section>
      ) : null}

      <section className="border-y border-mithai-200 bg-[#F7E7CE]/55" aria-label="Delivery and pickup information">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-8 sm:grid-cols-3 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4"><Truck className="mt-0.5 shrink-0 text-maroon-700" size={20} /><div><h2 className="font-semibold text-darkbrown">Delivery in 20 km</h2><p className="mt-1 text-sm text-stone-600">Availability is checked against your pinned address at checkout.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4"><Store className="mt-0.5 shrink-0 text-maroon-700" size={20} /><div><h2 className="font-semibold text-darkbrown">Pick up at the shop</h2><p className="mt-1 text-sm text-stone-600">Choose store pickup when you place your order.</p></div></div>
          <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4"><Clock3 className="mt-0.5 shrink-0 text-maroon-700" size={20} /><div><h2 className="font-semibold text-darkbrown">Choose a time</h2><p className="mt-1 text-sm text-stone-600">Select your requested delivery or pickup time at checkout.</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#3D2B1F] p-6 text-white sm:flex-row sm:items-center sm:p-9">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#E0B084]">Your next favourite is here</p><h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">Take a little sweetness home.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#F7E7CE]/80">Browse fresh sweets, savoury namkeen and traditional beverages.</p></div>
          <Link to="/catalog" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-[#C68642] px-5 py-3 font-semibold text-[#271a12] hover:bg-[#E0B084]">Start ordering <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  );
}
