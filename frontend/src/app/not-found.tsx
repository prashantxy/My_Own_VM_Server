import Link from "next/link";
import { buttonClass, container } from "@/components/ui";

export default function NotFound() {
  return (
    <div className={`${container} flex flex-col items-center py-28 text-center`}>
      <p className="text-gradient text-[5rem] leading-none font-bold tracking-[-0.04em]">404</p>
      <h1 className="mt-4 text-large-title text-balance">Deployment not found</h1>
      <p className="mt-3 max-w-sm text-lede text-pretty text-muted">Check the ID in the URL, or pick a deployment from the list.</p>
      <Link href="/deployments" className={buttonClass("primary", "mt-8 h-11 px-6 text-body")}>
        View deployments
      </Link>
    </div>
  );
}
