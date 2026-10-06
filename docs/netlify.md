# Netlify deployment

Connect the repository to Netlify with the repository root as the base directory. The root `netlify.toml` builds the Brimas site, publishes its pre-rendered pages, and routes `/api/*` through the existing Express API as a Netlify Function. It does not replace the Replit preview or deployment configuration.

Before deploying, configure these **server-side environment variables in Netlify** (not in the site bundle):

- `DATABASE_URL`: a PostgreSQL connection string reachable from Netlify Functions, with the `homepage_views` schema already applied. Netlify does not inherit the Replit database or its credentials automatically.
- `BRIMAS_VIEWS_PASSWORD`: the password for the private visit-history page.
- `SESSION_SECRET`: a strong, stable secret for signing admin sessions. Changing it signs out existing sessions.

Do not paste any of these values into `netlify.toml` or commit them to the repository. If using a separate Netlify database, apply the schema there before accepting traffic; avoid pointing the deployment at a development database containing records you do not intend to expose or modify.

The Netlify build requires Node.js and pnpm. The frontend build sets `PORT` and `BASE_PATH` explicitly because the Vite configuration requires them even for a static build. Netlify serves existing pre-rendered HTML for service and price pages; the last redirect is only for unmatched client-side routes.

The admin login's failed-attempt counter is currently held in process memory. On Netlify Functions this counter is per warm function instance, not a shared site-wide rate limit. Use a strong admin password and add a shared or edge-level rate limit if the admin page will be exposed to sustained public traffic.