import { Plus, TriangleAlert } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { DeploymentList, EmptyState, FilterTabs, type Filter } from "@/components/deployment-list";
import { DeployLink } from "@/components/site-nav";
import { buttonClass, container } from "@/components/ui";
import { listDeployments, siteUrl, type Deployment } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = { title: "Deployments" };

function parseFilter(value: string | string[] | undefined): Filter {
  return value === "deployed" || value === "queued" || value === "failed" ? value : "all";
}

export default async function DeploymentsPage(props: PageProps<"/deployments">) {
  const filter = parseFilter((await props.searchParams).status);

  let deployments: Deployment[] | null = null;
  try {
    deployments = await listDeployments();
  } catch {
    deployments = null;
  }

  const counts: Record<Filter, number> = { all: 0, queued: 0, deployed: 0, failed: 0 };
  for (const d of deployments ?? []) {
    counts.all++;
    counts[d.status]++;
  }
  const visible = (deployments ?? [])
    .filter(d => filter === "all" || d.status === filter)
    .map(d => ({ ...d, siteUrl: siteUrl(d.id) }));

  return (
    <div className={`${container} space-y-8 pt-10 pb-24 sm:pt-16`}>
      <div className="enter flex flex-wrap items-end justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
        <div className="space-y-1.5">
          <h1 className="text-large-title">Deployments</h1>
          <p className="text-lede text-muted">Every build, newest first.</p>
        </div>
        <DeployLink className={buttonClass("primary", "ps-3.5 pe-4")}>
          <Plus aria-hidden strokeWidth={2.5} className="size-4" />
          New deployment
        </DeployLink>
      </div>

      <section aria-label="Deployment list" className="space-y-4">
        {deployments && deployments.length > 0 && <FilterTabs active={filter} counts={counts} />}

        {deployments === null ? (
          <div role="alert" className="flex items-start gap-3.5 rounded-[22px] bg-elevated p-5 text-callout shadow-card">
            <span className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-dot-warning text-white">
              <TriangleAlert aria-hidden strokeWidth={2.25} className="size-4" />
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold">Unable to load deployments</p>
              <p className="text-pretty text-muted">
                Check that <code className="font-mono">API_URL</code> points at the API worker, then reload the page.
              </p>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <EmptyState filtered={filter !== "all" && counts.all > 0} />
        ) : (
          <DeploymentList items={visible} />
        )}
      </section>

      <AutoRefresh active={counts.queued > 0} />
    </div>
  );
}
