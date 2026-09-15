import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { api } from "../../lib/api";
import { BusinessSettings } from "../../types";
import { useSettings } from "../../context/SettingsContext";
import ImageUploader from "../../components/ImageUploader";
import { ProductImage } from "../../types";

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  "why-us": "Why Shop With Us",
  categories: "Shop by Collection",
  featured: "Curated for You (Featured)",
  "new-arrivals": "Just Arrived",
  "our-story": "Our Story",
  testimonials: "Testimonials",
  cta: "WhatsApp CTA",
};

export default function AdminSettings() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState<BusinessSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function set<K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.put("/settings", form);
      refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <p className="text-sm text-warmgray">Loading settings...</p>;

  const heroImages: ProductImage[] = form.heroImage
    ? [{ id: "hero", url: form.heroImage }]
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif-display text-3xl text-charcoal">Settings</h1>
      <p className="mt-1 text-sm text-warmgray">
        Customize your storefront without touching any code.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Announcement Bar</h2>
          <p className="text-xs text-warmgray">
            Show a banner at the top of your storefront for sales, events, or announcements.
          </p>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.announcementEnabled}
              onChange={(e) => set("announcementEnabled", e.target.checked)}
              className="h-4 w-4 accent-wine"
            />
            <span className="text-sm text-charcoal">Enable announcement bar</span>
          </label>
          <TextField
            label="Announcement Text"
            value={form.announcementText}
            onChange={(v) => set("announcementText", v)}
            placeholder="e.g. Festive Sale — 20% off all Banarasi silks!"
          />
          <TextField
            label="Link URL (optional)"
            value={form.announcementLink}
            onChange={(v) => set("announcementLink", v)}
            placeholder="https://..."
          />
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-charcoal">Background Color</span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.announcementColor || "#5f1526"}
                onChange={(e) => set("announcementColor", e.target.value)}
                className="h-9 w-12 cursor-pointer border-0 bg-transparent p-0"
              />
              <span className="text-xs text-warmgray">{form.announcementColor || "#5f1526"}</span>
            </div>
          </label>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Business Information</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Business Logo</label>
            <ImageUploader
              images={form.logo ? [{ id: "logo", url: form.logo }] : []}
              onChange={(imgs) => set("logo", imgs.slice(-1)[0]?.url || "")}
            />
          </div>
          <TextField label="Business Name" value={form.businessName} onChange={(v) => set("businessName", v)} />
          <TextArea label="Business Description" value={form.description} onChange={(v) => set("description", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
            <TextField label="Years of Experience" value={form.yearsOfExperience} onChange={(v) => set("yearsOfExperience", v)} />
          </div>
          <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
          <TextField label="Business Hours" value={form.businessHours} onChange={(v) => set("businessHours", v)} />
          <TextField
            label="Google Business Profile URL"
            value={form.googleBusinessUrl || ""}
            onChange={(v) => set("googleBusinessUrl", v)}
            placeholder="https://g.page/your-business"
          />
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Contact &amp; WhatsApp</h2>
          <TextField
            label="WhatsApp Number (with country code, digits only)"
            value={form.whatsappNumber}
            onChange={(v) => set("whatsappNumber", v)}
            placeholder="919876543210"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} />
            <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Instagram URL" value={form.instagram} onChange={(v) => set("instagram", v)} />
            <TextField label="Facebook URL" value={form.facebook} onChange={(v) => set("facebook", v)} />
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">About Us Page</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Owner Photo</label>
            <ImageUploader
              images={form.ownerImage ? [{ id: "owner", url: form.ownerImage }] : []}
              onChange={(imgs) => set("ownerImage", imgs.slice(-1)[0]?.url || "")}
            />
          </div>
          <TextField label="Owner Name" value={form.ownerName || ""} onChange={(v) => set("ownerName", v)} />
          <TextArea label="About Us Text" value={form.aboutText} onChange={(v) => set("aboutText", v)} rows={5} />
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Homepage Hero</h2>
          <TextField label="Hero Heading" value={form.heroHeading} onChange={(v) => set("heroHeading", v)} />
          <TextField label="Hero Subheading" value={form.heroSubheading} onChange={(v) => set("heroSubheading", v)} />
          <TextField label="Hero Tagline" value={form.heroTagline} onChange={(v) => set("heroTagline", v)} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Hero Image</label>
            <ImageUploader
              images={heroImages}
              onChange={(imgs) => set("heroImage", imgs.slice(-1)[0]?.url || "")}
            />
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Homepage Sections</h2>
          <p className="text-xs text-warmgray">
            Toggle sections on or off and reorder them using the arrows.
          </p>
          <div className="space-y-2">
            {(form.homepageSections || [])
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((section, idx, sorted) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between gap-3 rounded-sm border border-charcoal/10 bg-white px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={(e) => {
                          const updated = (form.homepageSections || []).map((s) =>
                            s.id === section.id ? { ...s, enabled: e.target.checked } : s
                          );
                          set("homepageSections", updated);
                        }}
                        className="h-4 w-4 accent-wine"
                      />
                      <span className="text-sm text-charcoal">
                        {SECTION_LABELS[section.type] || section.type}
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const prev = sorted[idx - 1];
                        const updated = (form.homepageSections || []).map((s) => {
                          if (s.id === section.id) return { ...s, order: prev.order };
                          if (s.id === prev.id) return { ...s, order: section.order };
                          return s;
                        });
                        set("homepageSections", updated);
                      }}
                      className="rounded p-1 text-warmgray hover:bg-ivory-dark hover:text-charcoal disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sorted.length - 1}
                      onClick={() => {
                        const next = sorted[idx + 1];
                        const updated = (form.homepageSections || []).map((s) => {
                          if (s.id === section.id) return { ...s, order: next.order };
                          if (s.id === next.id) return { ...s, order: section.order };
                          return s;
                        });
                        set("homepageSections", updated);
                      }}
                      className="rounded p-1 text-warmgray hover:bg-ivory-dark hover:text-charcoal disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Footer</h2>
          <TextArea label="Footer Text" value={form.footerText} onChange={(v) => set("footerText", v)} rows={2} />
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">Notifications</h2>
          <p className="text-xs text-warmgray">
            Get alerted when products are running low on stock.
          </p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-charcoal">Low Stock Threshold</span>
            <input
              type="number"
              min={0}
              value={form.lowStockThreshold ?? 0}
              onChange={(e) => set("lowStockThreshold", parseInt(e.target.value) || 0)}
              className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
            />
            <span className="mt-1 block text-xs text-warmgray">Set to 0 to disable low-stock alerts.</span>
          </label>
          <TextField
            label="Admin Notification Email"
            value={form.adminNotificationEmail || ""}
            onChange={(v) => set("adminNotificationEmail", v)}
            placeholder="admin@example.com"
          />
        </section>

        <section className="hairline space-y-4 bg-ivory p-5">
          <h2 className="text-sm font-semibold text-charcoal">SEO Settings</h2>
          <TextField
            label="SEO Title"
            value={form.seoTitle || ""}
            onChange={(v) => set("seoTitle", v)}
            placeholder="e.g. 3S Saree - Handpicked Sarees Online"
          />
          <TextArea
            label="SEO Description"
            value={form.seoDescription || ""}
            onChange={(v) => set("seoDescription", v)}
            rows={3}
          />
          <TextField
            label="SEO Keywords"
            value={form.seoKeywords || ""}
            onChange={(v) => set("seoKeywords", v)}
            placeholder="saree, silk saree, banarasi, kanjivaram"
          />
          <TextField
            label="Google Analytics ID"
            value={form.googleAnalyticsId || ""}
            onChange={(v) => set("googleAnalyticsId", v)}
            placeholder="G-XXXXXXXXXX"
          />
        </section>

        {error && <p className="text-sm text-red-700">{error}</p>}
        {saved && <p className="text-sm text-green-700">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="focus-ring bg-wine px-7 py-3 text-sm font-semibold text-ivory hover:bg-wine-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-charcoal">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-charcoal">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="focus-ring hairline w-full bg-ivory px-3.5 py-2.5 text-sm"
      />
    </label>
  );
}
