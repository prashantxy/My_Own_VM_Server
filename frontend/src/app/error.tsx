"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted">The deploy API didn&apos;t respond as expected.</p>
      <button onClick={reset} className="text-sm underline">
        Try again
      </button>
    </div>
  );
}
