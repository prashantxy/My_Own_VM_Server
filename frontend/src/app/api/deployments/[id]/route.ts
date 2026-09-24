import { getDeployment, siteUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

// Polled by the deployment page while a build is running.
export async function GET(_req: Request, ctx: RouteContext<"/api/deployments/[id]">) {
  const { id } = await ctx.params;
  try {
    const deployment = await getDeployment(id);
    if (!deployment) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ...deployment, siteUrl: siteUrl(id) });
  } catch {
    return Response.json({ error: "API unavailable" }, { status: 502 });
  }
}
