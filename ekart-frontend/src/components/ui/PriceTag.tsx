interface PriceTagProps {
  price: number;
  originalPrice?: number | null;
  className?: string;
}

export default function PriceTag({ price, originalPrice, className = "" }: PriceTagProps) {
  const showStrike = originalPrice != null && originalPrice > price;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-xl font-bold text-maroon-700">₹{price.toLocaleString("en-IN")}</span>
      {showStrike ? (
        <span className="text-sm text-stone-400 line-through">₹{originalPrice!.toLocaleString("en-IN")}</span>
      ) : null}
    </span>
  );
}
