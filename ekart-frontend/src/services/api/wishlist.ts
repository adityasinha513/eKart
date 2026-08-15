import { apiClient } from "./client";
import type { WishlistItem } from "../../types/Wishlist";

export async function addToWishlist(customerEmailId: string, productId: number): Promise<void> {
  await apiClient.post(`/wishlist/customer/${encodeURIComponent(customerEmailId)}/product/${productId}`);
}

export async function getWishlist(customerEmailId: string): Promise<WishlistItem[]> {
  const { data } = await apiClient.get<WishlistItem[]>(`/wishlist/customer/${encodeURIComponent(customerEmailId)}/products`);
  return data;
}

export async function removeFromWishlist(customerEmailId: string, productId: number): Promise<void> {
  await apiClient.delete(`/wishlist/customer/${encodeURIComponent(customerEmailId)}/product/${productId}`);
}
