interface RatingBadgeProps {
  rating: number | null | undefined;
  count?: number | null;
}

export default function RatingBadge({ rating, count }: RatingBadgeProps) {
  if (!rating) {
    return <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-sm font-medium text-stone-500">New</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-sm font-semibold text-green-700">
      ★ {rating.toFixed(1)}
      {count ? <span className="font-normal text-green-600">({count})</span> : null}
    </span>
  );
}
