import { container } from "@/components/ui";

export default function Loading() {
  return (
    <div className={`${container} space-y-6 pt-8 pb-20 sm:pt-10`} aria-busy="true" aria-label="Loading deployment">
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
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
        <div className="aspect-[16/10] rounded-2xl bg-surface shadow-card motion-safe:animate-pulse" />
        <div className="hidden space-y-5 lg:block">
          <div className="h-10 rounded bg-surface" />
          <div className="h-10 rounded bg-surface" />
          <div className="h-10 rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}
