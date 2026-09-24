# Vercel Deployement Server 

## System Design

## COre logic Redis+AWS+S3 

#thanks to hkirat

## Cloudflare architecture

```
Next.js dashboard (frontend/, on Workers via OpenNext)
        │ server actions / route handlers
        ▼
POST /deploy ─► API Worker (cloudflare/api) ──workflow_dispatch──► GitHub Actions (.github/workflows/build.yml)
                    │  status in KV                                  build job: clone + npm build (no secrets)
GET /status, /deployments ◄──┘  ◄──────── POST /callback ─────────────────── upload job: aws s3 sync → R2 dist/<id>/
<id>.yourdomain ─► Serve Worker (cloudflare/serve) ─► R2 binding
```

Setup:

1. `cd cloudflare/api && npx wrangler kv namespace create STATUS`, put the id in `wrangler.jsonc`.
2. `npx wrangler secret put GITHUB_TOKEN` (fine-grained PAT, Actions: read & write on this repo) and `npx wrangler secret put CALLBACK_SECRET` (any random string), then `npm run deploy`.
3. In `cloudflare/serve/wrangler.jsonc` set your domain, add a proxied DNS record `*  AAAA  100::`, then `npm run deploy`.
4. GitHub repo → Settings → Secrets and variables → Actions:
   - secrets: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `CALLBACK_SECRET` (same value as step 2)
   - variables: `API_URL` (the API worker URL), optionally `R2_BUCKET` (default `vercel`)
5. Frontend: in `frontend/wrangler.jsonc` set `API_URL` (API worker URL) and `SITES_DOMAIN`, then `cd frontend && npm run deploy`.

### Local development

```bash
cd cloudflare/api && printf 'GITHUB_TOKEN=...\nCALLBACK_SECRET=...\n' > .dev.vars && npx wrangler dev   # :8787
cd frontend && printf 'API_URL=http://localhost:8787\nSITES_DOMAIN=<your-domain>\n' > .env.local && npm run dev   # :3000
```
