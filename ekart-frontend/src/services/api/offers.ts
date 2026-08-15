import { apiClient } from "./client";
import type { Offer } from "../../types/Offer";

export async function getActiveOffers(): Promise<Offer[]> {
  const { data } = await apiClient.get<Offer[]>("/offers/offers");
  return data;
}
