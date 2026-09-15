import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X, ShoppingBag, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Logo from "./Logo";
import { useSettings } from "../context/SettingsContext";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";
import { useCustomerAuth } from "../context/CustomerAuthContext";
import { useLanguage } from "../context/LanguageContext";

const NAV_LINKS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/sarees", labelKey: "nav.sarees" },
  { to: "/sarees?newArrival=true", labelKey: "nav.newArrivals" },
  { to: "/sarees?featured=true", labelKey: "nav.featured" },
  { to: "/about", labelKey: "nav.about" },
  { to: "/blog", labelKey: "nav.blog" },
  { to: "/guide", labelKey: "nav.guide" },
  { to: "/contact", labelKey: "nav.contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { settings } = useSettings();
  const { customer } = useCustomerAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/sarees?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
        scrolled
          ? "border-charcoal/10 bg-ivory/95 backdrop-blur"
          : "border-transparent bg-ivory"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="focus-ring">
          <Logo tagline size="sm" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.labelKey}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `focus-ring text-[13px] font-medium tracking-wide transition-colors ${
                  isActive ? "text-wine" : "text-charcoal hover:text-wine"
                }`
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="focus-ring text-xs font-medium text-charcoal hover:text-wine"
          >
            {t("lang.switch")}
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search sarees"
            className="focus-ring flex h-9 w-9 items-center justify-center text-charcoal hover:text-wine"
          >
            <Search size={19} />
          </button>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="focus-ring relative flex h-9 w-9 items-center justify-center text-charcoal hover:text-wine"
          >
            <Heart size={19} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wine text-[10px] font-bold text-ivory">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            aria-label="Cart"
            className="focus-ring relative flex h-9 w-9 items-center justify-center text-charcoal hover:text-wine"
          >
            <ShoppingBag size={19} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-wine text-[10px] font-bold text-ivory">
                {totalItems}
              </span>
            )}
          </Link>
          <a
            href={getWhatsAppLink(
              settings.whatsappNumber,
              generateGeneralWhatsAppMessage()
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring hidden items-center rounded-sm bg-wine px-5 py-2.5 text-xs font-semibold tracking-wide text-ivory transition hover:bg-wine-dark sm:inline-flex"
          >
            {t("home.chatWhatsApp")}
          </a>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="focus-ring flex h-9 w-9 items-center justify-center text-charcoal lg:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/50" role="dialog" aria-modal="true">
          <div className="mx-auto mt-0 max-w-3xl bg-ivory px-5 py-8 shadow-lg lg:mt-16 lg:rounded-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-serif-display text-lg text-wine">Search Sarees</span>
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="focus-ring text-charcoal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitSearch} className="flex items-center gap-2 border-b border-charcoal/20 pb-3">
              <Search size={18} className="text-warmgray" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sarees, fabrics, colors..."
                className="focus-ring w-full bg-transparent text-base text-charcoal placeholder:text-warmgray focus:outline-none"
              />
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-ivory lg:hidden">
          <div className="flex h-[76px] items-center justify-between border-b border-charcoal/10 px-5">
            <Logo tagline size="sm" />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="focus-ring text-charcoal"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-5 py-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.labelKey}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="focus-ring border-b border-charcoal/10 py-4 text-lg text-charcoal"
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <a
              href={getWhatsAppLink(
                settings.whatsappNumber,
                generateGeneralWhatsAppMessage()
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-6 inline-flex items-center justify-center rounded-sm bg-wine px-5 py-3 text-sm font-semibold text-ivory"
            >
              {t("home.chatWhatsApp")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
