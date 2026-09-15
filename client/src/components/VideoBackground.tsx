export default function VideoBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover opacity-[0.07]"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
