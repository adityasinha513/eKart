import { apiClient } from "./client";
import type { Order, OrderStatusHistoryEntry, PlaceOrderInput } from "../../types/Order";

export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const { data } = await apiClient.post<string>("/orders/place-order", input);
  return data;
}

export async function getOrder(orderId: number): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/order/${orderId}`);
  return data;
}

export async function getOrdersForCustomer(customerEmailId: string): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>(`/orders/customer/${encodeURIComponent(customerEmailId)}/orders`);
  return data;
}

export async function getOrderStatusHistory(orderId: number): Promise<OrderStatusHistoryEntry[]> {
  const { data } = await apiClient.get<OrderStatusHistoryEntry[]>(`/orders/order/${orderId}/status-history`);
  return data;
}

export async function reorder(orderId: number): Promise<string> {
  const { data } = await apiClient.post<string>(`/orders/order/${orderId}/reorder`);
  return data;
}

/** Extracts the numeric order id backend embeds at the end of its "...  123" success string. */
export function parseOrderIdFromMessage(message: string): number | null {
  const match = message.match(/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
}
