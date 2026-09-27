"use client";

import { useRef } from "react";
import { FINE_POINTER, gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/*
 * Scroll and pointer choreography for the landing page, driven by data attributes so the
 * server-rendered markup stays plain:
 *   data-intro="…"   hero pieces, played once on load (data-line: title lines inside a mask)
 *   data-tilt        a visual that leans back and flattens as it scrolls into view
 *   data-split       headings that rise in line by line
 *   data-reveal      blocks that fade up, batched so neighbours stagger
 *   data-count       numbers that count up to their text content
 *   data-spotlight   cards with a soft light under the cursor
 *   data-follow      a light that trails the cursor inside its parent
 *   data-magnetic    buttons that lean toward the cursor
 *   data-stack="…"   a list whose cards stack like a deck while the query (a single-column layout) matches
 * Everything sits behind reduced-motion (and pointer) media queries; the markup is the final state.
 */
export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Hero intro: the two title lines rise out of their masks, everything else settles in behind.
        const intro = gsap.timeline({ defaults: { ease: "ui-out" } });
        intro
          .from(q('[data-intro="pill"]'), { autoAlpha: 0, y: 8, scale: 0.96, duration: 0.7 })
          .set(q('[data-intro="title"]'), { autoAlpha: 1 }, 0.05)
          .from(q("[data-line]"), { yPercent: 105, duration: 1.1, stagger: 0.1 }, 0.05)
          .from(q('[data-intro="copy"]'), { autoAlpha: 0, y: 12, filter: "blur(6px)", duration: 0.9 }, 0.4)
          .from(q('[data-intro="form"]'), { autoAlpha: 0, y: 24, scale: 0.97, filter: "blur(8px)", duration: 1 }, 0.55)
          .from(q('[data-intro="links"]'), { autoAlpha: 0, y: 8, duration: 0.8 }, 0.75)
          .from(q('[data-intro="visual"]'), { autoAlpha: 0, y: 60, duration: 1.3 }, 0.7)
          .from(q('[data-intro="strip"]'), { autoAlpha: 0, duration: 0.8 }, 1);

        // The build window leans back and flattens as it scrolls toward the middle of the screen,
        // the way a product shot settles into view.
        q<HTMLElement>("[data-tilt]").forEach(el => {
          gsap.fromTo(
            el,
            { rotationX: 18, scale: 0.92, y: 0 },
            {
              rotationX: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: 0.5 },
            },
          );
        });

        // Headings rise line by line. autoSplit re-splits on resize or font load.
        q<HTMLElement>("[data-split]").forEach(el => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: self =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 1,
                stagger: 0.08,
                ease: "ui-out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        // Blocks fade up in batches.
        const reveals = q("[data-reveal]");
        gsap.set(reveals, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "ui-out", overwrite: "auto" }),
        });

        // Numbers count up.
        q<HTMLElement>("[data-count]").forEach(el => {
          const end = Number(el.dataset.count);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => (el.textContent = String(Math.round(obj.v))),
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
          el.textContent = "0";
        });
      });

      // Card stacks: while a list is a single column, each card sticks under the header a little lower
      // than the one before, and the cards underneath shrink and fade back as the rest arrive.
      q<HTMLElement>("[data-stack]").forEach(list => {
        mm.add(`${list.dataset.stack} and ${MOTION_OK}`, () => {
          const cards = gsap.utils.toArray<HTMLElement>(list.children);
          const last = cards[cards.length - 1];
          const topFor = (i: number) => 64 + i * 12; // 48px header + 16px, then a 12px peek per card
          const shades: HTMLElement[] = [];

          gsap.set(list.querySelectorAll("[data-stack-hide]"), { display: "none" });
          cards.forEach((card, i) => {
            gsap.set(card, { position: "sticky", top: topFor(i), zIndex: i + 1, transformOrigin: "50% 0%" });

            if (card === last) return;
            const depth = cards.length - 1 - i;
            const shade = document.createElement("span");
            shade.setAttribute("aria-hidden", "");
            shade.className = "pointer-events-none absolute inset-0 rounded-[inherit] bg-background opacity-0";
            card.append(shade);
            shades.push(shade);

            // From the moment the next card starts to arrive until the last one settles.
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top bottom",
                endTrigger: last,
                end: `top ${topFor(cards.length - 1)}px`,
                scrub: true,
              },
            });
            tl.to(card, { scale: 1 - depth * 0.04, ease: "none" }, 0).to(shade, { opacity: Math.min(0.2 + depth * 0.12, 0.6), ease: "none" }, 0);
          });

          return () => shades.forEach(el => el.remove());
        });
      });

      mm.add(FINE_POINTER, () => {
        const cleanups: (() => void)[] = [];

        // Spotlight cards: position the light via CSS variables on the card itself.
        q<HTMLElement>("[data-spotlight]").forEach(card => {
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty("--x", `${e.clientX - r.left}px`);
            card.style.setProperty("--y", `${e.clientY - r.top}px`);
          };
          card.addEventListener("pointermove", move);
          cleanups.push(() => card.removeEventListener("pointermove", move));
        });

        // Lights that trail the cursor inside their parent.
        q<HTMLElement>("[data-follow]").forEach(light => {
          const area = light.parentElement!;
          const x = gsap.quickTo(light, "x", { duration: 0.8, ease: "power3.out" });
          const y = gsap.quickTo(light, "y", { duration: 0.8, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = area.getBoundingClientRect();
            x(e.clientX - r.left - light.offsetWidth / 2);
            y(e.clientY - r.top - light.offsetHeight / 2);
          };
          const show = () => gsap.to(light, { autoAlpha: 1, duration: 0.4 });
          const hide = () => gsap.to(light, { autoAlpha: 0, duration: 0.6 });
          area.addEventListener("pointermove", move);
          area.addEventListener("pointerenter", show);
          area.addEventListener("pointerleave", hide);
          cleanups.push(() => {
            area.removeEventListener("pointermove", move);
            area.removeEventListener("pointerenter", show);
            area.removeEventListener("pointerleave", hide);
          });
        });

        // Magnetic buttons: a small lean, no bounce.
        q<HTMLElement>("[data-magnetic]").forEach(el => {
          const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "ui-out" });
          const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "ui-out" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.2);
            y((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const reset = () => {
            x(0);
            y(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", reset);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", reset);
          });
        });

        return () => cleanups.forEach(fn => fn());
      });
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
