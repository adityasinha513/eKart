export type ProductUnit = "GRAM" | "KG" | "PIECE" | "BOX";

export interface Product {
  productId: number;
  name: string;
  description: string;
  category: string;
  categoryId: number;
  price: number;
  discountedPrice: number | null;
  discountPercent: number | null;
  availableQuantity: number;
  veg: boolean;
  unit: ProductUnit;
  unitQuantity: number | null;
  ingredients: string | null;
  allergens: string | null;
  shelfLifeDays: number | null;
  imageUrl: string | null;
  available: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  avgRating: number | null;
  ratingCount: number | null;
}

/** The effective, always-present selling price for a product (falls back to price when no offer applies). */
export function effectivePrice(product: Product): number {
  return product.discountedPrice ?? product.price;
}
