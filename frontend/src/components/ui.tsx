import { LoaderCircle } from "lucide-react";

const base =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium whitespace-nowrap " +
  "transition-[scale,background-color,box-shadow,opacity] duration-150 ease-out active:scale-[0.96] " +
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

const variants = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-background text-foreground shadow-card hover:shadow-card-hover hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
} as const;

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
