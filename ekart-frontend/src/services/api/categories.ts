import { apiClient } from "./client";
import type { Category } from "../../types/Category";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>("/categories/categories");
  return data;
}
