import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  wishlisted?: boolean;
  onToggleWishlist?: (id: string) => void;
}

export default function ProductCard({
  product,
  wishlisted = false,
  onToggleWishlist,
}: ProductCardProps) {
  const { addItem, items } = useCart();
  const [loaded, setLoaded] = useState(false);
  const inCart = items.some((i) => i.productId === product.id);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  const primaryImage = product.images[0]?.url;
  const secondaryImage = product.images[1]?.url;

  return (
    <div className="group relative">
      <Link
        to={`/sarees/${product.slug}`}
        className="focus-ring block"
        aria-label={product.name}
      >
        <div className="img-zoom-wrap protected-image-wrap relative aspect-[4/5] overflow-hidden bg-ivory-dark" onContextMenu={(e) => e.preventDefault()}>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-ivory-dark" />
          )}
          {primaryImage && (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`img-zoom h-full w-full object-cover transition-opacity duration-500 ${
                loaded ? "opacity-100" : "opacity-0"
              } ${secondaryImage ? "group-hover:opacity-0" : ""}`}
            />
          )}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-wine px-2.5 py-1 text-[10px] font-semibold tracking-wide text-ivory">
                New
              </span>
            )}
            {product.isBestseller && (
              <span className="bg-gold px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white">
                Bestseller
              </span>
            )}
            {discount > 0 && (
              <span className="bg-charcoal/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-ivory">
                {discount}% OFF
              </span>
            )}
          </div>

          {!product.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
              <span className="bg-ivory px-3 py-1 text-xs font-medium tracking-wide text-charcoal">
                Out of Stock
              </span>
            </div>
          )}

          <span className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full bg-ivory/95 py-2.5 text-center text-xs font-medium tracking-wide text-wine transition-transform duration-300 group-hover:translate-y-0">
            View Details
          </span>
        </div>
      </Link>

      {product.isAvailable && (
        <button
          onClick={() => addItem(product)}
          aria-label={inCart ? "Already in cart" : "Add to cart"}
          className={`focus-ring absolute bottom-[72px] right-3 flex h-8 w-8 items-center justify-center rounded-full transition opacity-0 group-hover:opacity-100 ${
            inCart
              ? "bg-wine text-ivory"
              : "bg-ivory/90 text-charcoal hover:bg-ivory hover:text-wine"
          }`}
        >
          <ShoppingBag size={14} />
        </button>
      )}

      {onToggleWishlist && (
        <button
          onClick={() => onToggleWishlist(product.id)}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          className="focus-ring absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ivory/90 text-wine transition hover:bg-ivory"
        >
          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
        </button>
      )}

      <div className="mt-3 space-y-0.5">
        <Link to={`/sarees/${product.slug}`} className="focus-ring">
          <h3 className="text-[15px] leading-snug text-charcoal">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-serif-display text-lg text-wine">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-warmgray line-through">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <p className="text-[11px] text-warmgray">₹100 extra for Cash on Delivery</p>
      </div>
    </div>
  );
}
