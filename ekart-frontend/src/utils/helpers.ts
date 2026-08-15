export function formatCurrency(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function calculateDiscount(price: number, discountPercent: number): number {
  return Number((price * (discountPercent / 100)).toFixed(2));
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}
