import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import type { Status } from "@/lib/api";

export const statusMeta: Record<Status, { label: string; tone: string; Icon: typeof CircleCheck }> = {
  queued: { label: "Building", tone: "text-warning", Icon: LoaderCircle },
  deployed: { label: "Ready", tone: "text-success", Icon: CircleCheck },
  failed: { label: "Error", tone: "text-danger", Icon: CircleX },
};

export function StatusIcon({ status, className = "size-4" }: { status: Status; className?: string }) {
  const { tone, Icon } = statusMeta[status];
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
    <span className={`inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap ${tone}`}>
      <StatusIcon status={status} className="size-3.5" />
      {label}
    </span>
  );
}
