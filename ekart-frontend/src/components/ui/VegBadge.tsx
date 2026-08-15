interface VegBadgeProps {
  veg: boolean;
  size?: number;
}

/** The classic Indian FSSAI green/brown square-with-dot veg/non-veg indicator. */
export default function VegBadge({ veg, size = 16 }: VegBadgeProps) {
  const color = veg ? "#16a34a" : "#b91c1c";
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center border"
      style={{ width: size, height: size, borderColor: color, padding: 2 }}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className="block rounded-full" style={{ width: "100%", height: "100%", backgroundColor: color }} />
    </span>
  );
}
