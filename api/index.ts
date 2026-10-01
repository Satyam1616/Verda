// Vercel serverless entry point.
// Vercel rewrites every /api/* request to this function (see vercel.json),
// and the Express app's own routes (/api/generate-tags, /api/generate-proposal,
// /api/generate-impact, /api/chat) match the preserved request path.
import app from '../src/server.js';

export default app;
