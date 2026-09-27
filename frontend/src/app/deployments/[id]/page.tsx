import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { DeploymentLive } from "@/components/deployment-live";
import { container } from "@/components/ui";
import { buildLogsUrl, getDeployment, siteUrl } from "@/lib/api";
import { repoName } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/deployments/[id]">) {
  const { id } = await props.params;
  const deployment = await getDeployment(id).catch(() => null);
  return { title: deployment ? repoName(deployment.repoUrl) : `Deployment ${id}` };
}

export default async function DeploymentPage(props: PageProps<"/deployments/[id]">) {
  const { id } = await props.params;
  const deployment = await getDeployment(id);
  if (!deployment) notFound();

  return (
    <div className={`${container} space-y-7 pt-6 pb-24 sm:pt-8`}>
      <div className="enter space-y-5" style={{ "--i": 0 } as React.CSSProperties}>
        <Link
          href="/deployments"
          className="-ms-2 inline-flex h-9 items-center gap-0.5 rounded-full pe-3 ps-1 text-body text-accent transition-[background-color,opacity] duration-200 hover:bg-fill active:opacity-60"
        >
          <ChevronLeft aria-hidden strokeWidth={2.5} className="size-5" />
          Deployments
        </Link>
        <div className="space-y-1.5">
          <h1 className="truncate text-large-title">{repoName(deployment.repoUrl)}</h1>
          <p className="font-mono text-footnote text-muted">{id}</p>
        </div>
      </div>
      <DeploymentLive initial={{ ...deployment, siteUrl: siteUrl(id) }} logsUrl={buildLogsUrl()} />
    </div>
  );
}
