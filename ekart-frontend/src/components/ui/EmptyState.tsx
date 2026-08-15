import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-mithai-300 bg-mithai-50/50 px-8 py-16 text-center">
      {icon ? <div className="mb-4 flex justify-center text-maroon-400">{icon}</div> : null}
      <h3 className="text-xl font-semibold text-maroon-900">{title}</h3>
      <p className="mt-3 text-sm text-stone-600">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
