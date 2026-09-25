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
    <div className={`${container} space-y-8 pt-10 pb-20 sm:pt-14`}>
      <div className="enter flex flex-wrap items-end justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
        <div className="space-y-1">
          <h1 className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2rem]">Deployments</h1>
          <p className="text-muted">Every build, newest first.</p>
        </div>
        <DeployLink className={buttonClass("primary", "ps-3 pe-3.5")}>
          <Plus aria-hidden strokeWidth={2} className="size-4" />
          New deployment
        </DeployLink>
      </div>

      <section aria-label="Deployment list" className="space-y-4">
        {deployments && deployments.length > 0 && <FilterTabs active={filter} counts={counts} />}

        {deployments === null ? (
          <div role="alert" className="flex items-start gap-3 rounded-xl bg-surface p-4 text-sm shadow-card">
            <TriangleAlert aria-hidden strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-danger" />
            <div>
              <p className="font-medium">Unable to load deployments</p>
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
