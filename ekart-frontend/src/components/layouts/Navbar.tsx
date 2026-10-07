import { Heart, Menu, Package, Search, ShoppingBag, Store, UserRound, X } from "lucide-react";
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
  const closeMenu = () => setMenuOpen(false);
  const accountUrl = isAuthenticated ? "/profile" : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-mithai-200 bg-[#FFFAF3]/95 shadow-[0_3px_12px_rgba(61,43,31,0.06)] backdrop-blur">
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-darkbrown" aria-label="Mithai Junction home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mithai-100 text-lg" aria-hidden>✦</span>
            <span className="hidden text-lg font-bold tracking-tight min-[380px]:inline sm:text-xl">Mithai Junction</span>
            <span className="text-lg font-bold tracking-tight min-[380px]:hidden">Mithai</span>
          </Link>

          <form onSubmit={runSearch} role="search" className="mx-4 hidden max-w-xl flex-1 md:block">
            <label className="relative block">
              <span className="sr-only">Search the menu</span>
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sweets, namkeen, drinks…" className="min-h-11 w-full rounded-full border border-mithai-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-maroon-600 focus:ring-2 focus:ring-mithai-200" />
            </label>
          </form>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link to={accountUrl} aria-label={isAuthenticated ? `Account for ${user?.name ?? "you"}` : "Sign in or create an account"} className="flex h-11 w-11 items-center justify-center rounded-xl text-darkbrown transition-colors hover:bg-mithai-100 sm:w-auto sm:gap-2 sm:px-3">
              <UserRound size={19} /><span className="hidden max-w-24 truncate text-sm font-semibold sm:inline">{isAuthenticated ? user?.name?.split(" ")[0] ?? "Account" : "Sign in"}</span>
            </Link>
            <Link to="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ""}`} className="relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-xl bg-mithai-100 px-3 text-darkbrown transition-colors hover:bg-mithai-200">
              <ShoppingBag size={19} /><span className="hidden text-sm font-semibold min-[380px]:inline">Cart</span>
              <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold ${cartCount ? "bg-maroon-700 text-white" : "bg-white text-maroon-800"}`}>{cartCount}</span>
            </Link>
            <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl text-darkbrown transition-colors hover:bg-mithai-100 md:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"}>
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        <div className="hidden items-center justify-between border-t border-mithai-100 py-2 md:flex">
          <div className="flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link to="/catalog" className="min-h-9 inline-flex items-center hover:text-maroon-700">Shop</Link>
            <Link to="/catalog?category=Sweet" className="min-h-9 inline-flex items-center hover:text-maroon-700">Sweet</Link>
            <Link to="/catalog?category=Namkeen" className="min-h-9 inline-flex items-center hover:text-maroon-700">Namkeen</Link>
            <Link to="/catalog?category=Beverages" className="min-h-9 inline-flex items-center hover:text-maroon-700">Beverages</Link>
          </div>
          <div className="flex items-center gap-1">
            <Link to="/orders" aria-label="Your orders" className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-mithai-100 hover:text-maroon-700"><Package size={18} /></Link>
            <Link to="/wishlist" aria-label="Your wishlist" className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-600 hover:bg-mithai-100 hover:text-maroon-700"><Heart size={18} /></Link>
            {isAuthenticated ? <button type="button" onClick={logout} className="ml-2 min-h-10 rounded-xl border border-mithai-300 px-3 text-sm font-semibold text-stone-700 hover:bg-white">Sign out</button> : null}
          </div>
        </div>

        {menuOpen ? (
          <div id="mobile-navigation" className="border-t border-mithai-200 py-4 md:hidden">
            <form onSubmit={runSearch} role="search" className="mb-3">
              <label className="relative block"><span className="sr-only">Search the menu</span><Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the menu" className="min-h-12 w-full rounded-2xl border border-mithai-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-maroon-600" /></label>
            </form>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/catalog" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">Shop all</Link>
              <Link to="/catalog?category=Sweet" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">Sweet</Link>
              <Link to="/catalog?category=Namkeen" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">Namkeen</Link>
              <Link to="/catalog?category=Beverages" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">Beverages</Link>
              <Link to="/orders" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">My orders</Link>
              <Link to="/wishlist" onClick={closeMenu} className="min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-sm font-semibold">Wishlist</Link>
              {user?.role === "ADMIN" ? <Link to="/admin" onClick={closeMenu} className="col-span-2 inline-flex min-h-12 items-center gap-2 rounded-xl bg-mithai-100 px-3 py-3 text-sm font-semibold text-darkbrown"><Store size={16} /> Shopkeeper dashboard</Link> : null}
              {isAuthenticated ? <button type="button" onClick={() => { closeMenu(); logout(); }} className="col-span-2 min-h-12 rounded-xl border border-mithai-200 bg-white px-3 py-3 text-left text-sm font-semibold">Sign out</button> : <Link to="/login" onClick={closeMenu} className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-maroon-700 px-3 py-3 text-sm font-semibold text-white"><UserRound size={17} /> Sign in / Create account</Link>}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
