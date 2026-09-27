import Link from "next/link";
import { ArrowUpRight, ChevronRight, Rocket } from "lucide-react";
import type { Deployment } from "@/lib/api";
import { repoName } from "@/lib/format";
import { StatusIcon, statusMeta } from "./status-badge";
import { DeployLink } from "./site-nav";
import { TimeAgo } from "./time-ago";
import { buttonClass, groupedList, groupedRow } from "./ui";

export { FilterTabs, type Filter } from "./filter-tabs";

// Inset grouped list: one surface, hairlines that start at the text, a chevron that says "opens".
export function DeploymentList({ items }: { items: (Deployment & { siteUrl: string | null })[] }) {
  return (
    <ul className={groupedList}>
      {items.map((d, i) => {
        const host = d.siteUrl?.replace("https://", "");
        return (
          <li
            key={d.id}
            style={{ "--i": Math.min(i, 8) } as React.CSSProperties}
            className={`enter group flex min-h-16 items-center gap-3.5 ps-4 pe-2 transition-colors duration-150 hover:bg-fill/50 active:bg-fill ${groupedRow("before:start-[3.75rem]")}`}
          >
            <StatusIcon status={d.status} tile />
            <div className="min-w-0 flex-1 py-3">
              <Link
                href={`/deployments/${d.id}`}
                className="block truncate text-body font-medium outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-focus"
              >
                {repoName(d.repoUrl)}
                <span className="sr-only">, {statusMeta[d.status].label}</span>
              </Link>
              <p className="truncate text-footnote text-muted">
                <span aria-hidden className={`font-medium sm:hidden ${statusMeta[d.status].tone}`}>
                  {statusMeta[d.status].label} ·{" "}
                </span>
                <span className="font-mono">{host ?? d.id}</span>
              </p>
            </div>
            <span aria-hidden className={`hidden w-20 text-footnote font-medium sm:block ${statusMeta[d.status].tone}`}>
              {statusMeta[d.status].label}
            </span>
            <TimeAgo iso={d.createdAt ?? d.updatedAt} className="hidden w-16 text-end text-footnote text-muted sm:block" />
            {d.status === "deployed" && d.siteUrl ? (
              <a
                href={d.siteUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${host} in a new tab`}
                className="relative z-10 inline-flex size-9 items-center justify-center rounded-full text-accent transition-[background-color,scale] duration-200 ease-spring-snappy hover:bg-fill active:scale-[0.92]"
              >
                <ArrowUpRight aria-hidden strokeWidth={2} className="size-[18px]" />
              </a>
            ) : (
              <span className="size-9" aria-hidden />
            )}
            <ChevronRight aria-hidden strokeWidth={2.25} className="-ms-1 size-4 shrink-0 text-faint" />
          </li>
        );
      })}
    </ul>
  );
}

export function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-[22px] bg-elevated px-6 py-16 text-center shadow-card">
      <span className="mb-5 flex size-14 items-center justify-center rounded-[16px] bg-accent text-white">
        <Rocket aria-hidden strokeWidth={2} className="size-7" />
      </span>
      <p className="text-title">{filtered ? "Nothing here" : "No deployments yet"}</p>
      <p className="mt-1.5 max-w-xs text-callout text-pretty text-muted">
        {filtered ? "No deployments match this filter." : "Deploy a repository and it will show up here."}
      </p>
      {filtered ? (
        <Link href="/deployments" scroll={false} className={buttonClass("ghost", "mt-5")}>
          Show all deployments
        </Link>
      ) : (
        <DeployLink className={buttonClass("primary", "mt-6 h-11 px-5 text-body")}>Deploy a repository</DeployLink>
      )}
    </div>
  );
}
