interface Env {
    STATUS: KVNamespace;
    GITHUB_REPO: string;      // "owner/name" of the repo holding .github/workflows/build.yml
    GITHUB_WORKFLOW: string;  // "build.yml"
    GITHUB_REF: string;       // branch the workflow lives on
    GITHUB_TOKEN: string;     // secret: fine-grained PAT with Actions: read & write on GITHUB_REPO
    CALLBACK_SECRET: string;  // secret: shared with the workflow to report build results
}

type Status = "queued" | "deployed" | "failed";

const ID_RE = /^[a-z0-9]{5,32}$/;
const MAX_LEN = 5;

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
    return Response.json(body, { status, headers: cors });
}

function generate() {
    const subset = "123456789qwertyuiopasdfghjklzxcvbnm";
    const bytes = crypto.getRandomValues(new Uint8Array(MAX_LEN));
    return Array.from(bytes, b => subset[b % subset.length]).join("");
}

async function setStatus(env: Env, id: string, status: Status, repoUrl?: string) {
    const prev = await env.STATUS.get<{ repoUrl?: string }>(id, "json");
    await env.STATUS.put(id, JSON.stringify({
        status,
        repoUrl: repoUrl ?? prev?.repoUrl,
        updatedAt: new Date().toISOString(),
    }));
}

async function deploy(request: Request, env: Env) {
    const body = await request.json<{ repoUrl?: string }>().catch(() => null);
    let repoUrl: URL;
    try {
        repoUrl = new URL(body?.repoUrl ?? "");
    } catch {
        return json({ error: "repoUrl must be a valid URL" }, 400);
    }
    if (repoUrl.protocol !== "https:") {
        return json({ error: "repoUrl must be an https git URL" }, 400);
    }

    const id = generate();
    await setStatus(env, id, "queued", repoUrl.href);

    const res = await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPO}/actions/workflows/${env.GITHUB_WORKFLOW}/dispatches`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "vercel-clone-api",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({ ref: env.GITHUB_REF, inputs: { id, repo_url: repoUrl.href } }),
        },
    );
    if (!res.ok) {
        console.error("workflow dispatch failed", res.status, await res.text());
        await setStatus(env, id, "failed");
        return json({ error: "could not start build" }, 502);
    }

    return json({ id });
}

async function status(url: URL, env: Env) {
    const id = url.searchParams.get("id") ?? "";
    const entry = await env.STATUS.get<{ status: Status }>(id, "json");
    return json({ status: entry?.status ?? null });
}

// Called by the GitHub workflow when a build finishes.
async function callback(request: Request, env: Env) {
    if (request.headers.get("Authorization") !== `Bearer ${env.CALLBACK_SECRET}`) {
        return json({ error: "unauthorized" }, 401);
    }
    const body = await request.json<{ id?: string; status?: string }>().catch(() => null);
    if (!body?.id || !ID_RE.test(body.id) || (body.status !== "deployed" && body.status !== "failed")) {
        return json({ error: "bad request" }, 400);
    }
    await setStatus(env, body.id, body.status);
    return json({ ok: true });
}

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);

        if (request.method === "OPTIONS") return new Response(null, { headers: cors });
        if (request.method === "POST" && url.pathname === "/deploy") return deploy(request, env);
        if (request.method === "GET" && url.pathname === "/status") return status(url, env);
        if (request.method === "POST" && url.pathname === "/callback") return callback(request, env);

        return json({ error: "not found" }, 404);
    },
} satisfies ExportedHandler<Env>;
