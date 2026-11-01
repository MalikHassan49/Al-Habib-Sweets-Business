import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';
import { processPendingCleanups } from './services/imageCleanup.js';
import dns from "node:dns";

dns.setServers(['8.8.8.8']);

await connectDB();
app.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));

// Retryable ImageKit cleanup: runs at start and every 15 minutes.
const runCleanup = () => processPendingCleanups().catch((e) => console.error('Cleanup run failed:', e.message));
runCleanup();
setInterval(runCleanup, 15 * 60 * 1000).unref();
