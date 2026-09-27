import { container } from "@/components/ui";

const block = "rounded-[10px] bg-fill";

export default function Loading() {
  return (
    <div className={`${container} space-y-8 pt-10 pb-24 sm:pt-16`} aria-busy="true" aria-label="Loading deployments">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2.5">
          <div className={`${block} h-10 w-56 motion-safe:animate-pulse`} />
          <div className={`${block} h-6 w-48`} />
        </div>
        <div className="h-9 w-44 rounded-full bg-fill" />
      </div>
      <div className="space-y-4">
        <div className={`${block} h-9 w-80 max-w-full`} />
        <div className="overflow-hidden rounded-[22px] bg-elevated shadow-card">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex h-16 items-center gap-3.5 border-t border-separator px-4 first:border-t-0">
              <div className="size-[30px] rounded-[8px] bg-fill" />
              <div className="flex-1 space-y-2">
                <div className={`${block} h-3.5 w-40 rounded-md motion-safe:animate-pulse`} />
                <div className={`${block} h-3 w-28 rounded-md`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
