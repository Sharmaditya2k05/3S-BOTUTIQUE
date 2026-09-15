import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Gem, ShieldCheck, MessageCircleHeart, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { Product, Category } from "../types";
import { useSettings } from "../context/SettingsContext";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton } from "../components/LoadingSkeleton";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";
import { useMeta } from "../lib/useMeta";
import Testimonials from "../components/Testimonials";
import { useLanguage } from "../context/LanguageContext";

const WHY_CARDS = [
  {
    icon: Gem,
    titleKey: "home.why.handpicked.title",
    bodyKey: "home.why.handpicked.body",
  },
  {
    icon: ShieldCheck,
    titleKey: "home.why.quality.title",
    bodyKey: "home.why.quality.body",
  },
  {
    icon: MessageCircleHeart,
    titleKey: "home.why.personal.title",
    bodyKey: "home.why.personal.body",
  },
  {
    icon: Sparkles,
    titleKey: "home.why.whatsapp.title",
    bodyKey: "home.why.whatsapp.body",
  },
];

const DEFAULT_SECTIONS = [
  { id: "hero", type: "hero", enabled: true, order: 0 },
  { id: "why-us", type: "why-us", enabled: true, order: 1 },
  { id: "categories", type: "categories", enabled: true, order: 2 },
  { id: "featured", type: "featured", enabled: true, order: 3 },
  { id: "new-arrivals", type: "new-arrivals", enabled: true, order: 4 },
  { id: "our-story", type: "our-story", enabled: true, order: 5 },
  { id: "testimonials", type: "testimonials", enabled: true, order: 6 },
  { id: "cta", type: "cta", enabled: true, order: 7 },
];

