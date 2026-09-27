import { container } from "@/components/ui";

const block = "rounded-[10px] bg-fill";

export default function Loading() {
  return (
    <div className={`${container} space-y-7 pt-6 pb-24 sm:pt-8`} aria-busy="true" aria-label="Loading deployment">
      <div className="space-y-5">
        <div className="h-9 w-36 rounded-full bg-fill" />
        <div className="space-y-2.5">
          <div className={`${block} h-10 w-72 max-w-full motion-safe:animate-pulse`} />
          <div className={`${block} h-4 w-16`} />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-20 rounded-full bg-fill" />
        <div className="h-9 w-28 rounded-full bg-fill" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <div className="aspect-[16/10] rounded-[14px] bg-canvas shadow-window motion-safe:animate-pulse" />
        <div className="hidden space-y-8 lg:block">
          <div className="h-56 rounded-[22px] bg-elevated shadow-card" />
          <div className="h-48 rounded-[22px] bg-elevated shadow-card" />
        </div>
      </div>
    </div>
  );
}
