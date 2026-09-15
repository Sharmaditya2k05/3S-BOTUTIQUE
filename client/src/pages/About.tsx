import { useSettings } from "../context/SettingsContext";

export default function About() {
  const { settings } = useSettings();

  return (
    <div>
      <div className="border-b border-charcoal/10 bg-ivory-dark py-14 text-center">
        <p className="mb-2 text-xs font-medium tracking-[0.2em] text-gold">OUR STORY</p>
        <h1 className="font-serif-display text-4xl text-charcoal sm:text-5xl">About Us</h1>
      </div>

      <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="aspect-[4/5] overflow-hidden bg-ivory-dark">
          {settings.heroImage && (
            <img src={settings.heroImage} alt={settings.businessName} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h2 className="font-serif-display text-3xl italic text-wine">
            Every Saree Has a Story
          </h2>
          <p className="mt-5 leading-relaxed text-warmgray">{settings.aboutText}</p>
          {settings.ownerImage && (
            <div className="mt-6 flex items-center gap-4">
              <img
                src={settings.ownerImage}
                alt={settings.ownerName || "Owner"}
                className="h-16 w-16 rounded-full border-2 border-wine/20 object-cover"
              />
              {settings.ownerName && (
                <div>
                  <p className="font-medium text-charcoal">{settings.ownerName}</p>
                  <p className="text-xs text-warmgray">Founder, {settings.businessName}</p>
                </div>
              )}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-8 border-t border-charcoal/10 pt-6">
            {settings.city && (
              <div>
                <p className="text-xs uppercase tracking-wide text-warmgray">Based In</p>
                <p className="mt-1 text-charcoal">{settings.city}</p>
              </div>
            )}
            {settings.yearsOfExperience && (
              <div>
                <p className="text-xs uppercase tracking-wide text-warmgray">Experience</p>
                <p className="mt-1 text-charcoal">{settings.yearsOfExperience}</p>
              </div>
            )}
            {settings.businessHours && (
              <div>
                <p className="text-xs uppercase tracking-wide text-warmgray">Business Hours</p>
                <p className="mt-1 text-charcoal">{settings.businessHours}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
