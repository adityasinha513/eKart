import { Bell, Heart, MapPin, Menu, Package, Search, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const runSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = search.trim();
    navigate(trimmed ? `/catalog?search=${encodeURIComponent(trimmed)}` : "/catalog");
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-mithai-200 bg-cream-50/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-maroon-700 sm:text-3xl">
            <span aria-hidden>🍬</span> Mithai Junction
          </Link>
          <button className="hidden items-center gap-1.5 rounded-full border border-mithai-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-mithai-50 lg:flex">
            <MapPin size={15} className="text-maroon-600" />
            Deliver to: Home
          </button>
        </div>

        <form onSubmit={runSearch} className="hidden flex-1 px-2 md:block">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for kaju katli, rasgulla, gift boxes..."
              className="w-full rounded-full border border-mithai-200 bg-white py-2.5 pl-11 pr-4 outline-none transition focus:border-maroon-400 focus:ring-2 focus:ring-mithai-100"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/wishlist" className="hidden rounded-full p-2 text-stone-600 transition hover:bg-mithai-50 hover:text-maroon-700 md:block" aria-label="Wishlist">
            <Heart size={20} />
          </Link>

          <Link to="/notifications" className="hidden rounded-full p-2 text-stone-600 transition hover:bg-mithai-50 hover:text-maroon-700 md:block" aria-label="Notifications">
            <Bell size={20} />
          </Link>

          <Link to="/orders" className="hidden rounded-full p-2 text-stone-600 transition hover:bg-mithai-50 hover:text-maroon-700 md:block" aria-label="Orders">
            <Package size={20} />
          </Link>

          <Link to="/cart" className="relative rounded-full p-2 text-stone-600 transition hover:bg-mithai-50 hover:text-maroon-700" aria-label="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-saffron-500 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link to="/profile" className="text-sm font-medium text-stone-700 hover:text-maroon-700">
                Hi, {user?.name?.split(" ")[0]}
              </Link>
              <button onClick={logout} className="rounded-lg border border-mithai-200 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-mithai-50">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden items-center gap-2 rounded-lg bg-maroon-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-maroon-800 md:flex">
              <User size={18} />
              Login
            </Link>
          )}

          <button className="rounded-full p-2 text-stone-600 transition hover:bg-mithai-50 md:hidden" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-mithai-200 bg-white px-4 py-4 md:hidden">
          <form onSubmit={runSearch} className="mb-4">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search sweets, snacks, gift boxes..."
                className="w-full rounded-full border border-mithai-200 bg-cream-50 py-2.5 pl-11 pr-4 outline-none"
              />
            </div>
          </form>
          <div className="flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="rounded-lg border border-mithai-200 px-3 py-2 text-sm font-medium text-stone-700">
                  My profile
                </Link>
                <button onClick={logout} className="rounded-lg border border-mithai-200 px-3 py-2 text-left text-sm font-medium text-stone-700">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded-lg bg-maroon-700 px-3 py-2 text-center text-sm font-semibold text-white">
                Login
              </Link>
            )}
            <Link to="/wishlist" className="rounded-lg border border-mithai-200 px-3 py-2 text-sm font-medium text-stone-700" onClick={() => setMenuOpen(false)}>
              Wishlist
            </Link>
            <Link to="/orders" className="rounded-lg border border-mithai-200 px-3 py-2 text-sm font-medium text-stone-700" onClick={() => setMenuOpen(false)}>
              My orders
            </Link>
            <Link to="/cart" className="rounded-lg border border-mithai-200 px-3 py-2 text-sm font-medium text-stone-700" onClick={() => setMenuOpen(false)}>
              View Cart
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
