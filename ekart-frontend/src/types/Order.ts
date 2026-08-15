import type { Product } from "./Product";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type DeliveryType = "DELIVERY" | "PICKUP";
export type PaymentThrough = "ONLINE" | "COD";

export interface OrderedProduct {
  orderedProductId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  note: string | null;
}

export interface Order {
  orderId: number;
  customerEmailId: string;
  dateOfOrder: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  discount: number | null;
  paymentThrough: PaymentThrough;
  dateOfDelivery: string;
  deliveryType: DeliveryType;
  addressId: number | null;
  deliveryAddressSnapshot: string | null;
  pickupStoreLocation: string | null;
  statusHistory: OrderStatusHistoryEntry[];
  orderedProducts: OrderedProduct[];
}

export interface PlaceOrderInput {
  customerEmailId: string;
  deliveryType: DeliveryType;
  addressId?: number;
  paymentThrough: PaymentThrough;
  dateOfDelivery: string;
}
