import { apiClient } from "./client";
import type { CartItem } from "../../types/Cart";

/**
 * Adding to cart does NOT go through /api/cart — it goes through a CustomerMS proxy
 * endpoint that also validates the product exists before forwarding to CartMS.
 */
export async function addProductToCart(customerEmailId: string, productId: number, quantity: number): Promise<void> {
  await apiClient.post("/customers/customercarts/add-product", {
    customerEmailId,
    cartProducts: [{ product: { productId }, quantity }],
  });
}

export async function getCart(customerEmailId: string): Promise<CartItem[]> {
  const { data } = await apiClient.get<CartItem[]>(`/cart/customer/${encodeURIComponent(customerEmailId)}/products`);
  return data;
}

export async function updateCartQuantity(customerEmailId: string, productId: number, quantity: number): Promise<void> {
  await apiClient.put(
    `/cart/customer/${encodeURIComponent(customerEmailId)}/product/${productId}`,
    quantity,
    { headers: { "Content-Type": "application/json" } }
  );
}

export async function removeFromCart(customerEmailId: string, productId: number): Promise<void> {
  await apiClient.delete(`/cart/customer/${encodeURIComponent(customerEmailId)}/product/${productId}`);
}

export async function clearCart(customerEmailId: string): Promise<void> {
  await apiClient.delete(`/cart/customer/${encodeURIComponent(customerEmailId)}/products`);
}
