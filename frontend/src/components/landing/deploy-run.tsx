"use client";

import { useRef } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { WindowBar } from "../ui";

// Illustrative build runs for the hero. Decorative: the real flow is described in text on the page.
// The server markup is the finished first run, which is also what reduced motion and no-JS show.
const steps = [
  { step: "Clone", cmd: "git clone --depth 1" },
  { step: "Install", cmd: "npm install" },
  { step: "Build", cmd: "npm run build → dist/" },
  { step: "Upload", cmd: "aws s3 sync → R2" },
];

const runs = [
  { repo: "github.com/you/portfolio", id: "a7k2x", times: [0.9, 11.2, 7.4, 1.3] },
  { repo: "github.com/acme/docs", id: "m3p9q", times: [1.4, 18.6, 12.1, 2.2] },
  { repo: "gitlab.com/team/landing", id: "r8t2v", times: [0.7, 9.8, 5.3, 0.9] },
];

const total = (times: number[]) => `${times.reduce((a, b) => a + b, 0).toFixed(1)}s total`;

export function DeployRun({ domain }: { domain: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(root);
        const rows = q("[data-row]");
        const pending = q("[data-pending]");
        const spins = q("[data-spin]");
        const checks = q("[data-check]");
        const times = q<HTMLElement>("[data-time]");
        const [repo] = q<HTMLElement>("[data-repo]");
        const [host] = q<HTMLElement>("[data-host]");
        const [totalEl] = q<HTMLElement>("[data-total]");
        const [live] = q("[data-live]");
        const [footer] = q("[data-footer]");
        const [bar] = q("[data-bar]");
        const [barDone] = q("[data-bar-done]");
        const [caret] = q("[data-caret]");

        gsap.to(caret, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(1)" });

        const master = gsap.timeline({ repeat: -1, delay: 1.1, paused: true });

        runs.forEach(run => {
          const tl = gsap.timeline();

          // Reset to an idle run.
          tl.to([live, footer], { autoAlpha: 0, duration: 0.25 })
            .to(rows, { opacity: 0.35, duration: 0.25 }, "<")
            .to(checks, { autoAlpha: 0, scale: 0.25, filter: "blur(4px)", duration: 0.2 }, "<")
            .set(pending, { autoAlpha: 1 })
            .set(spins, { autoAlpha: 0, scale: 1, filter: "blur(0px)" })
            .set(times, { textContent: "" })
            .set(bar, { scaleX: 0, autoAlpha: 1 })
            .set(barDone, { autoAlpha: 0 })
            .set(totalEl, { textContent: total(run.times) })
            .to(repo, { text: { value: "" }, duration: 0.2, ease: "none" }, "<");

          // Type the repository.
          tl.to(repo, { text: { value: run.repo }, duration: run.repo.length * 0.028, ease: "none" }, "+=0.2");

          // Each step: spin, count up, check off. Real durations are compressed so the loop stays short.
          run.times.forEach((seconds, i) => {
            const counter = { v: 0 };
            const d = Math.min(0.35 + seconds * 0.05, 1.1);
            tl.set(pending[i], { autoAlpha: 0 }, "+=0.15")
              .set(spins[i], { autoAlpha: 1 }, "<")
              .to(rows[i], { opacity: 1, duration: 0.2 }, "<")
              .to(
                counter,
                {
                  v: seconds,
                  duration: d,
                  ease: "none",
                  onUpdate: () => {
                    times[i].textContent = `${counter.v.toFixed(1)}s`;
                  },
                },
                "<",
              )
              .to(bar, { scaleX: (i + 1) / (steps.length + 1), duration: d, ease: "none" }, "<")
              .to(spins[i], { autoAlpha: 0, scale: 0.25, filter: "blur(4px)", duration: 0.2, ease: "ui-out" })
              .to(checks[i], { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.3, ease: "ui-out" }, "<");
          });

          // Go live.
          tl.to(bar, { scaleX: 1, duration: 0.3, ease: "ui-out" })
            .to(barDone, { autoAlpha: 1, duration: 0.3 }, "<")
            .fromTo(live, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "ui-out" }, "<")
            .to(host, { scrambleText: { text: `${run.id}.${domain}`, chars: "lowerCase", speed: 0.5 }, duration: 0.8 }, "<")
            .fromTo(footer, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "ui-out" }, "-=0.3")
            .to(bar, { autoAlpha: 0, duration: 0.5 }, "+=0.6")
            .to({}, { duration: 2.4 });

          master.add(tl);
        });

        // Only run while the card is on screen.
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: self => (self.isActive ? master.play() : master.pause()),
        });

        return () => {
          st.kill();
          master.kill();
        };
      });
    },
    { scope: root },
  );

  const first = runs[0];

  return (
    <div ref={root} aria-hidden className="overflow-hidden rounded-[14px] bg-canvas text-start shadow-window select-none">
      <WindowBar title="Deployer — build" className="border-b border-separator" />

      <div className="relative bg-elevated p-5 font-mono text-footnote leading-8 sm:p-7 sm:text-callout">
        <span className="absolute inset-x-0 top-0 h-0.5">
          <span data-bar className="invisible absolute inset-0 origin-left bg-dot-warning">
            <span data-bar-done className="invisible absolute inset-0 bg-dot-success" />
          </span>
        </span>

        <div className="mb-4 flex items-center gap-2 border-b border-separator pb-4">
          <span className="text-accent">❯</span>
          <span>deploy</span>
          <span className="flex min-w-0 items-center">
            <span data-repo className="truncate text-muted">
              {first.repo}
            </span>
            <span data-caret className="ms-0.5 h-[1.1em] w-[2px] shrink-0 rounded-full bg-accent" />
          </span>
        </div>

        <ol>
          {steps.map((line, i) => (
            <li key={line.step} data-row className="grid grid-cols-[1.25rem_4.75rem_minmax(0,1fr)_auto] items-center gap-x-3">
              <span className="relative size-4">
                <span data-pending className="invisible absolute inset-0 m-auto size-3 rounded-full shadow-[inset_0_0_0_1.5px_var(--border)]" />
                <span data-spin className="invisible absolute inset-0">
                  <LoaderCircle strokeWidth={2.5} className="size-4 animate-spin text-dot-warning" />
                </span>
                <span data-check className="absolute inset-0 flex items-center justify-center rounded-full bg-dot-success text-white">
                  <Check strokeWidth={3.5} className="size-2.5" />
                </span>
              </span>
              <span className="font-sans font-medium">{line.step}</span>
              <span className="truncate text-muted">{line.cmd}</span>
              <span data-time className="min-w-[3rem] text-end text-muted tabular-nums">
                {first.times[i]}s
              </span>
            </li>
          ))}
        </ol>

        <div data-live className="mt-4 flex items-center gap-3 border-t border-separator pt-4">
          <span className="relative flex size-4 items-center justify-center">
            <span className="absolute size-2.5 rounded-full bg-dot-success/40 motion-safe:animate-ping" />
            <span className="size-2.5 rounded-full bg-dot-success" />
          </span>
          <span className="w-[4.75rem] font-sans font-medium">Live</span>
          <span className="flex min-w-0 items-center gap-1 text-accent">
            <span data-host className="truncate">
              {first.id}.{domain}
            </span>
            <ArrowUpRight strokeWidth={2} className="size-3.5 shrink-0" />
          </span>
        </div>
      </div>

      <div data-footer className="flex h-10 items-center justify-between border-t border-separator px-4 text-footnote">
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <span className="size-2 rounded-full bg-dot-success" />
          Ready
        </span>
        <span data-total className="font-mono text-muted tabular-nums">
          {total(first.times)}
        </span>
      </div>
    </div>
  );
}
