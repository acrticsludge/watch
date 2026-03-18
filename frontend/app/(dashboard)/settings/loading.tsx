export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-white/4 rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-6 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
