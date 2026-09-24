import Link from "next/link";
import { notFound } from "next/navigation";
import { DeploymentLive } from "@/components/deployment-live";
import { getDeployment, siteUrl } from "@/lib/api";
import { repoName } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/deployments/[id]">) {
  const { id } = await props.params;
  return { title: `Deployment ${id}` };
}

export default async function DeploymentPage(props: PageProps<"/deployments/[id]">) {
  const { id } = await props.params;
  const deployment = await getDeployment(id);
  if (!deployment) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-muted hover:text-foreground">
          ← All deployments
        </Link>
        <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{repoName(deployment.repoUrl)}</h1>
        <p className="font-mono text-sm text-muted">{id}</p>
      </div>
      <DeploymentLive initial={{ ...deployment, siteUrl: siteUrl(id) }} />
    </div>
  );
}
