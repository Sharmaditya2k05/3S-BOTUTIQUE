import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";

export default function Contact() {
  const { settings } = useSettings();

  const items = [
    { icon: MessageCircle, label: "WhatsApp", value: "Message us directly", href: getWhatsAppLink(settings.whatsappNumber, generateGeneralWhatsAppMessage()) },
    settings.phone && { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone}` },
    settings.email && { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    settings.city && { icon: MapPin, label: "Location", value: settings.city, href: undefined },
    settings.businessHours && { icon: Clock, label: "Business Hours", value: settings.businessHours, href: undefined },
  ].filter(Boolean) as { icon: any; label: string; value: string; href?: string }[];

  return (
    <div>
      <div className="border-b border-charcoal/10 bg-ivory-dark py-14 text-center">
        <h1 className="font-serif-display text-4xl text-charcoal sm:text-5xl">Contact Us</h1>
        <p className="mt-2 text-warmgray">We'd love to help you find the perfect saree.</p>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-16 lg:px-8">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.label} className="hairline flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose-light text-wine">
                <item.icon size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-warmgray">{item.label}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="focus-ring text-charcoal hover:text-wine"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-charcoal">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <a
          href={getWhatsAppLink(settings.whatsappNumber, generateGeneralWhatsAppMessage())}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-8 flex items-center justify-center gap-2 rounded-sm bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1fbd5a]"
        >
          <MessageCircle size={18} /> Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
