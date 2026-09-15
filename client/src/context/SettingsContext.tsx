import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "../lib/api";
import { BusinessSettings } from "../types";

const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "3S Saree",
  logo: "",
  description: "",
  whatsappNumber: "910000000000",
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
  address: "",
  city: "",
  businessHours: "",
  aboutText: "",
  yearsOfExperience: "",
  heroImage: "",
  heroHeading: "Discover Elegance",
  heroSubheading: "Handpicked Sarees for Every Occasion",
  heroTagline: "Tradition, woven beautifully for the modern woman.",
  footerText: "",
  ownerImage: "",
  ownerName: "",
  announcementText: "",
  announcementLink: "",
  announcementColor: "#5f1526",
  announcementEnabled: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  googleAnalyticsId: "",
  lowStockThreshold: 0,
  adminNotificationEmail: "",
  googleBusinessUrl: "",
  homepageSections: [
    { id: "hero", type: "hero", enabled: true, order: 0 },
    { id: "why-us", type: "why-us", enabled: true, order: 1 },
    { id: "categories", type: "categories", enabled: true, order: 2 },
    { id: "featured", type: "featured", enabled: true, order: 3 },
    { id: "new-arrivals", type: "new-arrivals", enabled: true, order: 4 },
    { id: "our-story", type: "our-story", enabled: true, order: 5 },
    { id: "testimonials", type: "testimonials", enabled: true, order: 6 },
    { id: "cta", type: "cta", enabled: true, order: 7 },
  ],
};

interface SettingsContextValue {
  settings: BusinessSettings;
  loading: boolean;
  refresh: () => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refresh: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get<BusinessSettings>("/settings")
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
