import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";

export default function FloatingWhatsApp() {
  const { settings } = useSettings();
  const [tooltip, setTooltip] = useState(true);

  const link = getWhatsAppLink(
    settings.whatsappNumber,
    generateGeneralWhatsAppMessage()
  );

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {tooltip && (
        <div className="animate-slide-up flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-lg">
          <span className="text-sm text-charcoal">Need help? Chat with us!</span>
          <button
            onClick={() => setTooltip(false)}
            aria-label="Dismiss"
            className="text-warmgray hover:text-charcoal"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-[#25D366]/40" />
        <MessageCircle size={26} strokeWidth={2} />
      </a>
    </div>
  );
}
