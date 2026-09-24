"use server";

import { redirect } from "next/navigation";
import { createDeployment } from "@/lib/api";

export interface DeployState {
  error?: string;
  repoUrl?: string;
}

export async function deploy(_prev: DeployState, formData: FormData): Promise<DeployState> {
  const repoUrl = String(formData.get("repoUrl") ?? "").trim();

  let url: URL;
  try {
    url = new URL(repoUrl);
  } catch {
    return { error: "Enter the full repository URL, starting with https://", repoUrl };
  }
  if (url.protocol !== "https:") {
    return { error: "Use an https:// URL. SSH and git:// URLs aren’t supported.", repoUrl };
  }

  let result: Awaited<ReturnType<typeof createDeployment>>;
  try {
    result = await createDeployment(url.href);
  } catch {
    return { error: "Unable to reach the deploy API. Try again in a moment.", repoUrl };
  }
  if ("error" in result) return { error: result.error, repoUrl };

  redirect(`/deployments/${result.id}`);
}

export async function redeploy(repoUrl: string): Promise<DeployState> {
  let result: Awaited<ReturnType<typeof createDeployment>>;
  try {
    result = await createDeployment(repoUrl);
  } catch {
    return { error: "Unable to reach the deploy API. Try again in a moment." };
  }
  if ("error" in result) return { error: result.error };

  redirect(`/deployments/${result.id}`);
}
