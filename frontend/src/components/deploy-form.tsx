"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, GitBranch } from "lucide-react";
import { deploy, type DeployState } from "@/app/actions";
import { buttonClass, Kbd, Spinner } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "h-11 ps-4 pe-3.5 sm:h-10")}>
      <span>Deploy</span>
      {pending ? <Spinner /> : <ArrowRight aria-hidden strokeWidth={2} className="size-4" />}
    </button>
  );
}

export function DeployForm() {
  const [state, action] = useActionState<DeployState, FormData>(deploy, {});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) inputRef.current?.focus();
  }, [state]);

  return (
    <form action={action} noValidate>
      <label htmlFor="repoUrl" className="mb-2 block text-sm font-medium">
        Repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
        <div
          className={`flex h-11 min-w-0 items-center sm:flex-1 gap-2.5 rounded-lg border bg-background ps-3 transition-[border-color,box-shadow] duration-150 focus-within:border-focus focus-within:ring-3 focus-within:ring-focus/15 sm:h-10 ${
            state.error ? "border-danger" : "border-border"
          }`}
        >
          <GitBranch aria-hidden strokeWidth={1.5} className="size-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            id="repoUrl"
            name="repoUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            required
            defaultValue={state.repoUrl}
            key={state.repoUrl}
            placeholder="https://github.com/you/your-app"
            aria-invalid={state.error ? true : undefined}
            aria-describedby="repoUrl-help"
            className="h-full min-w-0 flex-1 bg-transparent pe-3 font-mono text-base outline-none placeholder:text-muted/70 focus-visible:outline-none sm:text-sm"
          />
        </div>
        <SubmitButton />
      </div>
      <p id="repoUrl-help" className={`mt-2.5 text-sm text-pretty ${state.error ? "text-danger" : "text-muted"}`}>
        {state.error ?? (
          <>
            Any public repo where <Kbd>npm run build</Kbd> outputs to <Kbd>dist</Kbd>, <Kbd>build</Kbd> or <Kbd>out</Kbd>.
          </>
        )}
      </p>
    </form>
  );
}
