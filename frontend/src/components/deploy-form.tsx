"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { deploy, type DeployState } from "@/app/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 shrink-0 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Starting…" : "Deploy"}
    </button>
  );
}

export function DeployForm() {
  const [state, action] = useActionState<DeployState, FormData>(deploy, {});

  return (
    <form action={action} className="w-full">
      <label htmlFor="repoUrl" className="mb-2 block text-sm font-medium">
        Git repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="repoUrl"
          name="repoUrl"
          type="url"
          required
          defaultValue={state.repoUrl}
          placeholder="https://github.com/user/my-vite-app"
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "repoUrl-error" : "repoUrl-hint"}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-sm outline-none transition-colors placeholder:text-muted focus:border-foreground"
        />
        <SubmitButton />
      </div>
      {state.error ? (
        <p id="repoUrl-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : (
        <p id="repoUrl-hint" className="mt-2 text-sm text-muted">
          Public repo with an <code className="font-mono">npm run build</code> that outputs to{" "}
          <code className="font-mono">dist/</code>, <code className="font-mono">build/</code> or{" "}
          <code className="font-mono">out/</code>.
        </p>
      )}
    </form>
  );
}
