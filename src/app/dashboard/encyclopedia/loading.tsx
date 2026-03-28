export default function EncyclopediaLoading() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 h-8 w-52 rounded bg-white/10 animate-pulse" />
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
