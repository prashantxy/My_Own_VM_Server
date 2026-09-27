"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, GitBranch } from "lucide-react";
import { deploy, type DeployState } from "@/app/actions";
import { buttonClass, Kbd, Spinner } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "h-12 ps-5 pe-4 text-body sm:h-11")}>
      <span>{pending ? "Deploying" : "Deploy"}</span>
      {pending ? <Spinner /> : <ArrowRight aria-hidden strokeWidth={2.25} className="size-4" />}
    </button>
  );
}

// `id` names the field; the page's own form keeps "repoUrl" so /#deploy and the "/" shortcut find it.
export function DeployForm({ id = "repoUrl" }: { id?: string }) {
  const [state, action] = useActionState<DeployState, FormData>(deploy, {});
  const inputRef = useRef<HTMLInputElement>(null);
  const helpId = `${id}-help`;
  const onPage = id === "repoUrl";

  useEffect(() => {
    if (state.error) inputRef.current?.focus();
  }, [state]);

  // Arriving via /#deploy from another page lands with the field ready to type in.
  useEffect(() => {
    if (onPage && window.location.hash === "#deploy") inputRef.current?.focus();
  }, [onPage]);

  // "/" jumps to the repository field from anywhere on the page, unless the user is already typing.
  useEffect(() => {
    if (!onPage) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onPage]);

  return (
    <form action={action} noValidate>
      <label htmlFor={id} className="sr-only">
        Repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2.5">
        <div
          className={`flex h-12 min-w-0 items-center gap-2.5 rounded-[14px] bg-fill ps-4 transition-[box-shadow,background-color] duration-200 ease-spring focus-within:bg-elevated focus-within:shadow-[0_0_0_1px_var(--focus),0_0_0_4px_color-mix(in_srgb,var(--focus)_22%,transparent)] sm:h-11 sm:flex-1 ${
            state.error ? "shadow-[0_0_0_1px_var(--danger)]" : ""
          }`}
        >
          <GitBranch aria-hidden strokeWidth={2} className="size-[18px] shrink-0 text-muted" />
          <input
            ref={inputRef}
            id={id}
            name="repoUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            autoCapitalize="none"
            spellCheck={false}
            required
            defaultValue={state.repoUrl}
            key={state.repoUrl}
            placeholder="https://github.com/you/your-app"
            aria-invalid={state.error ? true : undefined}
            aria-describedby={helpId}
            aria-keyshortcuts="/"
            className="peer h-full min-w-0 flex-1 bg-transparent pe-3 text-base outline-none placeholder:text-muted focus-visible:outline-none sm:text-callout"
          />
          <kbd
            aria-hidden
            className="me-3 hidden size-6 shrink-0 items-center justify-center rounded-md bg-elevated font-mono text-footnote text-muted shadow-card peer-focus:invisible pointer-fine:flex"
          >
            /
          </kbd>
        </div>
        <SubmitButton />
      </div>
      <p id={helpId} aria-live="polite" className={`mt-3 text-footnote text-pretty ${state.error ? "text-danger" : "text-muted"}`}>
        {state.error ?? (
          <>
            Any public repo where <Kbd>npm run build</Kbd> outputs to <Kbd>dist</Kbd>, <Kbd>build</Kbd> or <Kbd>out</Kbd>.
          </>
        )}
      </p>
    </form>
  );
}
