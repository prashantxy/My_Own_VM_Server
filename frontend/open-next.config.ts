import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page renders per request, so no incremental cache is configured.
export default defineCloudflareConfig({});
