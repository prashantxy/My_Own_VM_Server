import Link from "next/link";
import { DeployForm } from "@/components/deploy-form";
import { StatusBadge } from "@/components/status-badge";
import { listDeployments, siteUrl, type Deployment } from "@/lib/api";
import { repoName, timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Home() {
  let deployments: Deployment[] | null = null;
  try {
    deployments = await listDeployments();
  } catch {
    deployments = null;
  }

  return (
    <div className="space-y-14">
      <section className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Deploy a frontend</h1>
          <p className="max-w-xl text-muted">
            Paste a Git repository. It gets built on GitHub Actions, uploaded to R2 and served on its own
            subdomain.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <DeployForm />
        </div>
      </section>

      <section id="deployments" className="scroll-mt-20 space-y-4">
        <h2 className="text-lg font-semibold">Deployments</h2>
        {deployments === null ? (
          <Empty>Couldn&apos;t load deployments. Check that API_URL points at the API worker.</Empty>
        ) : deployments.length === 0 ? (
          <Empty>No deployments yet. Your first one will show up here.</Empty>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {deployments.map(d => {
              const url = siteUrl(d.id);
              return (
                <li key={d.id}>
                  <Link
                    href={`/deployments/${d.id}`}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-surface sm:grid-cols-[1fr_7rem_6rem]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{repoName(d.repoUrl)}</p>
                      <p className="truncate font-mono text-xs text-muted">
                        {url ? url.replace("https://", "") : d.id}
                      </p>
                    </div>
                    <StatusBadge status={d.status} />
                    <span className="col-span-2 text-xs text-muted sm:col-span-1 sm:text-right sm:text-sm">
                      {timeAgo(d.createdAt ?? d.updatedAt)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
      {children}
    </p>
  );
}
