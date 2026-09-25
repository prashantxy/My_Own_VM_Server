"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClass } from "./ui";

const link = "flex h-9 items-center rounded-lg px-2.5 text-sm transition-colors duration-150";

export function SiteNav() {
  const pathname = usePathname();
  const onDeployments = pathname.startsWith("/deployments");

  return (
    <div className="-me-1 flex items-center gap-1">
      <Link href="/#how" className={`${link} hidden text-muted hover:text-foreground sm:flex`}>
        How it works
      </Link>
      <Link
        href="/deployments"
        aria-current={onDeployments ? "page" : undefined}
        className={`${link} ${onDeployments ? "text-foreground" : "text-muted hover:text-foreground"}`}
      >
        Deployments
      </Link>
      <DeployLink className={buttonClass("primary", "ms-1.5 h-8 px-3")}>Deploy</DeployLink>
    </div>
  );
}

// Goes to the deploy form. On the home page it skips navigation and focuses the field directly,
// since a same-page hash link wouldn't move focus.
export function DeployLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    const input = document.getElementById("repoUrl");
    if (!input) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("deploy")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    input.focus({ preventScroll: true });
  }

  return (
    <Link href="/#deploy" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
