export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading deployment">
      <div className="space-y-5">
        <div className="h-8 w-28 rounded-lg bg-surface" />
        <div className="space-y-2">
          <div className="h-9 w-64 max-w-full rounded-lg bg-surface motion-safe:animate-pulse" />
          <div className="h-4 w-16 rounded bg-surface" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded-lg bg-surface" />
        <div className="h-9 w-24 rounded-lg bg-surface" />
      </div>
      <div className="aspect-[16/10] rounded-2xl bg-surface shadow-card motion-safe:animate-pulse" />
    </div>
  );
}
