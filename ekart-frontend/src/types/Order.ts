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
export type PaymentThrough = "ONLINE" | "COD" | "DEBIT_CARD" | "CREDIT_CARD" | "UNKNOWN";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "UNKNOWN";

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
  customerName?: string | null;
  customerPhoneNumber?: string | null;
  dateOfOrder: string;
  totalPrice: number;
  deliveryFee: number;
  orderStatus: OrderStatus;
  discount: number | null;
  paymentThrough: PaymentThrough;
  paymentStatus: PaymentStatus;
  dateOfDelivery: string;
  deliveryType: DeliveryType | "UNKNOWN";
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
