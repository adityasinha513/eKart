import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import * as wishlistApi from "../services/api/wishlist";
import { useAuth } from "./AuthContext";
import type { WishlistItem } from "../types/Wishlist";

interface WishlistContextType {
  items: WishlistItem[];
  isLoading: boolean;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      setItems(await wishlistApi.getWishlist(user.emailId));
    } catch {
      // ignore background refresh failures
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.emailId]);

  const isWishlisted = (productId: number) => items.some((item) => item.product.productId === productId);

  const toggleWishlist = async (productId: number) => {
    if (!user) {
      toast.error("Please sign in to use your wishlist.");
      return;
    }
    const alreadyIn = isWishlisted(productId);
    try {
      if (alreadyIn) {
        await wishlistApi.removeFromWishlist(user.emailId, productId);
        setItems((prev) => prev.filter((item) => item.product.productId !== productId));
        toast.success("Removed from wishlist.");
      } else {
        await wishlistApi.addToWishlist(user.emailId, productId);
        await refresh();
        toast.success("Added to wishlist.");
      }
    } catch {
      toast.error("Could not update wishlist.");
    }
  };

  const value = useMemo(
    () => ({ items, isLoading, isWishlisted, toggleWishlist, refresh }),
    [items, isLoading] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
