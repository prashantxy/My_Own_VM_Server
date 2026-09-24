import "server-only";

export type Status = "queued" | "deployed" | "failed";

export interface Deployment {
  id: string;
  status: Status;
  repoUrl?: string;
  createdAt?: string;
  updatedAt: string;
}

function apiUrl(path: string) {
  const base = process.env.API_URL;
  if (!base) throw new Error("API_URL is not set");
  return new URL(path, base);
}

export function siteUrl(id: string) {
  const domain = process.env.SITES_DOMAIN;
  return domain ? `https://${id}.${domain}` : null;
}

export async function listDeployments(): Promise<Deployment[]> {
  const res = await fetch(apiUrl("/deployments"), { cache: "no-store" });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const body = (await res.json()) as { deployments: Deployment[] };
  return body.deployments;
}

export async function getDeployment(id: string): Promise<Deployment | null> {
  const url = apiUrl("/status");
  url.searchParams.set("id", id);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const body = (await res.json()) as Partial<Deployment>;
  return body.status ? (body as Deployment) : null;
}

export async function createDeployment(repoUrl: string): Promise<{ id: string } | { error: string }> {
  const res = await fetch(apiUrl("/deploy"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !body.id) return { error: body.error ?? `API responded ${res.status}` };
  return { id: body.id };
}