export default function Home() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Category[]>("/categories?withCounts=true"),
      api.get<Product[]>("/products?featured=true&sort=newest"),
      api.get<Product[]>("/products?newArrival=true&sort=newest"),
    ])
      .then(([cats, feat, arr]) => {
        setCategories(Array.isArray(cats) ? cats.slice(0, 6) : []);
        const featList = Array.isArray(feat) ? feat : (feat as any).products ?? [];
        const arrList = Array.isArray(arr) ? arr : (arr as any).products ?? [];
        setFeatured(featList.slice(0, 8));
        setNewArrivals(arrList.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  const sections = useMemo(() => {
    const list = settings.homepageSections?.length
      ? settings.homepageSections
      : DEFAULT_SECTIONS;
    return list
      .filter((s) => s.enabled)
      .slice()
      .sort((a, b) => a.order - b.order);
  }, [settings.homepageSections]);

  function renderSection(type: string) {
    switch (type) {
      case "hero":
        return (
          <section key="hero" className="relative overflow-hidden bg-ivory">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-10 lg:grid-cols-2 lg:gap-6 lg:px-8 lg:pb-24 lg:pt-14">
              <div className="order-2 lg:order-1">
                <p className="mb-4 text-xs font-medium tracking-[0.2em] text-gold">
                  {settings.businessName.toUpperCase()}
                </p>
                <h1 className="font-serif-display text-5xl leading-[1.05] text-charcoal sm:text-6xl lg:text-7xl">
                  {settings.heroHeading}
                </h1>
                <p className="mt-4 max-w-md text-lg text-warmgray">
                  {settings.heroSubheading}
                </p>
                <p className="mt-5 max-w-sm font-serif-display text-xl italic text-wine">
                  "{settings.heroTagline}"
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    to="/sarees"
                    className="focus-ring inline-flex items-center rounded-sm bg-wine px-7 py-3.5 text-sm font-semibold tracking-wide text-ivory transition hover:bg-wine-dark"
                  >
                    {t("hero.explore")}
                  </Link>
                  <a
                    href={getWhatsAppLink(settings.whatsappNumber, generateGeneralWhatsAppMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring hairline inline-flex items-center px-7 py-3.5 text-sm font-medium tracking-wide text-charcoal transition hover:border-wine hover:text-wine"
                  >
                    {t("hero.chat")}
                  </a>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm">
                  {settings.heroImage && (
                    <img
                      src={settings.heroImage}
                      alt="Featured saree drape"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        );

      case "why-us":
        return (
          <section key="why-us" className="border-y border-charcoal/10 bg-ivory-dark">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-10 lg:grid-cols-4 lg:px-8">
              {WHY_CARDS.map((c) => (
                <div key={c.titleKey} className="flex flex-col items-start gap-2.5">
                  <c.icon className="text-wine" size={22} strokeWidth={1.5} />
                  <h3 className="text-sm font-medium text-charcoal">{t(c.titleKey)}</h3>
                  <p className="text-xs leading-relaxed text-warmgray">{t(c.bodyKey)}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case "categories":
        return (
          <section key="categories" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
                {t("home.shopByCollection")}
              </h2>
              <Link to="/sarees" className="focus-ring hidden text-sm text-wine sm:inline">
                {t("common.viewAll")} &rarr;
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/5] animate-pulse bg-ivory-dark" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                {categories.map((c) => (
                  <CategoryCard key={c.id} category={c} />
                ))}
              </div>
            )}
          </section>
        );

      case "featured":
        return (
          <section key="featured" className="bg-ivory-dark/50 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <div className="mb-10 text-center">
                <p className="mb-2 text-xs font-medium tracking-[0.2em] text-gold">
                  {t("home.handpickedSelection")}
                </p>
                <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
                  {t("home.curatedForYou")}
                </h2>
              </div>
              {loading ? (
                <ProductGridSkeleton />
              ) : featured.length ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : null}
              <div className="mt-10 text-center">
                <Link
                  to="/sarees?featured=true"
                  className="focus-ring hairline inline-flex px-7 py-3 text-sm font-medium text-charcoal hover:border-wine hover:text-wine"
                >
                  {t("home.viewAllFeatured")}
                </Link>
              </div>
            </div>
          </section>
        );

      case "new-arrivals":
        if (!loading && newArrivals.length === 0) return null;
        return (
          <section key="new-arrivals" className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
                {t("home.justArrived")}
              </h2>
              <Link to="/sarees?newArrival=true" className="focus-ring hidden text-sm text-wine sm:inline">
                {t("common.viewAll")} &rarr;
              </Link>
            </div>
            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        );

      case "our-story":
        return (
          <section key="our-story" className="bg-wine text-ivory">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
              <div>
                <p className="mb-3 text-xs font-medium tracking-[0.2em] text-rose-light">
                  {t("home.ourStory")}
                </p>
                <h2 className="font-serif-display text-3xl italic sm:text-4xl">
                  {t("home.everyStory")}
                </h2>
                <p className="mt-5 max-w-lg leading-relaxed text-rose-light">
                  {settings.aboutText}
                </p>
                <Link
                  to="/about"
                  className="focus-ring mt-7 inline-flex items-center border border-ivory/40 px-7 py-3 text-sm font-medium tracking-wide text-ivory transition hover:bg-ivory hover:text-wine"
                >
                  {t("home.readOurStory")}
                </Link>
              </div>
              {settings.ownerImage && (
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={settings.ownerImage}
                    alt={settings.ownerName || "Owner"}
                    className="h-56 w-56 rounded-full border-4 border-ivory/30 object-cover shadow-lg"
                  />
                  {settings.ownerName && (
                    <p className="text-lg font-medium text-ivory">
                      Hi, I'm {settings.ownerName}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>
        );

      case "testimonials":
        return <Testimonials key="testimonials" />;

      case "cta":
        return (
          <section key="cta" className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-24">
            <h2 className="font-serif-display text-3xl text-charcoal sm:text-4xl">
              {t("home.foundSaree")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-warmgray">
              {t("home.ctaDescription")}
            </p>
            <a
              href={getWhatsAppLink(settings.whatsappNumber, generateGeneralWhatsAppMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-sm bg-[#25D366] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1fbd5a]"
            >
              {t("home.chatWhatsApp")}
            </a>
          </section>
        );

      default:
        return null;
    }
  }

  return <div>{sections.map((s) => renderSection(s.type))}</div>;
}
