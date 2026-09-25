"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUpRight, CircleX, FileText, GitBranch, RotateCw } from "lucide-react";
import { redeploy } from "@/app/actions";
import type { Deployment, Status } from "@/lib/api";
import { duration, repoName } from "@/lib/format";
import { CopyButton } from "./copy-button";
import { StatusBadge } from "./status-badge";
import { TimeAgo } from "./time-ago";
import { buttonClass, Spinner } from "./ui";

type LiveDeployment = Deployment & { siteUrl: string | null };

const POLL_MS = 3000;

const titlePrefix: Record<Status, string> = {
  queued: "Building",
  deployed: "Ready",
  failed: "Failed",
};

const announcements: Record<Status, string> = {
  queued: "Build in progress",
  deployed: "Deployment is live",
  failed: "Deployment failed",
};

export function DeploymentLive({ initial, logsUrl }: { initial: LiveDeployment; logsUrl: string | null }) {
  const [deployment, setDeployment] = useState(initial);
  const [now, setNow] = useState(() => Date.now());
  const [pollError, setPollError] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const prevStatus = useRef(initial.status);
  const { status, siteUrl, repoUrl } = deployment;
  const building = status === "queued";

  // Tick the elapsed timer every second while building.
  useEffect(() => {
    if (!building) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [building]);

  useEffect(() => {
    if (!building) return;
    const timer = setInterval(async () => {
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
  }, [deployment.id, building]);

  useEffect(() => {
    if (prevStatus.current !== status) setAnnouncement(announcements[status]);
    prevStatus.current = status;
  }, [status]);

  // Mirror the status in the tab title, so a background tab shows when the build finishes.
  useEffect(() => {
    const base = document.title.replace(/^(Building|Ready|Failed) · /, "");
    document.title = `${titlePrefix[status]} · ${base}`;
  }, [status]);

  const elapsed = building
    ? duration(deployment.createdAt, new Date(now).toISOString())
    : duration(deployment.createdAt, deployment.updatedAt);
  const host = siteUrl?.replace("https://", "");

  return (
    <div className="space-y-8">
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="enter flex flex-wrap items-center gap-2" style={{ "--i": 1 } as React.CSSProperties}>
        {status === "deployed" && siteUrl && (
          <a href={siteUrl} target="_blank" rel="noreferrer" className={buttonClass("primary", "ps-3.5 pe-3")}>
            Visit
            <ArrowUpRight aria-hidden strokeWidth={2} className="size-4" />
          </a>
        )}
        {status === "deployed" && siteUrl && <CopyButton value={siteUrl} />}
        {repoUrl && !building && <RedeployButton repoUrl={repoUrl} />}
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
            <GitBranch aria-hidden strokeWidth={1.5} className="size-4" />
            Source
          </a>
        )}
        {logsUrl && status !== "failed" && (
          <a href={logsUrl} target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
            <FileText aria-hidden strokeWidth={1.5} className="size-4" />
            Logs
          </a>
        )}
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-12">
        <Preview deployment={deployment} elapsed={elapsed} logsUrl={logsUrl} />

        <aside aria-label="Deployment details" className="enter space-y-8" style={{ "--i": 3 } as React.CSSProperties}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-1">
            <Detail label="Status">
              <StatusBadge status={status} />
            </Detail>
            <Detail label="Duration">
              <span suppressHydrationWarning className="tabular-nums">
                {elapsed || "—"}
              </span>
            </Detail>
            <Detail label="Created">
              <TimeAgo iso={deployment.createdAt} />
            </Detail>
            <Detail label="Source">
              {repoUrl ? (
                <a href={repoUrl} target="_blank" rel="noreferrer" className="block truncate underline decoration-border underline-offset-4 hover:decoration-foreground" title={repoUrl}>
                  {repoName(repoUrl)}
                </a>
              ) : (
                "—"
              )}
            </Detail>
            <Detail label="Domain" wide>
              {host ? (
                status === "deployed" ? (
                  <a href={siteUrl!} target="_blank" rel="noreferrer" className="block truncate font-mono underline decoration-border underline-offset-4 hover:decoration-foreground">
                    {host}
                  </a>
                ) : (
                  <span className="block truncate font-mono text-muted">{host}</span>
                )
              ) : (
                <span className="text-muted">Set SITES_DOMAIN to show the site URL</span>
              )}
            </Detail>
          </dl>

          <section aria-labelledby="steps-heading" className="space-y-4 border-t border-border pt-6">
            <h2 id="steps-heading" className="text-sm font-medium">
              Build steps
            </h2>
            <Steps status={status} />
          </section>
        </aside>
      </div>

      {pollError && (
        <p className="text-sm text-warning">Lost contact with the API. Retrying…</p>
      )}
    </div>
  );
}

function Detail({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={`min-w-0 ${wide ? "col-span-2 sm:col-span-4 lg:col-span-1" : ""}`}>
      <dt className="mb-1 text-[0.8125rem] text-muted">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </div>
  );
}

function RedeployButton({ repoUrl }: { repoUrl: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await redeploy(repoUrl);
            setError(result?.error);
          })
        }
        className={buttonClass("secondary")}
      >
        {pending ? <Spinner /> : <RotateCw aria-hidden strokeWidth={2} className="size-4" />}
        Redeploy
      </button>
      {error && (
        <p role="alert" className="basis-full text-sm text-danger">
          {error}
        </p>
      )}
    </>
  );
}

