import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { api } from "../lib/api";
import { Product } from "../types";
import { useWishlist } from "../context/WishlistContext";
import { useSettings } from "../context/SettingsContext";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { generateWishlistWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";
import { useLanguage } from "../context/LanguageContext";

export default function Wishlist() {
  const { ids, toggle, has } = useWishlist();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "My Wishlist | 3S Saree";
    api
      .get<Product[]>("/products")
      .then((res) => setAllProducts(res))
      .finally(() => setLoading(false));
  }, []);

  const wishlisted = allProducts.filter((p) => ids.includes(p.id));

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-5 py-12 lg:px-8">
        <div className="mb-8 h-8 w-48 bg-ivory-dark" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/5] bg-ivory-dark" />
              <div className="h-4 w-2/3 bg-ivory-dark" />
              <div className="h-4 w-1/3 bg-ivory-dark" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlisted.length === 0) {
    return (
      <EmptyState
        title={t("wishlist.empty")}
        description="Save sarees you love and come back to them anytime."
        action={
          <Link
            to="/sarees"
            className="focus-ring inline-flex items-center rounded-sm bg-wine px-6 py-2.5 text-sm font-semibold tracking-wide text-ivory transition hover:bg-wine-dark"
          >
            {t("common.browseSarees")}
          </Link>
        }
      />
    );
  }

  const whatsappMessage = generateWishlistWhatsAppMessage(wishlisted);
  const whatsappLink = getWhatsAppLink(settings.whatsappNumber, whatsappMessage);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
            {t("wishlist.title")}
          </h1>
          <p className="mt-1.5 text-sm text-warmgray">
            {wishlisted.length} saree{wishlisted.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {wishlisted.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            wishlisted={has(p.id)}
            onToggleWishlist={toggle}
          />
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex items-center gap-2 rounded-sm bg-wine px-6 py-3 text-sm font-semibold tracking-wide text-ivory transition hover:bg-wine-dark"
        >
          <Share2 size={16} />
          {t("wishlist.shareWhatsApp")}
        </a>
      </div>
    </div>
  );
}
