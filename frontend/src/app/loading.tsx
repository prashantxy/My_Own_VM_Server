export default function Loading() {
  return (
    <div className="space-y-16" aria-busy="true" aria-label="Loading">
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-96 max-w-full rounded-lg bg-surface motion-safe:animate-pulse" />
          <div className="h-5 w-80 max-w-full rounded bg-surface" />
        </div>
        <div className="h-[8.5rem] rounded-2xl bg-surface shadow-card" />
      </div>
      <div className="space-y-4">
        <div className="h-6 w-32 rounded bg-surface" />
        <div className="h-48 rounded-xl bg-surface shadow-card motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
