export function HeroDemoLoader() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-xl overflow-hidden border border-white/[0.07] shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <video
          src="/StackwatchDemo.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full block"
          style={{ aspectRatio: "16/9" }}
        />
      </div>
    </div>
  );
}
