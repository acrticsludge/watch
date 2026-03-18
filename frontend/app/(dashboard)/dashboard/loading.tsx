export default function DashboardLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-white/4 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl px-4 py-3.5">
            <div className="h-3 w-14 bg-white/5 rounded animate-pulse mb-3" />
            <div className="h-7 w-8 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
        <div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-[#111] border border-white/6 rounded-xl p-5 h-48 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
