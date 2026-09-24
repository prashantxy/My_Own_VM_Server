import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DeploymentLive } from "@/components/deployment-live";
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
    <div className="space-y-6">
      <div className="enter space-y-5" style={{ "--i": 0 } as React.CSSProperties}>
        <Link
          href="/#deployments"
          className="-ms-2 inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft aria-hidden strokeWidth={1.5} className="size-4" />
          Deployments
        </Link>
        <div className="space-y-1">
          <h1 className="truncate text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[2rem]">
            {repoName(deployment.repoUrl)}
          </h1>
          <p className="font-mono text-[0.8125rem] text-muted">{id}</p>
        </div>
      </div>
      <DeploymentLive initial={{ ...deployment, siteUrl: siteUrl(id) }} logsUrl={buildLogsUrl()} />
    </div>
  );
}
