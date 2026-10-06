# Quote brief browser regression tests

Run from the repository root:

```sh
pnpm --filter @workspace/brimas-media exec playwright install chromium
pnpm --filter @workspace/brimas-media run test:quote
```

On Replit, the supplied `REPLIT_PLAYWRIGHT_CHROMIUM_EXECUTABLE` is used instead
of a downloaded browser, so the installation step is unnecessary. Other Linux
CI hosts need Chromium's system dependencies (Playwright provides
`playwright install --with-deps chromium` on supported hosts).

The suite starts and stops its own Vite server on port **4174** with `PORT` and
`BASE_PATH` supplied. Keep that port free. No running preview, database, API,
credentials, or production URL is needed. These tests are intentionally separate
from `check:seo:live`, which remains a read-only HTTP checker.

The real quote page and catalog helper are exercised in Chromium. Every
off-origin request is aborted before network access, and attempted window
navigations are recorded for exact URL/message assertions. Tests never send a
message or contact WhatsApp. Do not remove the context-wide route guard or point
this suite at production.

Coverage includes all catalog service query preselection and reload, missing and
unknown queries, native required fields, whitespace-only required fields, custom
service overrides, optional-field trimming/omission/independence, exact recipient,
line order, and special-character/Unicode encoding.

On failures, Playwright writes traces to ignored `test-results/`. Inspect a trace
with `pnpm --filter @workspace/brimas-media exec playwright show-trace <trace.zip>`.