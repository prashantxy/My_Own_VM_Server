"use client";

import { useRef } from "react";
import { FINE_POINTER, gsap, MOTION_OK, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/*
 * Scroll and pointer choreography for the landing page, driven by data attributes so the
 * server-rendered markup stays plain:
 *   data-intro="…"   hero pieces, played once on load in document order
 *   data-split       headings that rise in line by line
 *   data-scramble    small labels that decode on entry
 *   data-reveal      blocks that fade up, batched so neighbours stagger
 *   data-count       numbers that count up to their text content
 *   data-spotlight   cards with a soft light under the cursor
 *   data-follow      a light that trails the cursor inside its parent
 *   data-magnetic    buttons that lean toward the cursor
 * Everything sits behind reduced-motion (and pointer) media queries; the markup is the final state.
 */
export function LandingMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Hero intro.
        const [h1] = q<HTMLElement>("h1[data-intro]");
        const intro = gsap.timeline({ defaults: { ease: "ui-out" } });
        intro.from(q('[data-intro="pill"]'), { autoAlpha: 0, y: 8, duration: 0.6 });
        if (h1) {
          const split = SplitText.create(h1, { type: "lines,words", mask: "lines" });
          intro
            .set(h1, { autoAlpha: 1 })
            .from(split.words, { yPercent: 110, duration: 1, stagger: 0.06, onComplete: () => split.revert() }, 0.1);
        }
        intro
          .from(q('[data-intro="copy"]'), { autoAlpha: 0, y: 12, filter: "blur(4px)", duration: 0.8 }, 0.45)
          .from(q('[data-intro="form"]'), { autoAlpha: 0, y: 20, scale: 0.98, duration: 0.9 }, 0.6)
          .from(
            q('[data-intro="visual"]'),
            { autoAlpha: 0, y: 40, rotationX: 14, transformPerspective: 1400, transformOrigin: "50% 100%", duration: 1.2 },
            0.5,
          )
          .from(q('[data-intro="strip"]'), { autoAlpha: 0, duration: 0.8 }, 0.9);

        // Headings rise line by line. autoSplit re-splits on resize or font load.
        q<HTMLElement>("[data-split]").forEach(el => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: self =>
              gsap.from(self.lines, {
                yPercent: 105,
                duration: 0.9,
                stagger: 0.08,
                ease: "ui-out",
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        // Labels decode in place (same text, so nothing reflows).
        q<HTMLElement>("[data-scramble]").forEach(el => {
          gsap.to(el, {
            scrambleText: { text: el.textContent ?? "", chars: "01", revealDelay: 0.2, speed: 0.6 },
            duration: 0.9,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        // Blocks fade up in batches.
        const reveals = q("[data-reveal]");
        gsap.set(reveals, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "ui-out", overwrite: true }),
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
