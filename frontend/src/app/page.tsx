import { Suspense } from "react";
import Link from "next/link";
import { Activity, ArrowRight, Globe, RotateCw, Route, ShieldCheck, Zap } from "lucide-react";
import { DeployForm } from "@/components/deploy-form";
import { DeploymentList } from "@/components/deployment-list";
import { GitHubMark } from "@/components/github-mark";
import { Architecture } from "@/components/landing/architecture";
import { DeployRun } from "@/components/landing/deploy-run";
import { LandingMotion } from "@/components/landing/landing-motion";
import { Marquee } from "@/components/landing/marquee";
import { SectionHeader } from "@/components/landing/section-header";
import { DeployLink } from "@/components/site-nav";
import { buttonClass, container } from "@/components/ui";
import { listDeployments, repoPageUrl, siteUrl, sitesDomain } from "@/lib/api";

export const dynamic = "force-dynamic";

const frameworks = ["Vite", "React", "Vue", "Svelte", "Astro", "Solid", "Preact", "Lit", "Next.js export", "Create React App"];

const steps = [
  {
    title: "Paste a repository",
    body: "Any public Git repository over https. The API worker records it in KV and starts a GitHub Actions run.",
    snippet: "https://github.com/you/app",
  },
  {
    title: "Built in isolation",
    body: "A fresh runner clones it on Node 22, then runs install and build. Output is picked up from dist, build or out.",
    snippet: "npm install && npm run build",
  },
  {
    title: "Live on its own subdomain",
    body: "A separate job syncs the output to R2. The serve worker answers on a short, random subdomain.",
    snippet: "a7k2x.<domain>",
  },
];

const stats = [
  { value: 0, label: "servers to patch or keep running" },
  { value: 5, label: "small pieces: three Workers, one workflow, one bucket" },
  { value: 3, label: "output folders detected: dist, build and out" },
  { value: 15, label: "minute limit per build before it’s stopped" },
];

const features = [
  {
    Icon: ShieldCheck,
    title: "Untrusted code never sees a secret",
    body: "The build job runs with no secrets and no token permissions. R2 credentials only exist in the upload job, which never runs your code.",
  },
  {
    Icon: Globe,
    title: "A subdomain for every deploy",
    body: "Each deployment gets its own ID and URL. Older deploys stay up, so you can compare versions side by side.",
  },
  {
    Icon: Route,
    title: "Client-side routing just works",
    body: "Paths without a file extension fall back to index.html, so refreshing a deep link in a single-page app still loads.",
  },
  {
    Icon: Zap,
    title: "Sensible caching",
    body: "HTML is served with no-cache, so browsers always check for a fresh copy. Scripts, styles and images are cached for an hour.",
  },
  {
    Icon: Activity,
    title: "Live build status",
    body: "The deployment page updates while the build runs, and the tab title flips to Ready or Failed when it’s done.",
  },
  {
    Icon: RotateCw,
    title: "One-click redeploy",
    body: "Rebuild the latest commit into a fresh subdomain without pasting the URL again.",
  },
];

