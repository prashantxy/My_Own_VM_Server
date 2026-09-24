interface Env {
    BUCKET: R2Bucket;
}

const ID_RE = /^[a-z0-9]{5,32}$/;

const MIME: Record<string, string> = {
    html: "text/html; charset=utf-8",
    css: "text/css; charset=utf-8",
    js: "application/javascript; charset=utf-8",
    mjs: "application/javascript; charset=utf-8",
    json: "application/json",
    svg: "image/svg+xml",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    ico: "image/x-icon",
    txt: "text/plain; charset=utf-8",
    woff: "font/woff",
    woff2: "font/woff2",
    wasm: "application/wasm",
};

function extension(path: string) {
    const last = path.split("/").pop() ?? "";
    const dot = last.lastIndexOf(".");
    return dot === -1 ? "" : last.slice(dot + 1).toLowerCase();
}

export default {
    async fetch(request, env): Promise<Response> {
        if (request.method !== "GET" && request.method !== "HEAD") {
            return new Response("Method not allowed", { status: 405 });
        }

        // <id>.yourdomain.com
        const url = new URL(request.url);
        const id = url.hostname.split(".")[0];
        if (!ID_RE.test(id)) return new Response("Not found", { status: 404 });

        let path = decodeURIComponent(url.pathname);
        if (path.endsWith("/")) path += "index.html";

        let object = await env.BUCKET.get(`dist/${id}${path}`);
        // SPA fallback: extensionless routes like /about are served by index.html
        if (!object && !extension(path)) {
            path = "/index.html";
            object = await env.BUCKET.get(`dist/${id}${path}`);
        }
        if (!object) return new Response("Not found", { status: 404 });

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        if (!headers.has("content-type")) {
            headers.set("content-type", MIME[extension(path)] ?? "application/octet-stream");
        }
        headers.set("cache-control", extension(path) === "html" ? "no-cache" : "public, max-age=3600");

        return new Response(request.method === "HEAD" ? null : object.body, { headers });
    },
} satisfies ExportedHandler<Env>;
