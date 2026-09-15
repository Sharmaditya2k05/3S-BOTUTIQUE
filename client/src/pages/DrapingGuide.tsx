import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { generateGeneralWhatsAppMessage, getWhatsAppLink } from "../lib/whatsapp";

const LENGTH_DATA = [
  { length: "5.5 meters", use: "Standard length for most draping styles like the Nivi drape. Suitable for regular-height women." },
  { length: "6 meters", use: "Provides extra fabric for pleating and pallu. Ideal for taller women or styles that need wider pleats." },
  { length: "6.3 meters", use: "Traditional Kanjivaram & bridal sarees. Extra length accommodates heavy borders and elaborate draping." },
];

const DRAPING_STYLES = [
  {
    name: "Nivi Style",
    origin: "Andhra Pradesh",
    description:
      "The most popular draping style across India. The saree is tucked at the waist, pleated at the front, and the pallu is draped over the left shoulder. Flattering for all body types and easy to manage throughout the day.",
  },
  {
    name: "Gujarati Style",
    origin: "Gujarat",
    description:
      "Similar to the Nivi drape, but the pallu is brought from the back over the right shoulder and draped across the front. The pallu end is tucked at the waist or pinned to the right shoulder, giving a distinctive front-facing display of the pallu's design.",
  },
  {
    name: "Bengali Style",
    origin: "West Bengal",
    description:
      "Draped without pleats, the saree is wrapped around the body with the pallu brought over the left shoulder and then looped back around. The key feature is the decorative 'key' fold at the front, giving the drape a graceful and fluid look.",
  },
  {
    name: "Seedha Pallu",
    origin: "Maharashtra",
    description:
      "Also called the Nauvari style in its 9-yard version, the Seedha Pallu involves tucking the saree at the back and bringing pleats to the front center. The pallu falls over the right shoulder, and the style is known for allowing ease of movement.",
  },
];

const FABRIC_CARE = [
  {
    fabric: "Silk",
    tips: "Dry clean recommended. Store in muslin cloth, away from direct sunlight. Avoid spraying perfume directly on silk. Air out after every wear.",
  },
  {
    fabric: "Cotton",
    tips: "Hand wash or gentle machine wash in cold water. Use mild detergent. Dry in shade to prevent colour fading. Iron on medium heat.",
  },
  {
    fabric: "Chiffon",
    tips: "Hand wash gently in cold water with mild soap. Do not wring or twist. Hang to dry on a padded hanger. Iron on low heat with a pressing cloth.",
  },
  {
    fabric: "Georgette",
    tips: "Hand wash in lukewarm water. Use a mild detergent. Roll in a towel to remove excess water. Iron on low while slightly damp.",
  },
  {
    fabric: "Linen",
    tips: "Hand wash or gentle machine wash. Linen softens with every wash. Iron on high while damp for a crisp look, or leave as-is for a relaxed drape.",
  },
  {
    fabric: "Organza",
    tips: "Dry clean or very gentle hand wash. Do not scrub or wring. Lay flat or hang to dry. Steam or iron on the lowest setting with a pressing cloth.",
  },
];

export default function DrapingGuide() {
  const { settings } = useSettings();

  return (
    <div className="bg-ivory pb-20">
      {/* Hero */}
      <section className="bg-wine/5 px-5 py-16 text-center lg:px-8 lg:py-24">
        <h1 className="font-serif-display text-4xl text-wine sm:text-5xl">
          Saree Size & Draping Guide
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-warmgray">
          Everything you need to know about saree lengths, blouse measurements,
          draping styles, and fabric care to look and feel your best.
        </p>
      </section>

      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        {/* Saree Length Guide */}
        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
            Saree Length Guide
          </h2>
          <p className="mt-2 text-sm text-warmgray">
            Standard sarees come in these common lengths. The right choice depends
            on your height, draping style, and personal preference.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="py-3 pr-4 text-left font-medium text-charcoal">Length</th>
                  <th className="py-3 text-left font-medium text-charcoal">Best For</th>
                </tr>
              </thead>
              <tbody>
                {LENGTH_DATA.map((row) => (
                  <tr key={row.length} className="border-b border-charcoal/5">
                    <td className="whitespace-nowrap py-3 pr-4 font-medium text-wine">
                      {row.length}
                    </td>
                    <td className="py-3 text-warmgray">{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Blouse Measurements */}
        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
            Blouse Measurements
          </h2>
          <p className="mt-2 text-sm text-warmgray">
            A well-fitted blouse elevates the entire saree look. Here are the key
            measurements you will need:
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Bust", desc: "Measure around the fullest part of the bust, keeping the tape snug but not tight." },
              { label: "Waist", desc: "Measure at your natural waistline, just above the navel." },
              { label: "Shoulder", desc: "Measure from the edge of one shoulder to the other across the back." },
              { label: "Sleeve Length", desc: "From the shoulder point to your desired sleeve end (elbow for half sleeves, wrist for full)." },
              { label: "Front Neck Depth", desc: "From the base of the neck down to where you want the neckline to fall." },
              { label: "Back Neck Depth", desc: "From the base of the neck down the back to the desired depth." },
              { label: "Blouse Length", desc: "From the shoulder to the bottom hem of the blouse (usually 14-16 inches)." },
              { label: "Armhole", desc: "Measure around the armhole for a comfortable fit that allows movement." },
            ].map((m) => (
              <div key={m.label} className="hairline bg-ivory p-4">
                <span className="text-sm font-medium text-charcoal">{m.label}</span>
                <p className="mt-1 text-xs leading-relaxed text-warmgray">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Draping Styles */}
        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
            Draping Styles
          </h2>
          <p className="mt-2 text-sm text-warmgray">
            India has over 80 recorded ways to drape a saree. Here are four of the
            most popular styles to get you started.
          </p>
          <div className="mt-6 space-y-6">
            {DRAPING_STYLES.map((style) => (
              <div key={style.name} className="hairline bg-ivory p-5">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-serif-display text-lg text-charcoal">
                    {style.name}
                  </h3>
                  <span className="text-xs text-warmgray">({style.origin})</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-warmgray">
                  {style.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Fabric Care Tips */}
        <section className="mt-16">
          <h2 className="font-serif-display text-2xl text-charcoal sm:text-3xl">
            Fabric Care Tips
          </h2>
          <p className="mt-2 text-sm text-warmgray">
            Taking proper care of your saree helps it last for years. Here are
            fabric-specific care tips.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {FABRIC_CARE.map((fc) => (
              <div key={fc.fabric} className="hairline bg-ivory p-5">
                <h3 className="text-sm font-medium text-wine">{fc.fabric}</h3>
                <p className="mt-2 text-xs leading-relaxed text-warmgray">
                  {fc.tips}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <h2 className="font-serif-display text-2xl text-charcoal">
            Need Help Choosing?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-warmgray">
            Our team is happy to help you pick the perfect saree length, fabric,
            and blouse style. Get personal assistance on WhatsApp.
          </p>
          <a
            href={getWhatsAppLink(
              settings.whatsappNumber,
              generateGeneralWhatsAppMessage()
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-6 inline-flex items-center gap-2 bg-wine px-7 py-3 text-sm font-semibold text-ivory hover:bg-wine-dark"
          >
            <MessageCircle size={16} />
            WhatsApp Us for Personal Assistance
          </a>
          <p className="mt-6">
            <Link to="/sarees" className="focus-ring text-sm text-wine underline hover:text-wine-dark">
              Browse Our Collection
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
