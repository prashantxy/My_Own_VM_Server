import { ArrowDown, CornerDownLeft, Database, LayoutDashboard, Server, Workflow, Globe } from "lucide-react";

const nodes = [
  { Icon: LayoutDashboard, name: "Dashboard", tech: "Next.js on Workers", detail: "Server action posts the repo URL" },
  { Icon: Server, name: "API worker", tech: "Workers + KV", detail: "Stores status, dispatches the workflow" },
  { Icon: Workflow, name: "Build", tech: "GitHub Actions", detail: "Clone and build with no secrets" },
  { Icon: Database, name: "Storage", tech: "R2", detail: "Output synced to dist/<id>" },
  { Icon: Globe, name: "Serve worker", tech: "Workers + R2", detail: "Answers on <id>.<domain>" },
];

export function Architecture() {
  return (
    <figure className="space-y-4">
      <ol className="grid gap-6 lg:grid-cols-5">
        {nodes.map(({ Icon, name, tech, detail }, i) => (
          <li key={name} className="relative flex items-start gap-3 rounded-xl bg-background p-4 shadow-card lg:flex-col lg:gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface shadow-card">
              <Icon aria-hidden strokeWidth={1.5} className="size-4" />
            </span>
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium">{name}</p>
              <p className="font-mono text-xs text-muted">{tech}</p>
              <p className="pt-1 text-[0.8125rem] leading-snug text-pretty text-muted">{detail}</p>
            </div>
            {/* Connector sits centered in the gap: below the card when stacked, to its right in a row. */}
            {i < nodes.length - 1 && (
              <ArrowDown
                aria-hidden
                strokeWidth={1.5}
                className="absolute start-1/2 -bottom-5 size-4 -translate-x-1/2 text-muted lg:start-auto lg:-end-5 lg:top-1/2 lg:bottom-auto lg:translate-x-0 lg:-translate-y-1/2 lg:-rotate-90"
              />
            )}
          </li>
        ))}
      </ol>
      <figcaption className="flex items-start gap-2 text-[0.8125rem] text-pretty text-muted">
        <CornerDownLeft aria-hidden strokeWidth={1.5} className="mt-0.5 size-3.5 shrink-0" />
        When the workflow finishes, it reports <span className="font-mono text-foreground">deployed</span> or{" "}
        <span className="font-mono text-foreground">failed</span> back to the API through an authenticated callback.
      </figcaption>
    </figure>
  );
}
