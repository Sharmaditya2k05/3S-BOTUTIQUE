import { MessageCircle } from "lucide-react";
import { Product } from "../types";
import { generateWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";
import { useSettings } from "../context/SettingsContext";
import { api } from "../lib/api";

interface WhatsAppButtonProps {
  product: Product;
  className?: string;
  full?: boolean;
  label?: string;
}

export default function WhatsAppButton({
  product,
  className = "",
  full = false,
  label = "Enquire on WhatsApp",
}: WhatsAppButtonProps) {
  const { settings } = useSettings();

  function handleClick() {
    const message = generateWhatsAppMessage(product);
    const link = getWhatsAppLink(settings.whatsappNumber, message);
    api.post(`/products/${product.id}/whatsapp-click`).catch(() => {});
    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1fbd5a] active:scale-[0.98] ${
        full ? "w-full" : ""
      } ${className}`}
    >
      <MessageCircle size={18} strokeWidth={2} />
      {label}
    </button>
  );
}
