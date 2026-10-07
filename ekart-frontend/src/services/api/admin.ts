import { apiClient } from "./client";
import type { Order, OrderStatus } from "../../types/Order";
import type { Product } from "../../types/Product";

export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>("/admin/products");
  return data;
}

export async function setAdminProductAvailability(productId: number, available: boolean): Promise<Product> {
  const { data } = await apiClient.patch<Product>("/admin/products/" + productId + "/availability", available, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function setAdminProductStock(productId: number, quantity: number): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/admin/products/${productId}/stock`, quantity, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}

export async function saveAdminProduct(productId: number | null, product: Record<string, unknown>): Promise<Product> {
  const { data } = productId === null
    ? await apiClient.post<Product>("/admin/products", product)
    : await apiClient.put<Product>(`/admin/products/${productId}`, product);
  return data;
}

export async function archiveAdminProduct(productId: number): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}`);
}

export async function getAdminOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>("/admin/orders");
  return data;
}

export interface AdminCustomer {
  emailId: string;
  name: string;
  phoneNumber: string;
  orderCount: number;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const { data } = await apiClient.get<AdminCustomer[]>("/admin/customers");
  return data;
}

export async function updateAdminOrderStatus(orderId: number, status: OrderStatus, note?: string): Promise<Order> {
  const { data } = await apiClient.put<Order>(`/admin/orders/${orderId}/status`, { status, note });
  return data;
}
