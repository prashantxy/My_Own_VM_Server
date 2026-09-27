"use client";

import { WifiOff } from "lucide-react";
import { buttonClass, container } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className={`${container} flex flex-col items-center py-28 text-center`}>
      <span className="mb-6 flex size-14 items-center justify-center rounded-[16px] bg-dot-warning text-white">
        <WifiOff aria-hidden strokeWidth={2} className="size-7" />
      </span>
      <h1 className="text-large-title text-balance">Unable to load this page</h1>
      <p className="mt-3 max-w-sm text-lede text-pretty text-muted">The deploy API didn’t respond. Check your connection and try again.</p>
      <button type="button" onClick={reset} className={buttonClass("primary", "mt-8 h-11 px-6 text-body")}>
        Try again
      </button>
    </div>
  );
}
