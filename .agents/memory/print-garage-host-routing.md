---
name: Print Garage host routing
description: Custom-domain hosting differs from the Replit deployment and affects API-backed images
---

`https://printgarage.online` redirects to `www.printgarage.online`, which is served by Netlify. The Replit deployment currently reports `https://print-garage-site.replit.app` as its primary URL and no custom domain. Its catalogue image API uses the Replit sidecar at `127.0.0.1:1106` for App Storage access, which Netlify functions cannot reach. Root `pino` and `pino-http` dependencies are still needed by Netlify's API function, but they do not solve that storage boundary.

**Why:** On 2026-10-15, the user reported broken service images on the custom domain while the same images loaded in Replit preview and production. Netlify's missing module explained one function failure; its inability to reach Replit's storage sidecar explained why dependency repair alone was insufficient.

**How to apply:** Do not assume publishing from Replit updates `printgarage.online`. Keep Netlify's externally loaded modules in root dependencies, and route `/api/catalogue-assets/*` through an explicit Netlify proxy to the Replit deployment before the generic `/api/*` function redirect, or move the custom domain to a host that can access App Storage. Use local `public/` copies for a small set of fixed assets when appropriate. Rebuild Netlify before treating the custom-domain fix as live.
