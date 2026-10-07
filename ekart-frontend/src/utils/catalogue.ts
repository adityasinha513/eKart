import type { Product } from "../types/Product";

export type ShopCategory = "Sweet" | "Namkeen" | "Beverages";

const SWEET_CATEGORY_NAMES = new Set(["sweet", "sweets", "mithai", "bengali sweets"]);

export function shopCategoryForName(name: string): ShopCategory | null {
  const normalized = name.trim().toLowerCase();
  if (SWEET_CATEGORY_NAMES.has(normalized)) return "Sweet";
  if (normalized === "namkeen") return "Namkeen";
  if (normalized === "beverage" || normalized === "beverages" || normalized === "drinks") return "Beverages";
  return null;
}

export function shopCategoryForProduct(product: Pick<Product, "category">): ShopCategory | null {
  return shopCategoryForName(product.category);
}

export function isV1Product(product: Pick<Product, "category">): boolean {
  return shopCategoryForProduct(product) !== null;
}
