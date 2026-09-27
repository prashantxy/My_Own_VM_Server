"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowUpRight, FileText, GitBranch, Lock, RotateCw, X } from "lucide-react";
import { redeploy } from "@/app/actions";
import type { Deployment, Status } from "@/lib/api";
import { duration, repoName } from "@/lib/format";
import { CopyButton } from "./copy-button";
import { StatusBadge } from "./status-badge";
import { TimeAgo } from "./time-ago";
import { buttonClass, groupedList, groupedRow, Spinner, WindowBar } from "./ui";

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
          <a href={siteUrl} target="_blank" rel="noreferrer" className={buttonClass("primary", "ps-4 pe-3.5")}>
            Visit
            <ArrowUpRight aria-hidden strokeWidth={2.25} className="size-4" />
          </a>
        )}
        {status === "deployed" && siteUrl && <CopyButton value={siteUrl} />}
        {repoUrl && !building && <RedeployButton repoUrl={repoUrl} />}
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noreferrer" className={buttonClass("secondary")}>
            <GitBranch aria-hidden strokeWidth={2} className="size-4" />
            Source
          </a>
        )}
        {logsUrl && status !== "failed" && (
          <a href={logsUrl} target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
            <FileText aria-hidden strokeWidth={2} className="size-4" />
            Logs
          </a>
        )}
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <Preview deployment={deployment} elapsed={elapsed} logsUrl={logsUrl} />

        <aside aria-label="Deployment details" className="enter space-y-8" style={{ "--i": 3 } as React.CSSProperties}>
          <section aria-labelledby="details-heading" className="space-y-2">
            <h2 id="details-heading" className="px-4 text-footnote font-medium text-muted">
              Details
            </h2>
            <dl className={groupedList}>
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
                  <a href={repoUrl} target="_blank" rel="noreferrer" className="block truncate text-accent hover:underline hover:underline-offset-4" title={repoUrl}>
                    {repoName(repoUrl)}
                  </a>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="Domain">
                {host ? (
                  status === "deployed" ? (
                    <a href={siteUrl!} target="_blank" rel="noreferrer" className="block truncate font-mono text-footnote text-accent hover:underline hover:underline-offset-4" title={host}>
                      {host}
                    </a>
                  ) : (
                    <span className="block truncate font-mono text-footnote text-muted" title={host}>
                      {host}
                    </span>
                  )
                ) : (
                  <span className="text-muted">Set SITES_DOMAIN</span>
                )}
              </Detail>
            </dl>
          </section>

          <section aria-labelledby="steps-heading" className="space-y-2">
            <h2 id="steps-heading" className="px-4 text-footnote font-medium text-muted">
              Build steps
            </h2>
            <div className={`${groupedList} p-4`}>
              <Steps status={status} />
            </div>
          </section>
        </aside>
      </div>

      {pollError && (
        <p role="status" className="material fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-sm items-center gap-2.5 rounded-full px-4 py-2.5 text-footnote shadow-window">
          <Spinner className="size-4 text-dot-warning" />
          Lost contact with the API. Retrying…
        </p>
      )}
    </div>
  );
}

// A settings-style row: label on the leading edge, value on the trailing edge.
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`flex min-h-11 items-center justify-between gap-4 px-4 py-2.5 text-callout ${groupedRow()}`}>
      <dt className="shrink-0">{label}</dt>
      <dd className="min-w-0 text-end text-muted">{children}</dd>
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
        <p role="alert" className="basis-full text-footnote text-danger">
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
    <div className="enter overflow-hidden rounded-[14px] bg-canvas shadow-window" style={{ "--i": 2 } as React.CSSProperties}>
      <WindowBar
        className="border-b border-separator"
        title={
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-fill px-2.5 py-0.5 font-normal">
            <Lock aria-hidden strokeWidth={2.25} className="size-3 shrink-0" />
            <span className="truncate">{host}</span>
          </span>
        }
      />

      <div className="relative aspect-[16/10] min-h-64 overflow-hidden bg-elevated">
        {status === "deployed" && siteUrl ? (
          <a href={siteUrl} target="_blank" rel="noreferrer" aria-label={`Open ${host} in a new tab`} className="group absolute inset-0 block">
            <iframe
              src={siteUrl}
              title={`Preview of ${host}`}
              loading="lazy"
              tabIndex={-1}
              aria-hidden
              sandbox="allow-scripts allow-same-origin"
              className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50 border-0 bg-white"
            />
            <span className="material absolute end-3 bottom-3 inline-flex translate-y-1 items-center gap-1 rounded-full px-3.5 py-2 text-footnote font-medium opacity-0 shadow-window transition-[opacity,translate] duration-300 ease-spring group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
              Open site
              <ArrowUpRight aria-hidden strokeWidth={2.25} className="size-3.5" />
            </span>
          </a>
        ) : status === "queued" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center">
            <div aria-hidden className="progress-indeterminate absolute inset-x-0 top-0 h-0.5 bg-dot-warning/15" />
            <Spinner className="size-7 text-dot-warning" />
            <div className="space-y-0.5">
              <p className="text-title">Building</p>
              <p suppressHydrationWarning className="text-callout text-muted tabular-nums">
                {elapsed ? `${elapsed} elapsed` : "Starting…"}
              </p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-dot-danger text-white">
              <X aria-hidden strokeWidth={2.75} className="size-6" />
            </span>
            <div className="max-w-xs space-y-1">
              <p className="text-title">Build failed</p>
              <p className="text-callout text-pretty text-muted">
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
                className={`absolute start-[11px] top-7 bottom-1 w-0.5 rounded-full ${state === "done" ? "bg-dot-success/50" : "bg-fill-strong"}`}
              />
            )}
            <StepMarker state={state} />
            <div className={`pt-0.5 ${state === "pending" ? "text-muted" : ""}`}>
              <p className="text-callout font-semibold">
                {step.label}
                <span className="sr-only">, {stateLabel[state]}</span>
              </p>
              <p className="text-footnote text-muted">
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
  const ring = "relative flex size-6 shrink-0 items-center justify-center rounded-full";
  if (state === "done") {
    return (
      <span aria-hidden className={`${ring} bg-dot-success text-white`}>
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
          <path d="m2.5 6.25 2.25 2.25 4.75-5" />
        </svg>
      </span>
    );
  }
  if (state === "failed") {
    return (
      <span aria-hidden className={`${ring} bg-dot-danger text-white`}>
        <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round">
          <path d="m3.5 3.5 5 5m0-5-5 5" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span aria-hidden className={`${ring} bg-elevated shadow-[inset_0_0_0_2px_var(--dot-warning)]`}>
        <span className="size-2.5 rounded-full bg-dot-warning motion-safe:animate-pulse" />
      </span>
    );
  }
  return <span aria-hidden className={`${ring} bg-elevated shadow-[inset_0_0_0_2px_var(--fill-strong)]`} />;
}

