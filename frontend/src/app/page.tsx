import { Suspense } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ChevronRight, Globe, RotateCw, Route, ShieldCheck, Zap } from "lucide-react";
import { DeployForm } from "@/components/deploy-form";
import { DeploymentList } from "@/components/deployment-list";
import { GitHubMark } from "@/components/github-mark";
import { Architecture } from "@/components/landing/architecture";
import { DeployRun } from "@/components/landing/deploy-run";
import { LandingMotion } from "@/components/landing/landing-motion";
import { Marquee } from "@/components/landing/marquee";
import { DeployLink } from "@/components/site-nav";
import { buttonClass, container, containerWide, SectionHeading } from "@/components/ui";
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

// Icon tiles in the style of system settings: one system color per idea, white glyph.
const features = [
  {
    Icon: ShieldCheck,
    tint: "bg-[#34c759]",
    title: "Untrusted code never sees a secret",
    body: "The build job runs with no secrets and no token permissions. R2 credentials only exist in the upload job, which never runs your code.",
  },
  {
    Icon: Globe,
    tint: "bg-[#007aff]",
    title: "A subdomain for every deploy",
    body: "Each deployment gets its own ID and URL. Older deploys stay up, so you can compare versions side by side.",
  },
  {
    Icon: Route,
    tint: "bg-[#ff9500]",
    title: "Client-side routing just works",
    body: "Paths without a file extension fall back to index.html, so refreshing a deep link in a single-page app still loads.",
  },
  {
    Icon: Zap,
    tint: "bg-[#ffcc00] text-[#1d1d1f]!",
    title: "Sensible caching",
    body: "HTML is served with no-cache, so browsers always check for a fresh copy. Scripts, styles and images are cached for an hour.",
  },
  {
    Icon: Activity,
    tint: "bg-[#ff2d55]",
    title: "Live build status",
    body: "The deployment page updates while the build runs, and the tab title flips to Ready or Failed when it’s done.",
  },
  {
    Icon: RotateCw,
    tint: "bg-[#5856d6]",
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
        <div aria-hidden className="hero-aura pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[46rem]" />
        <div className={`${container} flex flex-col items-center pt-14 text-center sm:pt-24`}>
          <div data-intro="pill">
            <Suspense fallback={<LivePill />}>
              <LiveCount />
            </Suspense>
          </div>

          <h1 id="hero-heading" data-intro="title" className="mt-6 text-display text-balance">
            <span className="block overflow-clip pb-[0.06em]">
              <span data-line className="block">
                Ship a frontend.
              </span>
            </span>
            <span className="-mt-[0.06em] block overflow-clip pb-[0.1em]">
              <span data-line className="text-gradient block">
                From any Git repo.
              </span>
            </span>
          </h1>

          <p data-intro="copy" className="mt-5 max-w-2xl text-lede text-pretty text-muted">
            Paste a repository. It’s built on GitHub Actions, stored in R2 and served from its own subdomain on Cloudflare. No
            servers to run.
          </p>

          <div
            id="deploy"
            data-intro="form"
            className="material-thick mt-10 w-full max-w-2xl scroll-mt-24 rounded-[28px] p-3 text-start shadow-window sm:p-4"
          >
            <div className="px-1 pt-1 sm:px-0 sm:pt-0">
              <DeployForm />
            </div>
          </div>

          <div data-intro="links" className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-callout">
            <Link href="#how" className="group inline-flex items-center text-accent hover:underline hover:underline-offset-4">
              How it works
              <ChevronRight aria-hidden strokeWidth={2.25} className="size-4 transition-transform duration-200 ease-spring group-hover:translate-x-0.5" />
            </Link>
            <Link href="/deployments" className="group inline-flex items-center text-accent hover:underline hover:underline-offset-4">
              See deployments
              <ChevronRight aria-hidden strokeWidth={2.25} className="size-4 transition-transform duration-200 ease-spring group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* The build window leans back and settles flat as you scroll to it. */}
        <div className={`${container} pt-16 pb-16 sm:pt-20 sm:pb-24`}>
          <div data-intro="visual" className="[perspective:1600px]">
            <div data-tilt className="mx-auto max-w-3xl origin-bottom">
              <DeployRun domain={domain} />
            </div>
          </div>
        </div>

        <div data-intro="strip" aria-label="Supported frameworks" role="region" className={`${container} flex flex-col items-center gap-5 pb-20 sm:pb-28`}>
          <p className="text-footnote text-muted">Builds anything that outputs static files</p>
          <Marquee items={frameworks} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-heading" className="scroll-mt-12 bg-canvas">
        <div className={`${containerWide} space-y-14 py-24 sm:py-32`}>
          <SectionHeading id="how-heading" eyebrow="How it works" title="Three steps." quiet="One paste." align="center">
            You paste one link. Everything after that runs on infrastructure you already have.
          </SectionHeading>

          <ol data-stack="(max-width: 767px)" className="grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map((step, i) => (
              <li key={step.title} data-reveal className="relative flex flex-col rounded-[28px] bg-elevated p-7 shadow-card">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-footnote font-semibold text-white tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-6 text-title">{step.title}</h3>
                <p className="mt-2 flex-1 text-callout text-pretty text-muted">{step.body}</p>
                <code className="mt-6 block truncate rounded-[14px] bg-fill px-3.5 py-2.5 font-mono text-footnote">
                  {step.snippet.replace("<domain>", domain)}
                </code>
              </li>
            ))}
          </ol>

          <dl className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
            {stats.map(stat => (
              <div key={stat.label} data-reveal className="flex flex-col-reverse gap-2 rounded-[28px] bg-elevated p-7 shadow-card">
                <dt className="text-callout text-pretty text-muted">{stat.label}</dt>
                <dd data-count={stat.value} className="text-[3.5rem] leading-none font-bold tracking-[-0.04em] tabular-nums">
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
      <section aria-labelledby="features-heading" className="bg-canvas">
        <div className={`${containerWide} space-y-14 py-24 sm:py-32`}>
          <SectionHeading id="features-heading" eyebrow="Details" title="Built in." quiet="Not bolted on." align="center">
            The parts you’d otherwise build yourself, already there on every deploy.
          </SectionHeading>
          <ul data-stack="(max-width: 767px)" className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {features.map(({ Icon, tint, title, body }) => (
              <li
                key={title}
                data-reveal
                data-spotlight
                className="spotlight relative overflow-hidden rounded-[28px] bg-elevated p-7 shadow-card transition-shadow duration-300 ease-spring hover:shadow-card-hover"
              >
                <span className={`flex size-11 items-center justify-center rounded-[12px] text-white shadow-[inset_0_0_0_0.5px_rgb(0_0_0/0.08)] ${tint}`}>
                  <Icon aria-hidden strokeWidth={2} className="size-[22px]" />
                </span>
                <h3 className="mt-6 text-title">{title}</h3>
                <p className="mt-2 text-callout text-pretty text-muted">{body}</p>
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
      <section aria-labelledby="cta-heading" className={`${containerWide} py-24 sm:py-32`}>
        <div data-reveal className="relative isolate overflow-hidden rounded-[36px] bg-[#0b0b0d] px-6 py-20 text-center text-white sm:px-12 sm:py-28">
          <div aria-hidden className="cta-glow pointer-events-none absolute inset-0 -z-10" />
          <div aria-hidden data-follow className="cta-light pointer-events-none invisible absolute top-0 left-0 -z-10 size-[28rem]" />
          <h2 id="cta-heading" data-split className="text-headline text-balance">
            Your next deploy is one paste away.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lede text-pretty text-white/70">Bring a repository. Leave with a URL you can share.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <span data-magnetic className="inline-flex">
              <DeployLink className={buttonClass("inverse", "h-12 ps-6 pe-5 text-body")}>
                Deploy a repository
                <ArrowRight aria-hidden strokeWidth={2.25} className="size-4" />
              </DeployLink>
            </span>
            {repo && (
              <span data-magnetic className="inline-flex">
                <a href={repo} target="_blank" rel="noreferrer" className={buttonClass("inverse-outline", "h-12 px-6 text-body")}>
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
      className="material group inline-flex h-8 items-center gap-2 rounded-full ps-3 pe-2.5 text-footnote text-muted shadow-card transition-[box-shadow,color,scale] duration-200 ease-spring-snappy hover:text-foreground hover:shadow-card-hover active:scale-[0.96]"
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-dot-success/50 motion-safe:animate-ping" />
        <span className="size-2 rounded-full bg-dot-success" />
      </span>
      {count ? (
        <span>
          <span className="font-semibold text-foreground tabular-nums">{count}</span> {count === 1 ? "site" : "sites"} live now
        </span>
      ) : (
        <span>Runs entirely on Cloudflare</span>
      )}
      <ChevronRight aria-hidden strokeWidth={2.25} className="size-3.5 transition-transform duration-200 ease-spring group-hover:translate-x-0.5" />
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
    <section aria-labelledby="recent-heading">
      <div className={`${container} space-y-10 py-24 sm:py-32`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl space-y-3">
            <p className="text-callout font-semibold text-accent">Recently shipped</p>
            <h2 id="recent-heading" className="two-tone text-large-title text-balance">
              Fresh off the build queue.
            </h2>
          </div>
          <Link href="/deployments" className="group inline-flex h-9 items-center text-callout text-accent hover:underline hover:underline-offset-4">
            View all
            <ChevronRight aria-hidden strokeWidth={2.25} className="size-4 transition-transform duration-200 ease-spring group-hover:translate-x-0.5" />
          </Link>
        </div>
        <DeploymentList items={recent} />
      </div>
    </section>
  );
}
