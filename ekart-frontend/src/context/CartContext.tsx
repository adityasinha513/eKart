import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import * as cartApi from "../services/api/cart";
import { useAuth } from "./AuthContext";
import type { CartItem } from "../types/Cart";
import type { Product } from "../types/Product";
import { effectivePrice } from "../types/Product";
import { extractErrorMessage as extractMessage } from "../utils/errors";

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

// Zomato/Swiggy-style flows require a signed-in customer for any cart mutation, and the
// backend cart is entirely server-side (no local persistence layer), so this context always
// reflects the server, and mutation methods no-op with a toast prompt when logged out.
const FREE_DELIVERY_THRESHOLD = 499;
const DELIVERY_FEE = 40;

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await cartApi.getCart(user.emailId);
      setCartItems(items);
    } catch {
      // leave previous state; a toast isn't useful on background refreshes
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setCartItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.emailId]);

  const requireAuth = () => {
    if (!user) {
      toast.error("Please sign in to manage your cart.");
      return false;
    }
    return true;
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (!requireAuth() || !user) return false;
    try {
      await cartApi.addProductToCart(user.emailId, product.productId, quantity);
      await refresh();
      return true;
    } catch (error) {
      toast.error(extractMessage(error, "Could not add item to cart."));
      return false;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!requireAuth() || !user) return;
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const previous = cartItems;
    setCartItems((prev) => prev.map((item) => (item.product.productId === productId ? { ...item, quantity } : item)));
    try {
      await cartApi.updateCartQuantity(user.emailId, productId, quantity);
    } catch (error) {
      setCartItems(previous);
      toast.error(extractMessage(error, "Could not update quantity."));
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!requireAuth() || !user) return;
    const previous = cartItems;
    setCartItems((prev) => prev.filter((item) => item.product.productId !== productId));
    try {
      await cartApi.removeFromCart(user.emailId, productId);
    } catch (error) {
      setCartItems(previous);
      toast.error(extractMessage(error, "Could not remove item."));
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await cartApi.clearCart(user.emailId);
      setCartItems([]);
    } catch (error) {
      toast.error(extractMessage(error, "Could not clear cart."));
    }
  };

  const cartCount = useMemo(() => cartItems.reduce((total, item) => total + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + effectivePrice(item.product) * item.quantity, 0),
    [cartItems]
  );
  const deliveryFee = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      cartItems,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refresh,
      cartCount,
      subtotal,
      deliveryFee,
      grandTotal,
    }),
    [cartItems, isLoading, cartCount, subtotal, deliveryFee, grandTotal] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
