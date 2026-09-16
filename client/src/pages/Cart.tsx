import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSettings } from "../context/SettingsContext";
import { getWhatsAppLink } from "../lib/whatsapp";
import { generateCartWhatsAppMessage } from "../lib/whatsapp-cart";
import { useLanguage } from "../context/LanguageContext";

export default function Cart() {
  const { items, removeItem, totalPrice } = useCart();
  const { settings } = useSettings();
  const { t } = useLanguage();

  function handleOrderWhatsApp() {
    const message = generateCartWhatsAppMessage(items, totalPrice);
    const link = getWhatsAppLink(settings.whatsappNumber, message);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-5 py-24 text-center lg:px-8">
        <ShoppingBag size={48} className="mb-4 text-warmgray" strokeWidth={1} />
        <h1 className="font-serif-display text-2xl text-charcoal">{t("cart.empty")}</h1>
        <p className="mt-2 text-sm text-warmgray">
          Browse our collection and add sarees you love.
        </p>
        <Link
          to="/sarees"
          className="focus-ring mt-6 inline-flex items-center gap-2 bg-wine px-6 py-3 text-sm font-semibold tracking-wide text-ivory transition hover:bg-wine-dark"
        >
          {t("common.browseSarees")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 lg:px-8">
      <h1 className="font-serif-display text-3xl text-charcoal">{t("cart.yourCart")}</h1>
      <p className="mt-1 text-sm text-warmgray">
        {items.length} {items.length === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 divide-y divide-charcoal/10">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-4 py-5">
            <Link to={`/sarees/${item.slug}`} className="focus-ring h-24 w-20 flex-shrink-0 overflow-hidden bg-ivory-dark">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link
                  to={`/sarees/${item.slug}`}
                  className="focus-ring text-[15px] text-charcoal hover:text-wine"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 font-serif-display text-lg text-wine">
                  ₹{item.price.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              aria-label={`Remove ${item.name}`}
              className="focus-ring flex h-9 w-9 flex-shrink-0 items-center justify-center self-center text-warmgray transition hover:text-wine"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-charcoal/10 pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-charcoal">{t("cart.subtotal")}</span>
          <span className="font-serif-display text-2xl text-wine">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
        </div>
        <p className="mt-2 text-xs text-warmgray">₹100 extra for Cash on Delivery</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/sarees"
          className="focus-ring inline-flex items-center gap-2 text-sm text-warmgray hover:text-charcoal"
        >
          <ArrowLeft size={15} />
          {t("cart.continueShopping")}
        </Link>
        <button
          onClick={handleOrderWhatsApp}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#1fb855]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("cart.orderViaWhatsApp")}
        </button>
      </div>
    </div>
  );
}
