import { ArrowUpRight, Check } from "lucide-react";

// Illustrative build run for the hero. Decorative: the real flow is described in text below it.
const lines = [
  { step: "Clone", cmd: "git clone --depth 1", time: "0.9s" },
  { step: "Install", cmd: "npm install", time: "11.2s" },
  { step: "Build", cmd: "npm run build → dist/", time: "7.4s" },
  { step: "Upload", cmd: "aws s3 sync → R2", time: "1.3s" },
];

export function DeployRun({ domain }: { domain: string }) {
  const host = `a7k2x.${domain}`;

  return (
    <div aria-hidden className="rounded-2xl bg-surface p-1.5 shadow-card select-none">
      <div className="flex h-8 items-center gap-3 px-2.5">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-xs text-muted">build · a7k2x</span>
        <span className="w-[2.625rem]" />
      </div>

      <div className="rounded-[10px] bg-background p-4 font-mono text-[0.8125rem] leading-7 shadow-card sm:p-5">
        <ol>
          {lines.map((line, i) => (
            <li
              key={line.step}
              style={{ "--d": i } as React.CSSProperties}
              className="run-line grid grid-cols-[1rem_4.25rem_minmax(0,1fr)_auto] items-center gap-x-3"
            >
              <Check strokeWidth={2.5} className="size-3.5 text-success" />
              <span>{line.step}</span>
              <span className="truncate text-muted">{line.cmd}</span>
              <span className="text-muted tabular-nums">{line.time}</span>
            </li>
          ))}
        </ol>

        <div
          style={{ "--d": lines.length } as React.CSSProperties}
          className="run-line mt-3 flex items-center gap-3 border-t border-border pt-3"
        >
          <span className="relative flex size-3.5 items-center justify-center">
            <span className="absolute size-2 rounded-full bg-success/40 motion-safe:animate-ping" />
            <span className="size-2 rounded-full bg-success" />
          </span>
          <span className="w-[4.25rem]">Live</span>
          <span className="flex min-w-0 items-center gap-1 text-foreground">
            <span className="truncate underline decoration-border underline-offset-4">{host}</span>
            <ArrowUpRight strokeWidth={2} className="size-3.5 shrink-0 text-muted" />
          </span>
        </div>
      </div>

      <div
        style={{ "--d": lines.length + 1 } as React.CSSProperties}
        className="run-line flex h-9 items-center justify-between px-2.5 text-xs"
      >
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Ready
        </span>
        <span className="font-mono text-muted tabular-nums">20.8s total</span>
      </div>
    </div>
  );
}
