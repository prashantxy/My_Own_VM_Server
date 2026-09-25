import Link from "next/link";
import { ArrowUpRight, Rocket } from "lucide-react";
import type { Deployment, Status } from "@/lib/api";
import { repoName } from "@/lib/format";
import { StatusIcon, statusMeta } from "./status-badge";
import { DeployLink } from "./site-nav";
import { TimeAgo } from "./time-ago";
import { buttonClass } from "./ui";

export type Filter = "all" | Status;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deployed", label: "Ready" },
  { key: "queued", label: "Building" },
  { key: "failed", label: "Error" },
];

export function FilterTabs({ active, counts }: { active: Filter; counts: Record<Filter, number> }) {
  return (
    <nav aria-label="Filter deployments" className="flex gap-1 overflow-x-auto rounded-[10px] bg-surface p-0.5 shadow-card">
      {filters.map(f => {
        const current = f.key === active;
        return (
          <Link
            key={f.key}
            href={f.key === "all" ? "/deployments" : `/deployments?status=${f.key}`}
            scroll={false}
            aria-current={current ? "page" : undefined}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ${
              current ? "bg-background font-medium text-foreground shadow-card" : "text-muted hover:text-foreground"
            }`}
          >
            {f.label}
            <span className="text-xs text-muted tabular-nums">{counts[f.key]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DeploymentList({ items }: { items: (Deployment & { siteUrl: string | null })[] }) {
  return (
    <ul className="overflow-hidden rounded-xl bg-background shadow-card">
      {items.map((d, i) => {
        const host = d.siteUrl?.replace("https://", "");
        return (
          <li
            key={d.id}
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
            className="enter group relative flex items-center gap-3 border-b border-border px-4 py-3.5 transition-colors duration-150 last:border-b-0 hover:bg-surface"
          >
            <StatusIcon status={d.status} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/deployments/${d.id}`}
                className="block truncate font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-xl focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
              >
                {repoName(d.repoUrl)}
                <span className="sr-only">, {statusMeta[d.status].label}</span>
              </Link>
              <p className="truncate font-mono text-[0.8125rem] text-muted">{host ?? d.id}</p>
            </div>
            <span aria-hidden className={`hidden w-16 text-sm font-medium sm:block ${statusMeta[d.status].tone}`}>
              {statusMeta[d.status].label}
            </span>
            <TimeAgo iso={d.createdAt ?? d.updatedAt} className="hidden w-16 text-end text-sm text-muted sm:block" />
            {d.status === "deployed" && d.siteUrl ? (
              <a
                href={d.siteUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${host} in a new tab`}
                className="relative z-10 -me-1.5 inline-flex size-9 items-center justify-center rounded-lg text-muted transition-[background-color,color] duration-150 hover:bg-background hover:text-foreground"
              >
                <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-4" />
              </a>
            ) : (
              <span className="-me-1.5 size-9" aria-hidden />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-surface px-6 py-14 text-center shadow-card">
      <span className="mb-4 flex size-10 items-center justify-center rounded-[10px] bg-background shadow-card">
        <Rocket aria-hidden strokeWidth={1.5} className="size-5 text-muted" />
      </span>
      <p className="font-medium">{filtered ? "Nothing here" : "No deployments yet"}</p>
      <p className="mt-1 max-w-xs text-sm text-pretty text-muted">
        {filtered ? "No deployments match this filter." : "Deploy a repository and it will show up here."}
      </p>
      {filtered ? (
        <Link href="/deployments" scroll={false} className="mt-4 text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground">
          Show all deployments
        </Link>
      ) : (
        <DeployLink className={buttonClass("primary", "mt-5")}>Deploy a repository</DeployLink>
      )}
    </div>
  );
}
