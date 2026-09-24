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
    return { error: "Enter a full repository URL, like https://github.com/user/repo", repoUrl };
  }
  if (url.protocol !== "https:") {
    return { error: "Only https:// repository URLs are supported", repoUrl };
  }

  let result: Awaited<ReturnType<typeof createDeployment>>;
  try {
    result = await createDeployment(url.href);
  } catch {
    return { error: "Could not reach the deploy API. Try again in a moment.", repoUrl };
  }
  if ("error" in result) return { error: result.error, repoUrl };

  redirect(`/deployments/${result.id}`);
}
