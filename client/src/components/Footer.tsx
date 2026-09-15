import { Link } from "react-router-dom";
import { Phone, Mail, MessageCircle } from "lucide-react";
import Logo from "./Logo";
import { useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-charcoal/10 bg-ivory-dark">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo tagline />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-warmgray">
              {settings.footerText ||
                "Handpicked sarees, personal service, and the warmth of a home-run boutique."}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium text-charcoal">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2.5 text-sm text-warmgray">
              <li><Link className="focus-ring hover:text-wine" to="/">{t("footer.home")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/sarees">{t("footer.sarees")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/sarees?newArrival=true">{t("footer.newArrivals")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/about">{t("footer.aboutUs")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/guide">{t("footer.sizeGuide")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/contact">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium text-charcoal">{t("footer.support")}</h4>
            <ul className="space-y-2.5 text-sm text-warmgray">
              <li className="flex items-center gap-2">
                <MessageCircle size={14} />
                <a
                  className="focus-ring hover:text-wine"
                  href={getWhatsAppLink(settings.whatsappNumber, generateGeneralWhatsAppMessage())}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("footer.whatsappEnquiry")}
                </a>
              </li>
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} />
                  <a className="focus-ring hover:text-wine" href={`tel:${settings.phone}`}>
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail size={14} />
                  <a className="focus-ring hover:text-wine" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-medium text-charcoal">{t("footer.followUs")}</h4>
            <div className="flex gap-3">
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 text-charcoal hover:border-wine hover:text-wine"
                >
                  <InstagramIcon size={16} />
                </a>
              )}
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 text-charcoal hover:border-wine hover:text-wine"
                >
                  <FacebookIcon size={16} />
                </a>
              )}
              {settings.googleBusinessUrl && (
                <a
                  href={settings.googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Business"
                  className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-charcoal/15 text-charcoal hover:border-wine hover:text-wine"
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
                  </svg>
                </a>
              )}
            </div>
            <h4 className="mb-3 mt-6 text-sm font-medium text-charcoal">{t("footer.legal")}</h4>
            <ul className="space-y-2.5 text-sm text-warmgray">
              <li><Link className="focus-ring hover:text-wine" to="/privacy-policy">{t("footer.privacyPolicy")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/terms">{t("footer.terms")}</Link></li>
              <li><Link className="focus-ring hover:text-wine" to="/returns">{t("footer.refundPolicy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-charcoal/10 pt-6 text-center text-xs text-warmgray">
          © {year} {settings.businessName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
