"use client";

import { useRef } from "react";
import { ArrowDown, CornerDownLeft, Database, Globe, LayoutDashboard, Server, Workflow } from "lucide-react";
import { DESKTOP_MOTION, gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { container } from "../ui";
import { SectionHeader } from "./section-header";

const nodes = [
  {
    Icon: LayoutDashboard,
    name: "Dashboard",
    tech: "Next.js on Workers",
    detail: "Server action posts the repo URL",
    caption: "You paste a repository. A server action on the dashboard forwards it to the API worker.",
  },
  {
    Icon: Server,
    name: "API worker",
    tech: "Workers + KV",
    detail: "Stores status, dispatches the workflow",
    caption: "The API worker gives the deploy a short random ID, marks it queued in KV and dispatches the workflow.",
  },
  {
    Icon: Workflow,
    name: "Build",
    tech: "GitHub Actions",
    detail: "Clone and build with no secrets",
    caption: "A fresh runner clones the repo and runs npm install and npm run build. That job has no secrets.",
  },
  {
    Icon: Database,
    name: "Storage",
    tech: "R2",
    detail: "Output synced to dist/<id>",
    caption: "A separate job, the only one holding R2 credentials, syncs the build output to dist/<id>.",
  },
  {
    Icon: Globe,
    name: "Serve worker",
    tech: "Workers + R2",
    detail: "Answers on <id>.<domain>",
    caption: "The serve worker reads the ID from the hostname and streams files straight from R2.",
  },
];

export function Architecture() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pin the section and walk the request through each piece as you scroll.
      mm.add(DESKTOP_MOTION, () => {
        const q = gsap.utils.selector(root);
        const cards = q("[data-node]");
        const dots = q("[data-dot]");
        const fill = q("[data-fill]");
        const captions = q("[data-caption]");
        const counter = q<HTMLElement>("[data-step-count]");

        gsap.set(cards, { opacity: 0.3, y: 8 });
        gsap.set(dots, { scale: 0.6, opacity: 0 });
        gsap.set(fill, { scaleX: 0 });
        gsap.set(captions, { autoAlpha: 0, y: 10 });

        const tl = gsap.timeline({
          defaults: { ease: "ui-out", duration: 0.5 },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=1800",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
          },
        });

        nodes.forEach((_, i) => {
          if (i > 0) tl.to(fill, { scaleX: i / (nodes.length - 1), duration: 0.6, ease: "none" });
          tl.to(cards[i], { opacity: 1, y: -4 }, i > 0 ? "<0.35" : 0)
            .to(dots[i], { scale: 1, opacity: 1 }, "<")
            .to(captions[i], { autoAlpha: 1, y: 0 }, "<")
            .call(() => (counter[0].textContent = String(i + 1)), undefined, "<");
          if (i > 0) {
            tl.to(cards[i - 1], { y: 0 }, "<").to(captions[i - 1], { autoAlpha: 0, y: -10, duration: 0.3 }, "<");
          }
          tl.to({}, { duration: 0.4 });
        });

        // Last beat: the workflow reports back.
        tl.to(cards[nodes.length - 1], { y: 0 })
          .to(captions[nodes.length - 1], { autoAlpha: 0, y: -10, duration: 0.3 }, "<")
          .to(captions[nodes.length], { autoAlpha: 1, y: 0 }, "<")
          .to({}, { duration: 0.4 });
      });

      // Smaller screens: no pinning, the stacked cards just rise in as they arrive.
      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        const cards = gsap.utils.selector(root)("[data-node]");
        gsap.set(cards, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "ui-out" }),
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="architecture"
      aria-labelledby="architecture-heading"
      className="scroll-mt-14 border-t border-border bg-surface lg:flex lg:min-h-svh lg:flex-col lg:justify-center"
    >
      <div className={`${container} space-y-10 py-20 sm:py-28`}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeader id="architecture-heading" eyebrow="Architecture" title="Five small pieces, all serverless.">
            Workers handle requests, KV keeps status, GitHub Actions does the heavy lifting and R2 holds the files.
          </SectionHeader>
          <p aria-hidden className="hidden font-mono text-xs text-muted tabular-nums lg:block">
            Step <span data-step-count>5</span> / {nodes.length}
          </p>
        </div>

        <figure className="space-y-6">
          {/* Progress rail, desktop only. Dots line up with the card columns below. */}
          <div aria-hidden className="relative hidden grid-cols-5 lg:grid">
            <span className="absolute inset-x-[10%] top-1/2 h-px -translate-y-1/2 bg-border" />
            <span data-fill className="absolute start-[10%] top-1/2 h-px w-[80%] origin-left -translate-y-1/2 bg-foreground" />
            {nodes.map(n => (
              <span key={n.name} className="relative flex justify-center">
                <span className="size-2.5 rounded-full bg-border" />
                <span data-dot className="absolute size-2.5 rounded-full bg-foreground shadow-[0_0_0_4px_color-mix(in_oklch,var(--foreground)_12%,transparent)]" />
              </span>
            ))}
          </div>

          <ol className="grid gap-6 lg:grid-cols-5">
            {nodes.map(({ Icon, name, tech, detail }, i) => (
              <li
                key={name}
                data-node
                className="relative flex items-start gap-3 rounded-xl bg-background p-4 shadow-card lg:flex-col lg:gap-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface shadow-card">
                  <Icon aria-hidden strokeWidth={1.5} className="size-4" />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="font-mono text-xs text-muted">{tech}</p>
                  <p className="pt-1 text-[0.8125rem] leading-snug text-pretty text-muted">{detail}</p>
                </div>
                {i < nodes.length - 1 && (
                  <ArrowDown
                    aria-hidden
                    strokeWidth={1.5}
                    className="absolute start-1/2 -bottom-5 size-4 -translate-x-1/2 text-muted lg:start-auto lg:-end-5 lg:top-1/2 lg:bottom-auto lg:translate-x-0 lg:-translate-y-1/2 lg:-rotate-90"
                  />
                )}
              </li>
            ))}
          </ol>

          {/* Step captions share one cell; only the scroll sequence shows the first five. */}
          <div className="grid text-[0.8125rem] text-pretty text-muted lg:min-h-10 lg:text-sm [&>*]:[grid-area:1/1]">
            {nodes.map(n => (
              <p key={n.name} data-caption aria-hidden className="invisible hidden lg:block">
                <span className="font-medium text-foreground">{n.name}.</span> {n.caption}
              </p>
            ))}
            <figcaption data-caption className="flex items-start gap-2">
              <CornerDownLeft aria-hidden strokeWidth={1.5} className="mt-0.5 size-3.5 shrink-0" />
              <span>
                When the workflow finishes, it reports <span className="font-mono text-foreground">deployed</span> or{" "}
                <span className="font-mono text-foreground">failed</span> back to the API through an authenticated callback.
              </span>
            </figcaption>
          </div>
        </figure>
      </div>
    </section>
  );
}
