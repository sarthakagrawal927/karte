export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="h-8 w-32 animate-pulse rounded bg-white/[0.06]" />
      <div className="h-4 w-64 animate-pulse rounded bg-white/[0.06]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-white/[0.025]"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl bg-white/[0.025]"
          />
        ))}
      </div>
    </div>
  );
}
