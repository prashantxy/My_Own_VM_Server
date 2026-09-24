import type { Status } from "@/lib/api";

const styles: Record<Status, { label: string; dot: string; text: string }> = {
  queued: { label: "Building", dot: "bg-amber-400 animate-pulse", text: "text-amber-600 dark:text-amber-400" },
  deployed: { label: "Ready", dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
  failed: { label: "Error", dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-medium ${s.text}`}>
      <span className={`size-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
