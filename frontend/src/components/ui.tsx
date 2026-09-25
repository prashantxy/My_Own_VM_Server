import { LoaderCircle } from "lucide-react";

const base =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap " +
  "transition-[scale,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.96] " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

const variants = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-background text-foreground shadow-card hover:shadow-card-hover hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
  // For use on an inverted (foreground-colored) surface.
  inverse: "bg-background text-foreground hover:opacity-90",
  "inverse-outline":
    "text-background/80 shadow-[0_0_0_1px_color-mix(in_oklch,var(--background)_22%,transparent)] hover:bg-background/10 hover:text-background",
} as const;

// Shared page width: header, footer and every page line up on the same edges.
export const container = "mx-auto w-full max-w-5xl px-4 sm:px-6";

export function buttonClass(variant: keyof typeof variants = "secondary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <LoaderCircle aria-hidden strokeWidth={2} className={`${className} animate-spin`} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-[5px] bg-surface px-1 py-px font-mono text-[0.8125rem] text-foreground shadow-card">
      {children}
    </code>
  );
}
