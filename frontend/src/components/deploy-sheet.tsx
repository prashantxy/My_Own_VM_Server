"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { project, rubberband, Spring, type SpringConfig } from "@/lib/spring";
import { DeployForm } from "./deploy-form";

/*
 * "New deployment" as a sheet, so the form is one tap away from any page.
 * Phones get a bottom sheet you can drag and flick away; wider screens get a centered panel.
 * Built on <dialog>, so focus containment, Escape and the inert background come from the platform.
 */

const OpenSheet = createContext<(() => void) | null>(null);

export function useDeploySheet() {
  return useContext(OpenSheet);
}

export function DeploySheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const show = useCallback(() => setOpen(true), []);

  // "/" opens the sheet on pages that don't have a deploy form of their own.
  useEffect(() => {
    if (pathname === "/" || open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      e.preventDefault();
      setOpen(true);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pathname, open]);

  return (
    <OpenSheet value={show}>
      {children}
      {open && <DeploySheet pathname={pathname} onClosed={() => setOpen(false)} />}
    </OpenSheet>
  );
}

const OPEN: SpringConfig = { dampingRatio: 1, response: 0.38 };
const CLOSE: SpringConfig = { dampingRatio: 1, response: 0.3 };
// Only a release that carried momentum earns a little overshoot.
const SETTLE_AFTER_FLICK: SpringConfig = { dampingRatio: 0.82, response: 0.35 };
const DRAG_SLOP = 6;

function DeploySheet({ pathname, onClosed }: { pathname: string; onClosed: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const spring = useRef<Spring>(null);
  const closedAt = useRef(0);
  const mode = useRef({ sheet: false, reduced: false });
  const closing = useRef(false);
  const openedOn = useRef(pathname);

  const requestClose = useCallback(
    (velocity?: number) => {
      const s = spring.current;
      if (!s || closing.current) return;
      closing.current = true;
      s.to(closedAt.current, {
        velocity,
        config: CLOSE,
        onRest: () => {
          dialogRef.current?.close();
          onClosed();
        },
      });
    },
    [onClosed],
  );

  // Open: place the panel off-screen, then spring it home from there.
  useEffect(() => {
    const dialog = dialogRef.current!;
    const panel = panelRef.current!;
    const scrim = scrimRef.current!;
    mode.current = {
      sheet: window.matchMedia("(max-width: 639px)").matches,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };

    if (!dialog.open) dialog.showModal();
    const { sheet, reduced } = mode.current;
    closedAt.current = sheet ? panel.offsetHeight + 24 : 40;

    const render = (y: number) => {
      const t = Math.min(Math.max(y / closedAt.current, 0), 1); // 0 open, 1 closed
      scrim.style.opacity = String(1 - t);
      if (reduced) {
        // Reduced motion: the same timing as a cross-fade, with nothing moving.
        panel.style.opacity = String(1 - t);
        return;
      }
      if (sheet) {
        panel.style.transform = `translate3d(0, ${y}px, 0)`;
      } else {
        panel.style.transform = `translate3d(0, ${y}px, 0) scale(${1 - 0.04 * t})`;
        panel.style.opacity = String(1 - t);
      }
    };

    const s = new Spring(closedAt.current, OPEN, render);
    spring.current = s;
    render(closedAt.current);
    s.to(0);

    // Touch screens: don't throw the keyboard over the sheet before it lands.
    const input = dialog.querySelector<HTMLInputElement>("input[name=repoUrl]");
    if (window.matchMedia("(pointer: fine)").matches) input?.focus({ preventScroll: true });
    else panel.focus({ preventScroll: true });

    return () => s.stop();
  }, []);

  // Deploying navigates to the new deployment; the sheet steps aside for it.
  useEffect(() => {
    if (pathname !== openedOn.current) requestClose();
  }, [pathname, requestClose]);

  // Escape animates out instead of vanishing. If the browser force-closes anyway, clean up.
  function onCancel(e: React.SyntheticEvent) {
    e.preventDefault();
    requestClose();
  }
  function onClose() {
    if (!closing.current) {
      spring.current?.stop();
      onClosed();
    }
  }

  // Direct manipulation (phones): the panel tracks the finger 1:1 from where it was grabbed,
  // resists past the top, and on release uses the projected landing point to decide.
  const drag = useRef<{ id: number; startY: number; from: number; active: boolean; history: [number, number][] } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    if (!mode.current.sheet || mode.current.reduced || closing.current || drag.current) return;
    if ((e.target as HTMLElement).closest("input, button, a, textarea, select")) return;
    const s = spring.current!;
    s.stop(); // grab it mid-flight: start from the live value
    drag.current = { id: e.pointerId, startY: e.clientY, from: s.value, active: false, history: [[e.timeStamp, e.clientY]] };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    let dy = e.clientY - d.startY;
    if (!d.active) {
      if (Math.abs(dy) < DRAG_SLOP) return;
      d.active = true;
      d.startY = e.clientY; // begin from here so crossing the slop doesn't jump
      dy = 0;
      panelRef.current!.setPointerCapture(e.pointerId);
    }
    d.history.push([e.timeStamp, e.clientY]);
    if (d.history.length > 6) d.history.shift();
    const raw = d.from + dy;
    spring.current!.set(raw < 0 ? rubberband(raw, panelRef.current!.offsetHeight) : raw);
  }

  function onPointerUp(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    const s = spring.current!;
    if (!d.active) {
      s.to(0, { config: OPEN }); // a tap: resume wherever it was headed
      return;
    }
    const [t0, y0] = d.history[0];
    const [t1, y1] = d.history[d.history.length - 1];
    const velocity = t1 > t0 ? ((y1 - y0) / (t1 - t0)) * 1000 : 0; // px/s
    const landing = s.value + project(velocity);
    if (landing > closedAt.current * 0.5) requestClose(velocity);
    else s.to(0, { velocity, config: Math.abs(velocity) > 300 ? SETTLE_AFTER_FLICK : OPEN });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="deploy-sheet-title"
      onCancel={onCancel}
      onClose={onClose}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0 text-foreground backdrop:bg-transparent"
    >
      <div ref={scrimRef} onClick={() => requestClose()} className="absolute inset-0 bg-(--scrim) opacity-0" />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center sm:items-center sm:p-6">
        <div
          ref={panelRef}
          tabIndex={-1}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="material-thick pointer-events-auto relative w-full touch-none rounded-t-[28px] px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-window outline-none will-change-transform sm:max-w-[560px] sm:touch-auto sm:rounded-[28px] sm:p-7"
        >
          <span aria-hidden className="mx-auto mb-3 block h-[5px] w-9 rounded-full bg-fill-strong sm:hidden" />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 id="deploy-sheet-title" className="text-title">
                New deployment
              </h2>
              <p className="text-callout text-pretty text-muted">Paste a public repository. You’ll get a live URL in about a minute.</p>
            </div>
            <button
              type="button"
              onClick={() => requestClose()}
              aria-label="Close"
              className="-me-1 flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-fill text-muted transition-[background-color,scale] duration-200 ease-spring-snappy hover:bg-fill-strong active:scale-[0.92]"
            >
              <X aria-hidden strokeWidth={2.5} className="size-3.5" />
            </button>
          </div>
          <DeployForm id="sheet-repoUrl" />
        </div>
      </div>
    </dialog>
  );
}
