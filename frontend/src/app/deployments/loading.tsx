import { container } from "@/components/ui";

export default function Loading() {
  return (
    <div className={`${container} space-y-8 pt-10 pb-20 sm:pt-14`} aria-busy="true" aria-label="Loading deployments">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-9 w-48 rounded-lg bg-surface motion-safe:animate-pulse" />
          <div className="h-5 w-40 rounded bg-surface" />
        </div>
        <div className="h-9 w-40 rounded-lg bg-surface" />
      </div>
      <div className="space-y-4">
        <div className="h-9 w-72 max-w-full rounded-[10px] bg-surface shadow-card" />
        <div className="h-64 rounded-xl bg-surface shadow-card motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
