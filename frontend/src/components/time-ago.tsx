"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

export function TimeAgo({ iso, className }: { iso?: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(timer);
  }, []);

  if (!iso) return null;
  return (
    <time
      dateTime={iso}
      title={new Date(iso).toLocaleString()}
      suppressHydrationWarning
      className={`tabular-nums ${className ?? ""}`}
    >
      {timeAgo(iso, now)}
    </time>
  );
}
