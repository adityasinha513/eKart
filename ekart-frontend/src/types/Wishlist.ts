import type { Product } from "./Product";

export interface WishlistItem {
  wishlistItemId: number;
  product: Product;
  addedAt: string;
}
