import { AlertTriangle } from "lucide-react";

interface AdminPlaceholderProps {
  title: string;
  description: string;
}

export default function AdminPlaceholder({ title, description }: AdminPlaceholderProps) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-maroon-900">{title}</h1>
      <p className="mt-2 text-sm text-stone-500">{description}</p>

      <div className="mt-6 rounded-[24px] border border-dashed border-mithai-300 bg-mithai-50/50 p-10 text-center">
        <AlertTriangle className="mx-auto text-amber-500" />
        <p className="mt-3 font-semibold text-maroon-900">Not yet connected to the backend</p>
        <p className="mt-2 text-sm text-stone-500">
          The admin API for this section hasn't been built yet. This page shell is wired up and ready — real
          data will appear here automatically once the corresponding /api/admin/** endpoints go live.
        </p>
      </div>
    </div>
  );
}
