interface BadgeProps {
  label: string;
  tone?: "default" | "success" | "warning" | "veg" | "nonveg";
}

export default function Badge({ label, tone = "default" }: BadgeProps) {
  const toneClasses = {
    default: "bg-mithai-100 text-maroon-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    veg: "bg-green-50 text-green-700 border border-green-600",
    nonveg: "bg-red-50 text-red-700 border border-red-600",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}
