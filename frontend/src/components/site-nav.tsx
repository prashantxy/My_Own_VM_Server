"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDeploySheet } from "./deploy-sheet";
import { buttonClass } from "./ui";

const link =
  "flex h-8 items-center rounded-full px-3 text-footnote transition-[color,background-color] duration-200 ease-spring";

export function SiteNav() {
  const pathname = usePathname();
  const onDeployments = pathname.startsWith("/deployments");

  return (
    <div className="-me-1 flex items-center gap-0.5">
      <Link href="/#how" className={`${link} hidden text-foreground/80 hover:text-foreground sm:flex`}>
        How it works
      </Link>
      <Link href="/#architecture" className={`${link} hidden text-foreground/80 hover:text-foreground md:flex`}>
        Architecture
      </Link>
      <Link
        href="/deployments"
        aria-current={onDeployments ? "page" : undefined}
        className={`${link} ${onDeployments ? "bg-fill font-medium text-foreground" : "text-foreground/80 hover:text-foreground"}`}
      >
        Deployments
      </Link>
      <DeployLink className={buttonClass("primary", "ms-2 h-8 px-3.5 text-footnote")}>Deploy</DeployLink>
    </div>
  );
}

// Goes to the deploy form. On the home page it focuses the form that's already there; elsewhere it
// opens the deploy sheet. Without JavaScript it's a plain link to the form.
export function DeployLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const openSheet = useDeploySheet();

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const input = pathname === "/" ? document.getElementById("repoUrl") : null;
    if (input) {
      e.preventDefault();
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("deploy")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      input.focus({ preventScroll: true });
    } else if (openSheet) {
      e.preventDefault();
      openSheet();
    }
  }

  return (
    <Link href="/#deploy" onClick={onClick} aria-haspopup={pathname === "/" ? undefined : "dialog"} className={className}>
      {children}
    </Link>
  );
}
