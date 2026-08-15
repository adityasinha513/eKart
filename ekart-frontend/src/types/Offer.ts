export type DiscountType = "PERCENTAGE" | "FLAT" | string;

export interface Offer {
  offerId: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  productId: number | null;
  categoryId: number | null;
  startDate: string;
  endDate: string;
  active: boolean;
}