function Preview({ deployment, elapsed, logsUrl }: { deployment: LiveDeployment; elapsed: string; logsUrl: string | null }) {
  const { status, siteUrl } = deployment;
  const host = siteUrl?.replace("https://", "") ?? deployment.id;

  return (
    <div className="enter rounded-2xl bg-surface p-1.5 shadow-card" style={{ "--i": 2 } as React.CSSProperties}>
      <div className="flex h-8 items-center gap-3 px-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center font-mono text-xs text-muted">{host}</span>
        <span aria-hidden className="w-[2.625rem]" />
      </div>

      <div
        className="relative aspect-[16/10] min-h-64 overflow-hidden rounded-[10px] bg-background shadow-card"
      >
        {status === "deployed" && siteUrl ? (
          <a href={siteUrl} target="_blank" rel="noreferrer" aria-label={`Open ${host} in a new tab`} className="group absolute inset-0 block rounded-[10px]">
            <iframe
              src={siteUrl}
              title={`Preview of ${host}`}
              loading="lazy"
              tabIndex={-1}
              aria-hidden
              sandbox="allow-scripts allow-same-origin"
              className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white"
            />
            <span className="absolute end-3 bottom-3 inline-flex items-center gap-1 rounded-lg bg-background/90 px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-card backdrop-blur transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
              Open site
              <ArrowUpRight aria-hidden strokeWidth={2} className="size-3.5" />
            </span>
          </a>
        ) : status === "queued" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <div aria-hidden className="progress-indeterminate absolute inset-x-0 top-0 h-0.5 bg-warning/15" />
            <Spinner className="size-5 text-warning" />
            <div>
              <p className="text-sm font-medium">Building</p>
              <p suppressHydrationWarning className="text-sm text-muted tabular-nums">
                {elapsed ? `${elapsed} elapsed` : "Starting…"}
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <CircleX aria-hidden strokeWidth={1.5} className="size-6 text-danger" />
            <div className="max-w-xs">
              <p className="text-sm font-medium">Build failed</p>
              <p className="text-sm text-pretty text-muted">
                The build or upload step didn’t finish. The workflow logs show which command failed.
              </p>
            </div>
            {logsUrl && (
              <a href={logsUrl} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
                <FileText aria-hidden strokeWidth={2} className="size-4" />
                View build logs
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const steps = [
  { label: "Queued", detail: "Workflow started on GitHub Actions" },
  { label: "Build", detail: "git clone, npm install, npm run build" },
  { label: "Upload", detail: "Build output synced to R2" },
  { label: "Live", detail: "Served from Cloudflare’s edge" },
];

type StepState = "done" | "active" | "failed" | "pending";

function stepState(status: Status, i: number): StepState {
  if (status === "deployed") return "done";
  if (i === 0) return "done";
  // The API reports only queued → deployed | failed, so Build + Upload share one in-progress state.
  if (status === "queued") return i <= 2 ? "active" : "pending";
  return i <= 2 ? (i === 1 ? "failed" : "pending") : "pending";
}

function Steps({ status }: { status: Status }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, i) => {
        const state = stepState(status, i);
        return (
          <li key={step.label} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={`absolute start-[9.5px] top-6 bottom-1 w-px ${state === "done" ? "bg-success/40" : "bg-border"}`}
              />
            )}
            <StepMarker state={state} />
            <div className={`-mt-px ${state === "pending" ? "text-muted" : ""}`}>
              <p className="text-sm font-medium">
                {step.label}
                <span className="sr-only">, {stateLabel[state]}</span>
              </p>
              <p className="text-sm text-muted">
                {state === "failed" ? "Failed. Open the build logs to see the error." : step.detail}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const stateLabel: Record<StepState, string> = {
  done: "complete",
  active: "in progress",
  failed: "failed",
  pending: "not started",
};

function StepMarker({ state }: { state: StepState }) {
  const ring = "relative flex size-5 shrink-0 items-center justify-center rounded-full";
  if (state === "done") {
    return (
      <span aria-hidden className={`${ring} bg-success text-background`}>
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.5 6.25 2.25 2.25 4.75-5" />
        </svg>
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span aria-hidden className={`${ring} bg-danger text-background`}>
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="m3.5 3.5 5 5m0-5-5 5" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span aria-hidden className={`${ring} bg-background shadow-[inset_0_0_0_1.5px_var(--warning)]`}>
        <span className="size-2 rounded-full bg-warning motion-safe:animate-pulse" />
      </span>
    );
  }
  return <span aria-hidden className={`${ring} bg-background shadow-[inset_0_0_0_1.5px_var(--border)]`} />;
}

