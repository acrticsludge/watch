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

// Run every 5 minutes — pollCycle skips free-tier integrations synced < 15 min ago
cron.schedule("*/5 * * * *", () => {
  console.log(`[worker] Poll cycle starting at ${new Date().toISOString()}`);
  runPollCycle().catch((err) =>
    console.error("[worker] Poll cycle error:", err)
  );
});

console.log("[worker] Scheduler started. Pro: 5-min polling, Free: 15-min polling.");
