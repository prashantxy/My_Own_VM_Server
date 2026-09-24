"use client";

import { buttonClass } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Unable to load this page</h1>
      <p className="mt-2 max-w-sm text-pretty text-muted">The deploy API didn’t respond. Check your connection and try again.</p>
      <button type="button" onClick={reset} className={buttonClass("secondary", "mt-6")}>
        Try again
      </button>
    </div>
  );
}
