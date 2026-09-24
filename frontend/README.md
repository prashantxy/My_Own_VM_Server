# Deployer frontend

Next.js 16 dashboard for the deploy API in `../cloudflare/api`, deployed to Cloudflare Workers with [OpenNext](https://opennext.js.org/cloudflare).

- `/` – deploy form (server action) + list of deployments
- `/deployments/[id]` – live build status, polls `/api/deployments/[id]`

Env: `API_URL` (API worker URL), `SITES_DOMAIN` (domain the serve worker answers on), `GITHUB_REPO` (repo running the build workflow, for build-log links).

```bash
npm run dev       # local, reads .env.local
npm run preview   # run the Cloudflare build locally
npm run deploy    # build + deploy to Cloudflare
```
