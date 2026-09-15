import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Share2, ChevronLeft, ChevronRight, ShieldCheck, Truck, UserCheck, ShoppingBag, ZoomIn, Play } from "lucide-react";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { Product } from "../types";
import WhatsAppButton from "../components/WhatsAppButton";
import StickyWhatsAppBar from "../components/StickyWhatsAppBar";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import ReviewSection from "../components/ReviewSection";
import ImageLightbox from "../components/ImageLightbox";
import { useRecentlyViewed } from "../context/RecentlyViewedContext";

const SPEC_LABELS: { key: keyof Product; label: string }[] = [
  { key: "fabric", label: "Fabric" },
  { key: "color", label: "Color" },
  { key: "pattern", label: "Pattern" },
  { key: "occasion", label: "Occasion" },
  { key: "sareeLength", label: "Saree Length" },
  { key: "blouseLength", label: "Blouse" },
  { key: "sku", label: "Product ID" },
];

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<"details" | "description" | "shipping">("details");
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, items: cartItems } = useCart();
  const { recentIds, addViewed } = useRecentlyViewed();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    api
      .get<{ product: Product; related: Product[] }>(`/products/${slug}`)
      .then((res) => {
        setProduct(res.product);
        setRelated(res.related);

        // SEO: dynamic title + meta description
        document.title = `${res.product.name} | 3S Saree`;
        let meta = document.querySelector('meta[name="description"]');
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        meta.setAttribute(
          "content",
          `Explore our ${res.product.name} in ${res.product.color}. View details and enquire directly on WhatsApp.`
        );
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      addViewed(product.id);
    }
  }, [product?.id, addViewed]);

  // Fetch recently viewed products
  useEffect(() => {
    const idsToFetch = recentIds.filter((id) => id !== product?.id);
    if (idsToFetch.length === 0) {
      setRecentProducts([]);
      return;
    }
    api
      .get<{ products: Product[] }>("/products")
      .then((res) => {
        const mapped = idsToFetch
          .map((id) => res.products.find((p) => p.id === id))
          .filter((p): p is Product => !!p);
        setRecentProducts(mapped);
      })
      .catch(() => {});
  }, [recentIds, product?.id]);

  async function handleShare() {
    if (!product) return;
    const url = window.location.href;
    api.post(`/products/${product.id}/share`).catch(() => {});
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] bg-ivory-dark" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-ivory-dark" />
            <div className="h-5 w-1/3 bg-ivory-dark" />
            <div className="h-24 w-full bg-ivory-dark" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <EmptyState
        title="Saree not found"
        description="This saree may have been removed or is no longer available."
        action={
          <Link to="/sarees" className="focus-ring hairline px-6 py-2.5 text-sm text-wine">
            Browse Collection
          </Link>
        }
      />
    );
  }

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const images = product.images.length ? product.images : [{ id: "x", url: "", label: "" }];

  return (
    <div className="pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-4 text-xs text-warmgray lg:px-8">
        <Link to="/" className="hover:text-wine">Home</Link>
        <span className="mx-1.5">/</span>
        <Link to="/sarees" className="hover:text-wine">Sarees</Link>
        <span className="mx-1.5">/</span>
        <span className="text-charcoal">{product.name}</span>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* Gallery */}
        <div>
          {showVideo && product.videoUrl ? (
            <div className="relative aspect-[3/4] overflow-hidden bg-black">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
              />
              <button
                onClick={() => setShowVideo(false)}
                className="focus-ring absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1.5 text-xs font-medium text-charcoal"
              >
                Back to Photos
              </button>
            </div>
          ) : (
            <div
              className="protected-image-wrap relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-ivory-dark"
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={images[activeImage]?.url}
                alt={`${product.name} — ${images[activeImage]?.label || "photo"}`}
                className="protected-image h-full w-full object-contain"
                draggable={false}
              />
              {/* Zoom hint */}
              <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-ivory/85 px-2.5 py-1 text-xs text-charcoal">
                <ZoomIn size={14} /> Zoom
              </span>
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }}
                    aria-label="Previous image"
                    className="focus-ring absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-charcoal"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }}
                    aria-label="Next image"
                    className="focus-ring absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-ivory/85 text-charcoal"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {!product.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40">
                  <span className="bg-ivory px-4 py-1.5 text-sm font-medium text-charcoal">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="mt-3 flex gap-2.5 overflow-x-auto">
            {images.length > 1 &&
              images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => { setShowVideo(false); setActiveImage(i); }}
                  aria-label={img.label || `Photo ${i + 1}`}
                  className={`focus-ring h-20 w-16 flex-shrink-0 overflow-hidden border-2 ${
                    activeImage === i && !showVideo ? "border-wine" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            {product.videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                aria-label="Play product video"
                className={`focus-ring flex h-20 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 border-2 bg-charcoal/5 text-charcoal ${
                  showVideo ? "border-wine" : "border-transparent"
                }`}
              >
                <Play size={18} />
                <span className="text-[10px]">Video</span>
              </button>
            )}
          </div>
        </div>

        {lightboxOpen && (
          <ImageLightbox
            images={images}
            startIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        {/* Info */}
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
          <p className="mt-1.5 text-xs tracking-wide text-warmgray">SKU: {product.sku}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-serif-display text-3xl text-wine">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-warmgray line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-sm font-medium text-gold">{discount}% OFF</span>
              </>
            )}
          </div>

          <span
            className={`mt-3 inline-block px-2.5 py-1 text-xs font-medium ${
              product.isAvailable
                ? "bg-green-100 text-green-800"
                : "bg-charcoal/10 text-charcoal"
            }`}
          >
            {product.isAvailable ? "Available" : "Out of Stock"}
          </span>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-warmgray">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <WhatsAppButton product={product} className="hidden lg:inline-flex" />
            {product.isAvailable && (
              <button
                onClick={() => {
                  addItem(product);
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 2000);
                }}
                disabled={cartItems.some((i) => i.productId === product.id)}
                className={`focus-ring hairline flex h-12 items-center gap-2 px-5 text-sm font-medium transition ${
                  cartItems.some((i) => i.productId === product.id)
                    ? "bg-wine/10 text-wine"
                    : "text-charcoal hover:text-wine"
                }`}
              >
                <ShoppingBag size={17} />
                {cartItems.some((i) => i.productId === product.id) ? "In Cart" : "Add to Cart"}
              </button>
            )}
            <button
              onClick={() => setWishlisted((w) => !w)}
              aria-pressed={wishlisted}
              aria-label="Add to wishlist"
              className="focus-ring hairline flex h-12 w-12 items-center justify-center text-wine"
            >
              <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share this saree"
              className="focus-ring hairline flex h-12 w-12 items-center justify-center text-charcoal"
            >
              <Share2 size={17} />
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-gold">Link copied to clipboard.</p>}
          {addedToCart && <p className="mt-2 text-xs text-gold">Added to cart!</p>}
          <p className="mt-2 hidden text-xs text-warmgray lg:block">
            Get a quick response on WhatsApp.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {[
              { icon: ShieldCheck, label: "Quality Checked" },
              { icon: Truck, label: "Careful Packaging" },
              { icon: UserCheck, label: "Personal Assistance" },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5">
                <t.icon size={18} className="text-wine" strokeWidth={1.5} />
                <span className="text-[11px] leading-tight text-warmgray">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mt-10 border-t border-charcoal/10 pt-6">
            <div className="flex gap-6 border-b border-charcoal/10">
              {[
                { id: "details", label: "Details" },
                { id: "description", label: "Description" },
                { id: "shipping", label: "Shipping & Care" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as typeof tab)}
                  className={`focus-ring -mb-px border-b-2 pb-3 text-sm ${
                    tab === t.id
                      ? "border-wine text-wine"
                      : "border-transparent text-warmgray hover:text-charcoal"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="pt-5">
              {tab === "details" && (
                <dl className="divide-y divide-charcoal/10 text-sm">
                  {SPEC_LABELS.map((s) => (
                    <div key={s.key} className="grid grid-cols-2 py-2.5">
                      <dt className="text-warmgray">{s.label}</dt>
                      <dd className="text-charcoal">{String(product[s.key])}</dd>
                    </div>
                  ))}
                  <div className="grid grid-cols-2 py-2.5">
                    <dt className="text-warmgray">Availability</dt>
                    <dd className="text-charcoal">
                      {product.isAvailable ? "In Stock" : "Out of Stock"}
                    </dd>
                  </div>
                </dl>
              )}
              {tab === "description" && (
                <p className="text-sm leading-relaxed text-warmgray">{product.description}</p>
              )}
              {tab === "shipping" && (
                <p className="text-sm leading-relaxed text-warmgray">
                  Orders are finalized and shipped after confirmation over WhatsApp. Please
                  message us for delivery timelines to your city, packaging details, and
                  care instructions specific to this fabric.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {recentProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="mb-8">
            <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
              Recently Viewed
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {recentProducts.map((p) => (
              <div key={p.id} className="w-48 flex-shrink-0 lg:w-56">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}

      <StickyWhatsAppBar product={product} />
    </div>
  );
}
