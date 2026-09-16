import { useRef, useEffect, useState } from "react";

interface Props {
  src?: string;
  poster?: string;
  fallbackImage?: string;
  overlay?: boolean;
  className?: string;
}

export default function VideoBackground({
  src = "/bg-video.mp4",
  poster,
  fallbackImage,
  overlay = true,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    function tryPlay() {
      video!.play().then(() => setPlaying(true)).catch(() => {});
    }

    video.addEventListener("canplay", tryPlay, { once: true });
    video.addEventListener("loadeddata", tryPlay, { once: true });

    if (video.readyState >= 2) tryPlay();

    function onInteract() {
      tryPlay();
      document.removeEventListener("click", onInteract);
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("scroll", onInteract);
    }
    document.addEventListener("click", onInteract);
    document.addEventListener("touchstart", onInteract);
    document.addEventListener("scroll", onInteract);

    return () => {
      document.removeEventListener("click", onInteract);
      document.removeEventListener("touchstart", onInteract);
      document.removeEventListener("scroll", onInteract);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Video — always present, fades in when playing */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Fallback image — always visible BEHIND the video, so hero is never empty */}
      {fallbackImage ? (
        <img
          src={fallbackImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        // If no fallback image either, show a saree-themed gradient
        <div className="absolute inset-0 bg-gradient-to-br from-[#4a1942] via-[#2d1b38] to-[#1a0f1e]" />
      )}

      {/* Dark overlay for text readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-charcoal/30" />
      )}
    </div>
  );
}
