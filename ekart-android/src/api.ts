import * as SecureStore from "expo-secure-store";
import type { Address, CartItem, Category, Order, Product, Session } from "./types";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:4000/api";
const SESSION_KEY = "mithai-junction-session";

export async function readSession(): Promise<Session | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Session; } catch { await SecureStore.deleteItemAsync(SESSION_KEY); return null; }
}
export async function saveSession(session: Session | null) {
  if (session) await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}
async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  let session = authenticated ? await readSession() : null;
  const execute = (token?: string) => fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  let response = await execute(session?.accessToken);
  if (response.status === 401 && session?.refreshToken && path !== "/auth/refresh-token") {
    const refresh = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: json({ refreshToken: session.refreshToken }),
    });
    if (refresh.ok) {
      session = await refresh.json() as Session;
      await saveSession(session);
      response = await execute(session.accessToken);
    } else {
      await saveSession(null);
    }
  }
  const text = await response.text();
  let body: unknown = text;
  try { body = text ? JSON.parse(text) : null; } catch { /* plain text success/error response */ }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body
      ? String((body as { message: unknown }).message)
      : typeof body === "string" && body ? body : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return body as T;
}
const json = (value: unknown) => JSON.stringify(value);

export const authApi = {
  login: (emailId: string, password: string) => request<Session>("/auth/login", { method: "POST", body: json({ emailId, password }) }, false),
  register: (body: { emailId: string; name: string; password: string; phoneNumber: string }) =>
    request<string>("/auth/register", { method: "POST", body: json(body) }, false),
};
export const shopApi = {
  categories: () => request<Category[]>("/categories/categories", {}, false),
  products: () => request<Product[]>("/products/products", {}, false),
  cart: (email: string) => request<CartItem[]>(`/cart/customer/${encodeURIComponent(email)}/products`),
  addToCart: (email: string, productId: number) => request("/customers/customercarts/add-product", {
    method: "POST", body: json({ customerEmailId: email, cartProducts: [{ product: { productId }, quantity: 1 }] }),
  }),
  setCartQuantity: (email: string, productId: number, quantity: number) => request(
    `/cart/customer/${encodeURIComponent(email)}/product/${productId}`,
    { method: "PUT", body: json(quantity) }),
  removeCartItem: (email: string, productId: number) => request(
    `/cart/customer/${encodeURIComponent(email)}/product/${productId}`, { method: "DELETE" }),
  addresses: (email: string) => request<Address[]>(`/customers/customer/${encodeURIComponent(email)}/addresses`),
  addAddress: (email: string, body: Omit<Address, "addressId" | "isDefault">) => request<Address>(
    `/customers/customer/${encodeURIComponent(email)}/addresses`, { method: "POST", body: json(body) }),
  orders: (email: string) => request<Order[]>(`/orders/customer/${encodeURIComponent(email)}/orders`),
  placeOrder: (body: { customerEmailId: string; deliveryType: "DELIVERY" | "PICKUP"; addressId?: number; paymentThrough: "COD" | "ONLINE"; dateOfDelivery: string }) =>
    request<string>("/orders/place-order", { method: "POST", body: json(body) }),
  createDemoPayment: (email: string, orderId: number) => request<{ transactionId: number; gatewayOrderId: string; simulated: boolean }>(
    `/payments/customer/${encodeURIComponent(email)}/order/${orderId}/create-payment-order`, { method: "POST" }),
  verifyDemoPayment: (email: string, payload: { orderId: number; gatewayOrderId: string; gatewayPaymentId: string; gatewaySignature: string }) =>
    request<{ status: string }>(`/payments/customer/${encodeURIComponent(email)}/verify-payment`, { method: "POST", body: json(payload) }),
  cancelDemoPayment: (email: string, orderId: number) => request<void>(
    `/payments/customer/${encodeURIComponent(email)}/order/${orderId}/cancel-payment`, { method: "POST" }),
  cancelOrder: (orderId: number) => request<void>(`/orders/order/${orderId}/cancel`, { method: "PUT" }),
};
export function parseOrderId(message: string): number | null {
  const match = message.match(/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}
export function apiMessage(error: unknown) { return error instanceof Error ? error.message : "Something went wrong. Please try again."; }
