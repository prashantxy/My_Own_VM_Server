"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { buttonClass } from "./ui";

const iconSwap = "absolute inset-0 m-auto size-4 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]";

export function CopyButton({ value, label = "Copy URL", iconOnly = false }: { value: string; label?: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  // Both icons stay mounted and cross-fade, so the swap has an enter and an exit.
  const icons = (
    <span className="relative size-4" aria-hidden>
      <Copy strokeWidth={2} className={`${iconSwap} ${copied ? "scale-25 opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-[0px]"}`} />
      <Check strokeWidth={2} className={`${iconSwap} text-success ${copied ? "scale-100 opacity-100 blur-[0px]" : "scale-25 opacity-0 blur-[4px]"}`} />
    </span>
  );

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={iconOnly ? label : undefined}
      className={iconOnly ? buttonClass("ghost", "w-9 px-0") : buttonClass("secondary")}
    >
      {icons}
      {!iconOnly && <span>{copied ? "Copied" : label}</span>}
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
