"use client";

import { useEffect, useState } from "react";
import type { Deployment } from "@/lib/api";
import { duration, repoName, timeAgo } from "@/lib/format";
import { StatusBadge } from "./status-badge";

type LiveDeployment = Deployment & { siteUrl: string | null };

const POLL_MS = 3000;

const steps = [
  { key: "queued", label: "Queued", detail: "Build started on GitHub Actions" },
  { key: "build", label: "Build", detail: "git clone, npm install, npm run build" },
  { key: "upload", label: "Upload", detail: "Build output synced to R2" },
  { key: "live", label: "Live", detail: "Served from the edge" },
] as const;

export function DeploymentLive({ initial }: { initial: LiveDeployment }) {
  const [deployment, setDeployment] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [pollError, setPollError] = useState(false);

  useEffect(() => {
    if (deployment.status !== "queued") return;
    const timer = setInterval(async () => {
      setNow(Date.now());
      try {
        const res = await fetch(`/api/deployments/${deployment.id}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        setDeployment(await res.json());
        setPollError(false);
      } catch {
        setPollError(true);
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [deployment.id, deployment.status]);

  const { status } = deployment;
  // The API only reports queued -> deployed|failed, so the middle steps show as in-progress together.
  const doneCount = status === "deployed" ? steps.length : 1;
  const elapsed =
    status === "queued"
      ? duration(deployment.createdAt, new Date(now).toISOString())
      : duration(deployment.createdAt, deployment.updatedAt);

  return (
    <div className="space-y-8">
      <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        <Field label="Status">
          <StatusBadge status={status} />
        </Field>
        <Field label="Duration">
          <span suppressHydrationWarning className="font-mono text-sm">{elapsed || "—"}</span>
        </Field>
        <Field label="Created">
          <span suppressHydrationWarning className="text-sm">{timeAgo(deployment.createdAt, now)}</span>
        </Field>
        <Field label="Repository" wide>
          {deployment.repoUrl ? (
            <a href={deployment.repoUrl} target="_blank" rel="noreferrer" className="truncate font-mono text-sm hover:underline">
              {repoName(deployment.repoUrl)}
            </a>
          ) : (
            <span className="text-sm text-muted">—</span>
          )}
        </Field>
        <Field label="Domain" wide>
          {status === "deployed" && deployment.siteUrl ? (
            <a href={deployment.siteUrl} target="_blank" rel="noreferrer" className="truncate font-mono text-sm text-blue-600 hover:underline dark:text-blue-400">
              {deployment.siteUrl.replace("https://", "")}
            </a>
          ) : (
            <span className="font-mono text-sm text-muted">{deployment.siteUrl?.replace("https://", "") ?? "SITES_DOMAIN not set"}</span>
          )}
        </Field>
      </div>

      <ol className="space-y-0">
        {steps.map((step, i) => {
          const failedHere = status === "failed" && i === 1;
          const done = i < doneCount && !failedHere;
          const active = status === "queued" && i === 1;
          const skipped = status === "failed" && i > 1;
          return (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && (
                <span className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-border" aria-hidden />
              )}
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                  failedHere
                    ? "border-red-500 bg-red-500 text-white"
                    : done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? "border-amber-400"
                        : "border-border text-muted"
                }`}
                aria-hidden
              >
                {failedHere ? "✕" : done ? "✓" : active ? <span className="size-2 animate-pulse rounded-full bg-amber-400" /> : i + 1}
              </span>
              <div className={skipped ? "opacity-40" : ""}>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-sm text-muted">{failedHere ? "Build or upload failed. Check the GitHub Actions run logs." : step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {status === "deployed" && deployment.siteUrl && (
        <a
          href={deployment.siteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background hover:opacity-85"
        >
          Visit site ↗
        </a>
      )}

      {pollError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">Lost contact with the API, retrying…</p>
      )}
    </div>
  );
}

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`min-w-0 bg-background p-4 ${wide ? "sm:col-span-3" : ""}`}>
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">{label}</p>
      <div className="flex min-w-0">{children}</div>
    </div>
  );
}
