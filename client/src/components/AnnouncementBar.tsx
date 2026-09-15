import { useState } from "react";
import { X } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function AnnouncementBar() {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (
    dismissed ||
    !settings.announcementEnabled ||
    !settings.announcementText?.trim()
  ) {
    return null;
  }

  const content = settings.announcementLink ? (
    <a
      href={settings.announcementLink}
      className="underline underline-offset-2 hover:opacity-80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {settings.announcementText}
    </a>
  ) : (
    <span>{settings.announcementText}</span>
  );

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2 text-center text-xs font-medium text-white sm:text-sm"
      style={{ backgroundColor: settings.announcementColor || "#5f1526" }}
    >
      {content}
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-white/80 hover:text-white"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
