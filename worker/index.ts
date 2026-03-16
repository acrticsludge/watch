import * as dotenv from "dotenv";
import * as cron from "node-cron";
import { runPollCycle } from "./pollCycle";

// Load .env locally; on Railway, env vars are injected automatically
dotenv.config();

console.log("[worker] Starting Stackwatch polling worker...");

// Run once on startup
runPollCycle().catch((err) =>
  console.error("[worker] Startup poll failed:", err)
);

// Poll every 15 minutes
cron.schedule("*/15 * * * *", () => {
  console.log(`[worker] Poll cycle starting at ${new Date().toISOString()}`);
  runPollCycle().catch((err) =>
    console.error("[worker] Poll cycle error:", err)
  );
});

console.log("[worker] Scheduler started. Polling every 15 minutes.");
