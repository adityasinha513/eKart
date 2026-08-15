import { apiClient } from "./client";
import type { Product } from "../../types/Product";

export interface ProductQuery {
  categoryId?: number;
  search?: string;
  vegOnly?: boolean;
  bestSellerOnly?: boolean;
  newArrivalsOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "priceLowToHigh" | "priceHighToLow" | "rating" | "newest";
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params: Record<string, string | number | boolean> = {};
  if (query.categoryId !== undefined) params.categoryId = query.categoryId;
  if (query.search) params.search = query.search;
  if (query.vegOnly !== undefined) params.vegOnly = query.vegOnly;
  if (query.bestSellerOnly !== undefined) params.bestSellerOnly = query.bestSellerOnly;
  if (query.newArrivalsOnly !== undefined) params.newArrivalsOnly = query.newArrivalsOnly;
  if (query.minPrice !== undefined) params.minPrice = query.minPrice;
  if (query.maxPrice !== undefined) params.maxPrice = query.maxPrice;
  if (query.sortBy) params.sortBy = query.sortBy;

  const { data } = await apiClient.get<Product[]>("/products/products", { params });
  return data;
}

export async function getProductById(productId: number): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/product/${productId}`);
  return data;
}
