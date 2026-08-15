export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-mithai-200 bg-white shadow-sm">
      <div className="h-56 w-full animate-pulse bg-mithai-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-1/3 animate-pulse rounded bg-mithai-100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-mithai-100" />
        <div className="h-4 w-full animate-pulse rounded bg-mithai-100" />
        <div className="h-10 w-full animate-pulse rounded-2xl bg-mithai-100" />
      </div>
    </div>
  );
}
