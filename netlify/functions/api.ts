// Netlify runs the same Express app as the Replit API service, without opening a port.
export { handler } from "../../artifacts/api-server/src/netlify";