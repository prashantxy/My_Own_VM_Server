import { CircleCheck, CircleX, LoaderCircle, type LucideIcon } from "lucide-react";
import type { Status } from "@/lib/api";

export const statusMeta: Record<Status, { label: string; tone: string; fill: string; Icon: LucideIcon }> = {
  queued: { label: "Building", tone: "text-warning", fill: "bg-dot-warning", Icon: LoaderCircle },
  deployed: { label: "Ready", tone: "text-success", fill: "bg-dot-success", Icon: CircleCheck },
  failed: { label: "Error", tone: "text-danger", fill: "bg-dot-danger", Icon: CircleX },
};

const tileGlyph = {
  deployed: "M4 8.5 6.75 11.25 12 5.25",
  failed: "M5 5l6 6m0-6-6 6",
} as const;

// `tile` draws the status as a colored rounded square with a white glyph, like a list-row icon.
export function StatusIcon({ status, className = "size-4", tile = false }: { status: Status; className?: string; tile?: boolean }) {
  const { tone, fill, Icon } = statusMeta[status];
  if (tile) {
    return (
      <span aria-hidden className={`flex size-[30px] shrink-0 items-center justify-center rounded-[8px] text-white ${fill}`}>
        {status === "queued" ? (
          <LoaderCircle strokeWidth={2.75} className="size-4 motion-safe:animate-spin" />
        ) : (
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
            <path d={tileGlyph[status]} />
          </svg>
        )}
      </span>
    );
  }
  return (
    <Icon
      aria-hidden
      strokeWidth={2}
      className={`${className} shrink-0 ${tone} ${status === "queued" ? "motion-safe:animate-spin" : ""}`}
    />
  );
}

// Icon + text, so status never relies on color alone.
export function StatusBadge({ status }: { status: Status }) {
  const { label, tone } = statusMeta[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${tone}`}>
      <StatusIcon status={status} className="size-4" />
      {label}
    </span>
  );
}
