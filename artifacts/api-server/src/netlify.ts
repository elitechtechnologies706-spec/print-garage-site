import type { IncomingMessage } from "node:http";
import serverless from "serverless-http";
import app from "./app";

const functionPath = "/.netlify/functions/api";

export const handler = serverless(app, {
  request(req: IncomingMessage) {
    // The public /api/* rewrite may reach the function with its internal URL.
    // Keep the public URL for Express routes and the admin cookie path.
    if (req.url === functionPath) req.url = "/api";
    else if (req.url?.startsWith(`${functionPath}/`)) {
      req.url = `/api/${req.url.slice(functionPath.length + 1)}`;
    }
  },
});