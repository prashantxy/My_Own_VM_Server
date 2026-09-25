"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap";

// Endless strip of names. Constant motion, so linear; hovering eases it down instead of stopping dead.
// Without motion it's a plain wrapping list.
export function Marquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = root.current!;
        const track = el.querySelector<HTMLElement>("[data-track]")!;
        el.dataset.running = "";
        const loop = gsap.to(track, { xPercent: -50, duration: items.length * 3.2, ease: "none", repeat: -1 });
        const slow = () => gsap.to(loop, { timeScale: 0.15, duration: 0.6, ease: "ui-out" });
        const resume = () => gsap.to(loop, { timeScale: 1, duration: 0.6, ease: "ui-out" });
        el.addEventListener("pointerenter", slow);
        el.addEventListener("pointerleave", resume);
        return () => {
          delete el.dataset.running;
          el.removeEventListener("pointerenter", slow);
          el.removeEventListener("pointerleave", resume);
        };
      });
    },
    { scope: root },
  );

  const list = (hidden?: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className={`flex shrink-0 flex-wrap gap-x-8 gap-y-2 font-mono text-[0.8125rem] group-data-running:flex-nowrap group-data-running:pe-8 ${
        hidden ? "hidden group-data-running:flex" : ""
      }`}
    >
      {items.map(name => (
        <li key={name} className="flex items-center gap-8 whitespace-nowrap">
          {name}
          <span aria-hidden className="hidden size-1 rounded-full bg-border group-data-running:block" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={root}
      className="group min-w-0 flex-1 data-running:overflow-hidden data-running:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
    >
      <div data-track className="flex w-full group-data-running:w-max">
        {list()}
        {list(true)}
      </div>
    </div>
  );
}
