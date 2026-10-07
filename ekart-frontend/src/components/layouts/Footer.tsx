import { Link } from "react-router-dom";
import { MapPin, ShoppingBag } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-[#C68642]/30 bg-[#3D2B1F] text-[#F7E7CE]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-9 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8 lg:py-12">
        <div>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-xl font-bold text-white"><span aria-hidden>✦</span> Mithai Junction</Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#F7E7CE]/75">Indian sweets, crunchy namkeen and traditional beverages, made to be shared.</p>
          <p className="mt-4 inline-flex items-start gap-2 text-sm text-[#F7E7CE]/85"><MapPin size={16} className="mt-0.5 shrink-0 text-[#E0B084]" />Store pickup and delivery within 20 km</p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#E0B084]">Explore</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link to="/catalog" className="inline-flex min-h-10 items-center hover:text-white">Full menu</Link></li>
            <li><Link to="/catalog?category=Sweet" className="inline-flex min-h-10 items-center hover:text-white">Sweet</Link></li>
            <li><Link to="/catalog?category=Namkeen" className="inline-flex min-h-10 items-center hover:text-white">Namkeen</Link></li>
            <li><Link to="/catalog?category=Beverages" className="inline-flex min-h-10 items-center hover:text-white">Beverages</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#E0B084]">Your account</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li><Link to="/login" className="inline-flex min-h-10 items-center gap-2 hover:text-white"><ShoppingBag size={15} />Sign in or create an account</Link></li>
            <li><Link to="/orders" className="inline-flex min-h-10 items-center hover:text-white">Track an order</Link></li>
            <li><Link to="/wishlist" className="inline-flex min-h-10 items-center hover:text-white">Wishlist</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#E0B084]">© {new Date().getFullYear()} Mithai Junction</div>
    </footer>
  );
}
