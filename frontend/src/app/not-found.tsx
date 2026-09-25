import Link from "next/link";
import { buttonClass, container } from "@/components/ui";

export default function NotFound() {
  return (
    <div className={`${container} flex flex-col items-center py-24 text-center`}>
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance">Deployment not found</h1>
      <p className="mt-2 max-w-sm text-pretty text-muted">Check the ID in the URL, or pick a deployment from the list.</p>
      <Link href="/deployments" className={buttonClass("secondary", "mt-6")}>
        View deployments
      </Link>
    </div>
  );
}
