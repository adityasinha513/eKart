import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-maroon-800 via-maroon-700 to-mithai-700 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between px-6 py-20 lg:flex-row">
        <div className="max-w-2xl">
          <p className="mb-3 text-lg font-medium text-mithai-200">Welcome to Mithai Junction</p>

          <h1 className="text-5xl font-extrabold leading-tight lg:text-6xl">
            Sweetness,
            <br />
            Delivered Fresh.
          </h1>

          <p className="mt-6 text-lg leading-8 text-mithai-100">
            Handcrafted mithai, Bengali sweets, namkeen, and gift boxes made fresh daily and delivered straight
            to your door.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/catalog" className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-maroon-800 transition hover:scale-105">
              Order Now
              <ArrowRight size={18} />
            </Link>

            <Link to="/catalog?bestSellerOnly=true" className="rounded-lg border border-white px-6 py-3 transition hover:bg-white hover:text-maroon-800">
              Best Sellers
            </Link>
          </div>
        </div>

        <div className="mt-14 hidden lg:block">
          <div className="rounded-3xl bg-white/10 p-10 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-xl bg-white p-6 text-center text-maroon-800 shadow-lg">
                <div className="text-4xl">🍬</div>
                <p className="mt-3 font-semibold">Mithai</p>
              </div>
              <div className="rounded-xl bg-white p-6 text-center text-maroon-800 shadow-lg">
                <div className="text-4xl">🍰</div>
                <p className="mt-3 font-semibold">Cakes</p>
              </div>
              <div className="rounded-xl bg-white p-6 text-center text-maroon-800 shadow-lg">
                <div className="text-4xl">🥟</div>
                <p className="mt-3 font-semibold">Namkeen</p>
              </div>
              <div className="rounded-xl bg-white p-6 text-center text-maroon-800 shadow-lg">
                <div className="text-4xl">🎁</div>
                <p className="mt-3 font-semibold">Gift Boxes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
