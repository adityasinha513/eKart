export interface Session {
  emailId: string;
  name: string;
  phoneNumber: string;
  role: "CUSTOMER" | "ADMIN";
  accessToken: string;
  refreshToken: string;
}
export interface Product {
  productId: number;
  name: string;
  description: string;
  category: string;
  categoryId: number;
  price: number;
  discountedPrice: number | null;
  availableQuantity: number;
  unit: string;
  unitQuantity: number | null;
  imageUrl: string | null;
  available: boolean;
  ingredients: string | null;
  allergens: string | null;
  shelfLifeDays: number | null;
}
export interface Category { categoryId: number; name: string; }
export interface Address {
  addressId: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  landmark: string | null;
  isDefault: boolean;
  latitude: number | null;
  longitude: number | null;
}
export interface CartItem { cartProductId: number; product: Product; quantity: number; }
export interface Order {
  orderId: number;
  dateOfOrder: string;
  dateOfDelivery: string;
  totalPrice: number;
  deliveryFee: number;
  orderStatus: string;
  paymentThrough: "ONLINE" | "COD" | "DEBIT_CARD" | "CREDIT_CARD" | "UNKNOWN";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "UNKNOWN";
  deliveryType: "DELIVERY" | "PICKUP" | "UNKNOWN";
  deliveryAddressSnapshot: string | null;
  pickupStoreLocation: string | null;
  orderedProducts: Array<{ orderedProductId: number; quantity: number; unitPrice: number; product: Product }>;
}
