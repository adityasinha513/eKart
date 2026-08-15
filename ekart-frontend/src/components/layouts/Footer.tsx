import { Link } from "react-router-dom";
import { Globe, Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-mithai-200 bg-maroon-900 text-cream-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 text-2xl font-extrabold text-white">
            <span aria-hidden>🍬</span> Mithai Junction
          </div>
          <p className="mt-4 text-sm leading-6 text-mithai-200">
            Handcrafted Indian sweets, savouries, and gift boxes made fresh daily and delivered to your doorstep.
          </p>
          <div className="mt-5 flex gap-3">
            <a href="#" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Facebook"><Share2 size={16} /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Instagram"><Globe size={16} /></a>
            <a href="#" className="rounded-full bg-white/10 p-2 transition hover:bg-white/20" aria-label="Twitter"><MessageCircle size={16} /></a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-mithai-300">Shop</h3>
          <ul className="mt-4 space-y-3 text-sm text-mithai-100">
            <li><Link to="/catalog" className="hover:text-white">All products</Link></li>
            <li><Link to="/catalog?bestSellerOnly=true" className="hover:text-white">Best sellers</Link></li>
            <li><Link to="/catalog?newArrivalsOnly=true" className="hover:text-white">New arrivals</Link></li>
            <li><Link to="/catalog?category=Combos%20%26%20Gift%20Boxes" className="hover:text-white">Gift boxes</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-mithai-300">Account</h3>
          <ul className="mt-4 space-y-3 text-sm text-mithai-100">
            <li><Link to="/orders" className="hover:text-white">Track my order</Link></li>
            <li><Link to="/wishlist" className="hover:text-white">Wishlist</Link></li>
            <li><Link to="/profile" className="hover:text-white">My account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-mithai-300">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-mithai-100">
            <li className="flex items-center gap-2"><MapPin size={15} /> Sector 18, Gurgaon, Haryana</li>
            <li className="flex items-center gap-2"><Phone size={15} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><Mail size={15} /> hello@mithaijunction.in</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-mithai-300">
        © 2026 Mithai Junction. All rights reserved.
      </div>
    </footer>
  );
}
