import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";

const PRODUCT_IMAGE_FALLBACKS: Record<string, string> = {
  "kaju katli": "/images/products/kaju-katli.jpg",
  "motichoor ladoo": "/images/products/motichoor-ladoo.jpg",
  "besan ladoo": "/images/products/besan-ladoo.jpg",
  "gulab jamun (12 pcs)": "/images/products/gulab-jamun.jpg",
  "gulab jamun": "/images/products/gulab-jamun.jpg",
  "rasgulla (12 pcs)": "/images/products/rasgulla.jpg",
  "rasgulla": "/images/products/rasgulla.jpg",
  "soan papdi": "/images/products/soan-papdi.jpg",
  "sandesh": "/images/products/sandesh.jpg",
  "mishti doi": "/images/products/mishti-doi.jpg",
  "chum chum": "/images/products/chum-chum.jpg",
  "kheer kadam": "/images/products/kheer-kadam.jpg",
  "aloo bhujia": "/images/products/aloo-bhujia.jpg",
  "navratan mixture": "/images/products/navratan-mixture.jpg",
  "khatta meetha mix": "/images/products/khatta-meetha-mix.jpg",
  "moong dal": "/images/products/moong-dal.jpg",
  "thandai (500ml)": "/images/products/thandai.jpg",
  "thandai": "/images/products/thandai.jpg",
  "masala chai mix (200g)": "/images/products/masala-chai-mix.jpg",
  "masala chai mix": "/images/products/masala-chai-mix.jpg",
  "rose sharbat (750ml)": "/images/products/rose-sharbat.jpg",
  "rose sharbat": "/images/products/rose-sharbat.jpg",
};

function getProductFallback(name?: string): string | null {
  if (!name) return null;
  return PRODUCT_IMAGE_FALLBACKS[name.trim().toLowerCase()] ?? null;
}

function optimizedSource(imageUrl: string | null | undefined, width: number, productName?: string) {
  const urlCandidate = imageUrl || getProductFallback(productName);
  if (!urlCandidate) return null;
  if (urlCandidate.startsWith("/")) {
    return urlCandidate;
  }
  try {
    const url = new URL(urlCandidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "76");
    }
    return url.toString();
  } catch {
    return null;
  }
}

interface ProductImageProps {
  product: Pick<Product, "productId" | "name" | "category" | "imageUrl">;
  className?: string;
  alt?: string;
  width?: number;
  eager?: boolean;
}

export default function ProductImage({ product, className = "", alt, width = 720, eager = false }: ProductImageProps) {
  const initialSource = optimizedSource(product.imageUrl, width, product.name);
  const [currentSrc, setCurrentSrc] = useState<string | null>(initialSource);
  const [triedFallback, setTriedFallback] = useState(false);

  useEffect(() => {
    const src = optimizedSource(product.imageUrl, width, product.name);
    setCurrentSrc(src);
    setTriedFallback(false);
  }, [product.imageUrl, product.productId, product.name, width]);

  const handleError = () => {
    const fallback = getProductFallback(product.name);
    if (!triedFallback && fallback && currentSrc !== fallback) {
      setTriedFallback(true);
      setCurrentSrc(fallback);
    } else {
      setCurrentSrc(null);
    }
  };

  if (!currentSrc) {
    return (
      <div role="img" aria-label={alt ?? `${product.name} image unavailable`} className={`${className} flex items-center justify-center bg-cream-100 p-4 text-center text-sm font-medium text-stone-500`}>
        {product.name}<span className="sr-only"> product image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt ?? product.name}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      onError={handleError}
    />
  );
}

