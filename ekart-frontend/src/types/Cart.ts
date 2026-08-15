import type { Product } from "./Product";

export interface CartItem {
  cartProductId: number;
  product: Product;
  quantity: number;
}
