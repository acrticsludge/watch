export default function AlertsLoading() {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-36 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-white/4 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-[#111] border border-white/6 rounded-xl overflow-hidden">
        <div className="border-b border-white/6 bg-white/2 px-5 py-3 grid grid-cols-5 gap-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-4 border-b border-white/4 grid grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-14 bg-white/4 rounded animate-pulse" />
            </div>
            <div className="h-3.5 w-24 bg-white/5 rounded animate-pulse self-center" />
            <div className="h-5 w-12 bg-white/5 rounded-full animate-pulse self-center" />
            <div className="h-3.5 w-16 bg-white/5 rounded animate-pulse self-center" />
            <div className="h-3 w-20 bg-white/4 rounded animate-pulse self-center" />
          </div>
        ))}
      </div>
    </div>
  );
}
