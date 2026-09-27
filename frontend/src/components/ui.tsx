import { LoaderCircle } from "lucide-react";

// Capsule buttons. Press feedback lands on pointer-down (scale on :active) and settles on a spring.
const base =
  "inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-callout font-medium whitespace-nowrap select-none " +
  "transition-[scale,background-color,color,box-shadow,opacity] duration-200 ease-spring-snappy active:scale-[0.96] " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants = {
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary: "bg-fill text-foreground hover:bg-fill-strong",
  ghost: "text-accent hover:bg-fill",
  // For use on the dark closing card.
  inverse: "bg-white text-[#1d1d1f] hover:bg-white/90",
  "inverse-outline": "text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.32)] hover:bg-white/10",
} as const;

// Shared page width: header, footer and every page line up on the same edges.
export const container = "mx-auto w-full max-w-[980px] px-4 sm:px-6";
export const containerWide = "mx-auto w-full max-w-[1120px] px-4 sm:px-6";

export function buttonClass(variant: keyof typeof variants = "secondary", extra = "") {
  return `${base} ${variants[variant]} ${extra}`;
}

export function Spinner({ className = "size-4" }: { className?: string }) {
  return <LoaderCircle aria-hidden strokeWidth={2} className={`${className} animate-spin`} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-fill px-1.5 py-px font-mono text-[0.8125rem] text-foreground">{children}</code>;
}

/*
 * iOS inset grouped list: rows sit on one rounded surface, separated by hairlines that start at the
 * text, not at the edge. `inset` is the separator's start offset, so it lines up with the row's text.
 */
export const groupedList = "overflow-hidden rounded-[22px] bg-elevated shadow-card";
export function groupedRow(inset = "before:start-4") {
  return `relative before:absolute before:end-0 before:top-0 before:h-px before:bg-separator first:before:hidden ${inset}`;
}

// macOS window chrome: traffic lights and a centered title. Decorative.
export function WindowBar({ title, className = "" }: { title: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-9 items-center gap-3 px-3.5 ${className}`}>
      <span aria-hidden className="flex gap-2">
        <span className="size-3 rounded-full bg-[#ff5f57] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
        <span className="size-3 rounded-full bg-[#febc2e] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
        <span className="size-3 rounded-full bg-[#28c840] shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.12)]" />
      </span>
      <span className="min-w-0 flex-1 truncate text-center text-footnote font-medium text-muted">{title}</span>
      <span aria-hidden className="w-[52px]" />
    </div>
  );
}

// Section heading in Apple's two-part form: a statement, then a quieter clause.
export function SectionHeading({
  id,
  eyebrow,
  title,
  quiet,
  children,
  align = "start",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  quiet?: string;
  children?: React.ReactNode;
  align?: "start" | "center";
}) {
  const center = align === "center";
  return (
    <div className={`space-y-4 ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      {eyebrow && <p className="text-callout font-semibold text-accent">{eyebrow}</p>}
      <h2 id={id} data-split className="two-tone text-headline text-balance">
        {title}
        {quiet && <span> {quiet}</span>}
      </h2>
      {children && (
        <p data-reveal className={`text-lede text-pretty text-muted ${center ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
          {children}
        </p>
      )}
    </div>
  );
}
