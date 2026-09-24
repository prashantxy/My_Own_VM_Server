import { TriangleAlert } from "lucide-react";
import { AutoRefresh } from "@/components/auto-refresh";
import { DeployForm } from "@/components/deploy-form";
import { DeploymentList, EmptyState, FilterTabs, type Filter } from "@/components/deployment-list";
import { listDeployments, siteUrl, type Deployment } from "@/lib/api";

export const dynamic = "force-dynamic";

const pipeline = ["Clone", "Build", "Upload to R2", "Live on the edge"];

function parseFilter(value: string | string[] | undefined): Filter {
  return value === "deployed" || value === "queued" || value === "failed" ? value : "all";
}

export default async function Home(props: PageProps<"/">) {
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
    <div className="space-y-16">
      <section aria-labelledby="deploy-heading" className="space-y-8">
        <div className="enter space-y-3" style={{ "--i": 0 } as React.CSSProperties}>
          <h1 id="deploy-heading" className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[2.5rem]">
            Ship a frontend from any Git repo.
          </h1>
          <p className="max-w-lg text-pretty text-muted">
            Paste a repository. It’s built on GitHub Actions, stored in R2 and served from its own subdomain on
            Cloudflare’s edge.
          </p>
        </div>

        <div className="enter rounded-2xl bg-background p-5 shadow-card sm:p-6" style={{ "--i": 1 } as React.CSSProperties}>
          <DeployForm />
        </div>

        <ol
          aria-label="What happens when you deploy"
          className="enter flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted"
          style={{ "--i": 2 } as React.CSSProperties}
        >
          {pipeline.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="flex size-5 items-center justify-center rounded-full bg-surface font-mono text-[0.6875rem] tabular-nums shadow-card">
                {i + 1}
              </span>
              {step}
              {i < pipeline.length - 1 && <span aria-hidden className="h-px w-4 bg-border" />}
            </li>
          ))}
        </ol>
      </section>

      <section id="deployments" aria-labelledby="deployments-heading" className="scroll-mt-20 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="deployments-heading" className="text-lg font-semibold tracking-tight">
            Deployments
          </h2>
          {deployments && deployments.length > 0 && <FilterTabs active={filter} counts={counts} />}
        </div>

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
