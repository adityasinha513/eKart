import { ArrowRight, MapPin, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#3D2B1F] text-white">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border border-[#E0B084]/30 sm:right-[-4rem] sm:top-[-7rem] sm:h-[34rem] sm:w-[34rem]" />
      <div className="pointer-events-none absolute -right-8 top-10 hidden h-64 w-64 rounded-full border border-[#E0B084]/20 sm:block" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-[4.5rem]">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#E0B084]"><span className="h-px w-7 bg-[#C68642]" /> Mithai Junction · Bengaluru</p>
          <h1 className="font-serif text-[2.65rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">A little sweetness,<br className="hidden sm:block" /> made for your moments.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#F7E7CE]/85 sm:mt-6 sm:text-lg sm:leading-8">Fresh Indian sweets, savoury namkeen and traditional drinks, prepared with care and ready when you are.</p>
          <div className="mt-7 flex flex-col gap-3 min-[380px]:flex-row sm:mt-9">
            <Link to="/catalog" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#C68642] px-6 py-3 font-semibold text-[#271a12] shadow-md transition-colors hover:bg-[#E0B084]">Explore the menu <ArrowRight size={18} /></Link>
            <Link to="/catalog?category=Sweet" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#E0B084]/60 px-6 py-3 font-semibold text-[#F7E7CE] transition-colors hover:bg-white/10"><ShoppingBag size={17} /> Shop sweets</Link>
          </div>
          <div className="mt-7 flex items-start gap-2 text-sm text-[#F7E7CE]/75"><MapPin size={17} className="mt-0.5 shrink-0 text-[#E0B084]" /><span>Delivery within 20 km · Store pickup available</span></div>
        </div>
        <div className="relative mx-auto hidden w-full max-w-sm lg:block">
          <div className="absolute inset-3 rotate-3 rounded-[2rem] border border-[#E0B084]/50" />
          <div className="relative rounded-[2rem] border border-[#E0B084]/35 bg-[#F7E7CE] p-5 shadow-2xl shadow-black/20">
            <img src="/images/products/kaju-katli.jpg" alt="A plate of traditional Kaju Katli with silver leaf" className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" width="720" height="540" fetchPriority="high" />
            <div className="flex items-center justify-between gap-4 px-2 pb-1 pt-4 text-[#3D2B1F]"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A97142]">Made with care</p><p className="mt-1 font-serif text-xl font-semibold">A tradition worth sharing</p></div><span className="rounded-full bg-white px-3 py-2 text-sm font-semibold">Fresh daily</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
