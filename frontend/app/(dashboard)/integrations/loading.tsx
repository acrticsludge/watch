export default function IntegrationsLoading() {
  return (
    <div>
      <div className="mb-8 space-y-2">
        <div className="h-7 w-36 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-white/4 rounded animate-pulse" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-5 h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