export default function Home() {
  const domain = sitesDomain() ?? "yourdomain.dev";
  const repo = repoPageUrl();

  return (
    <LandingMotion>
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="relative isolate overflow-clip">
        <div aria-hidden className="hero-grid pointer-events-none absolute inset-0 -z-10" />
        <div aria-hidden data-follow className="hero-light pointer-events-none invisible absolute top-0 left-0 -z-10 size-[36rem]" />
        <div className={`${container} grid items-center gap-12 pt-14 pb-20 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16`}>
          <div className="min-w-0 space-y-8">
            <div className="space-y-5">
              <div data-intro="pill">
                <Suspense fallback={<LivePill />}>
                  <LiveCount />
                </Suspense>
              </div>
              <h1
                id="hero-heading"
                data-intro
                className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-[3.25rem]"
              >
                Ship a frontend from any Git repo.
              </h1>
              <p data-intro="copy" className="max-w-md text-lg text-pretty text-muted">
                Paste a repository. It’s built on GitHub Actions, stored in R2 and served from its own subdomain on
                Cloudflare. No servers to run.
              </p>
            </div>

            <div id="deploy" data-intro="form" className="scroll-mt-24 rounded-2xl bg-background p-5 shadow-card sm:p-6">
              <DeployForm />
            </div>
          </div>

          <div data-intro="visual" className="min-w-0">
            <DeployRun domain={domain} />
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section data-intro="strip" aria-label="Supported frameworks" className="border-y border-border bg-surface">
        <div className={`${container} flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-8`}>
          <p className="shrink-0 text-sm text-muted">Builds anything that outputs static files</p>
          <Marquee items={frameworks} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-heading" className="scroll-mt-14">
        <div className={`${container} space-y-10 py-20 sm:py-28`}>
          <SectionHeader id="how-heading" eyebrow="How it works" title="From repository to URL in three steps.">
            You paste one link. Everything after that runs on infrastructure you already have.
          </SectionHeader>
          <ol data-stack="(max-width: 767px)" className="grid gap-4 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} data-reveal className="relative flex flex-col rounded-xl bg-background p-5 shadow-card">
                <span data-scramble className="font-mono text-xs text-muted tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="mt-3 font-medium">{step.title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-pretty text-muted">{step.body}</p>
                <code className="mt-5 block truncate rounded-lg bg-surface px-3 py-2 font-mono text-[0.8125rem] shadow-card">
                  {step.snippet.replace("<domain>", domain)}
                </code>
              </li>
            ))}
          </ol>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border shadow-card lg:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} data-reveal className="flex flex-col-reverse gap-1 bg-background p-5">
                <dt className="text-sm text-pretty text-muted">{stat.label}</dt>
                <dd data-count={stat.value} className="text-[2.25rem] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Architecture (pinned scroll sequence on desktop) */}
      <Architecture />

      {/* Features */}
      <section aria-labelledby="features-heading" className="border-t border-border">
        <div className={`${container} space-y-10 py-20 sm:py-28`}>
          <SectionHeader id="features-heading" eyebrow="Details" title="The parts you’d otherwise build yourself." />
          <ul data-stack="(max-width: 767px)" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, body }) => (
              <li
                key={title}
                data-reveal
                data-spotlight
                className="spotlight group relative space-y-3 overflow-hidden rounded-xl bg-background p-5 shadow-card transition-shadow duration-150 hover:shadow-card-hover"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-surface shadow-card">
                  <Icon aria-hidden strokeWidth={1.5} className="size-4" />
                </span>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recent deployments (hidden when there are none or the API is down) */}
      <Suspense fallback={null}>
        <RecentDeployments />
      </Suspense>

      {/* Closing CTA */}
      <section aria-labelledby="cta-heading" className={`${container} pb-20 sm:pb-28`}>
        <div
          data-reveal
          className="relative isolate overflow-hidden rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:px-12 sm:py-24"
        >
          <div aria-hidden className="cta-glow pointer-events-none absolute inset-0 -z-10" />
          <div aria-hidden data-follow className="cta-light pointer-events-none invisible absolute top-0 left-0 -z-10 size-[28rem]" />
          <h2 id="cta-heading" data-split className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2.5rem]">
            Your next deploy is one paste away.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty opacity-70">Bring a repository. Leave with a URL you can share.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span data-magnetic className="inline-flex">
              <DeployLink className={buttonClass("inverse", "h-10 ps-4 pe-3.5")}>
                Deploy a repository
                <ArrowRight aria-hidden strokeWidth={2} className="size-4" />
              </DeployLink>
            </span>
            {repo && (
              <span data-magnetic className="inline-flex">
                <a href={repo} target="_blank" rel="noreferrer" className={buttonClass("inverse-outline", "h-10")}>
                  <GitHubMark />
                  View source
                </a>
              </span>
            )}
          </div>
        </div>
      </section>
    </LandingMotion>
  );
}

function LivePill({ count }: { count?: number }) {
  return (
    <Link
      href="/deployments"
      className="inline-flex h-7 items-center gap-2 rounded-full bg-background ps-2.5 pe-3 text-[0.8125rem] text-muted shadow-card transition-[box-shadow,color] duration-150 hover:text-foreground hover:shadow-card-hover"
    >
      <span className="relative flex size-1.5" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-success/50 motion-safe:animate-ping" />
        <span className="size-1.5 rounded-full bg-success" />
      </span>
      {count ? (
        <span>
          <span className="font-medium text-foreground tabular-nums">{count}</span> {count === 1 ? "site" : "sites"} live
        </span>
      ) : (
        <span>Runs on Cloudflare</span>
      )}
      <ArrowRight aria-hidden strokeWidth={1.5} className="size-3.5" />
    </Link>
  );
}

async function LiveCount() {
  const deployments = await listDeployments().catch(() => []);
  return <LivePill count={deployments.filter(d => d.status === "deployed").length} />;
}

async function RecentDeployments() {
  const deployments = await listDeployments().catch(() => []);
  if (deployments.length === 0) return null;
  const recent = deployments.slice(0, 5).map(d => ({ ...d, siteUrl: siteUrl(d.id) }));

  // Streams in after the page's motion is set up, so it uses the CSS entrance on its rows instead.
  return (
    <section aria-labelledby="recent-heading" className="border-t border-border">
      <div className={`${container} space-y-8 py-20 sm:py-28`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-3">
            <p className="font-mono text-xs text-muted">Recently shipped</p>
            <h2 id="recent-heading" className="text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2rem]">
              Fresh off the build queue.
            </h2>
          </div>
          <Link
            href="/deployments"
            className="-me-2 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
          >
            View all
            <ArrowRight aria-hidden strokeWidth={2} className="size-4" />
          </Link>
        </div>
        <DeploymentList items={recent} />
      </div>
    </section>
  );
}
