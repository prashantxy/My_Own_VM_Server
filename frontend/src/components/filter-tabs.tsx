"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Status } from "@/lib/api";

export type Filter = "all" | Status;

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deployed", label: "Ready" },
  { key: "queued", label: "Building" },
  { key: "failed", label: "Error" },
];

/*
 * Segmented control. Pressing dims the segment; releasing moves the thumb right away (not when the new page
 * arrives), slides on a spring from wherever it is, and can be redirected mid-flight.
 * Before hydration the selected segment paints its own background, so there's no empty frame.
 */
export function FilterTabs({ active, counts }: { active: Filter; counts: Record<Filter, number> }) {
  const [shown, setShown] = useState(active);
  const [synced, setSynced] = useState(active);
  if (active !== synced) {
    setSynced(active);
    setShown(active);
  }

  const listRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current!;
    const thumb = thumbRef.current!;
    const place = () => {
      const el = list.querySelector<HTMLElement>(`[data-key="${shown}"]`);
      if (!el) return;
      thumb.style.width = `${el.offsetWidth}px`;
      thumb.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    place();
    if (!ready) {
      // First placement lands without animating; transitions start after it.
      requestAnimationFrame(() => setReady(true));
    }
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [shown, ready]);

  return (
    <nav aria-label="Filter deployments" className="max-w-full overflow-x-auto">
      <div ref={listRef} className="relative inline-flex rounded-[10px] bg-fill p-0.5">
        <span
          ref={thumbRef}
          aria-hidden
          className={`absolute inset-y-0.5 start-0 rounded-[8px] bg-elevated shadow-control ${
            ready ? "transition-[transform,width] duration-[380ms] ease-spring-snappy" : "invisible"
          }`}
        />
        {filters.map(f => {
          const current = f.key === shown;
          return (
            <Link
              key={f.key}
              data-key={f.key}
              href={f.key === "all" ? "/deployments" : `/deployments?status=${f.key}`}
              scroll={false}
              aria-current={f.key === active ? "page" : undefined}
              onClick={() => setShown(f.key)}
              className={`relative inline-flex h-8 min-w-20 items-center justify-center gap-1.5 rounded-[8px] px-3.5 text-footnote whitespace-nowrap transition-[color,opacity] duration-200 active:opacity-60 ${
                current ? "font-semibold text-foreground" : "font-medium text-muted hover:text-foreground"
              } ${current && !ready ? "bg-elevated shadow-control" : ""}`}
            >
              {f.label}
              <span className="text-muted tabular-nums">{counts[f.key]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
