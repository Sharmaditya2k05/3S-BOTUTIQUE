import { useSettings } from "../context/SettingsContext";

interface LogoProps {
  tagline?: boolean;
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "h-11",
  md: "h-14",
  lg: "h-24",
};

export default function Logo({ size = "md" }: LogoProps) {
  const { settings } = useSettings();
  const src = settings.logo || "/logo.png";

  return (
    <img
      src={src}
      alt={`${settings.businessName || "3S Saree"} logo`}
      className={`${SIZES[size]} w-auto select-none`}
      draggable={false}
    />
  );
}
