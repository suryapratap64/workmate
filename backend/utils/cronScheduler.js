import cron from "node-cron";
import ScrapedJob from "../models/scrapedJob.model.js";
import { runMasterScraper } from "../scrapers/masterScraper.js";

let cronJobs = {
  scraper: null,
  cleaner: null,
};

/**
 * Run scraper with intelligent PATCH strategy:
 * 1. Scrape new jobs from all platforms
 * 2. UPSERT (merge) new jobs with existing ones (no deletion)
 * 3. Auto-cleanup jobs older than 7 days
 * 4. Result: Always fresh + optimized database size
 */
const runScraperJob = async () => {
  try {
    console.log(
      `\n🚀 [${new Date().toISOString()}] Starting scheduled scraper job...`
    );

    // Fetch fresh jobs from all platforms (PATCH strategy - no deletion)
    console.log(
      "📡 Scraping fresh jobs from all platforms (PATCH strategy)..."
    );
    const results = await runMasterScraper();

    console.log(`\n📊 Scraper Job Results:`);
    console.log(`   ✅ Scraped: ${results.totalJobsScraped} jobs`);
    console.log(
      `   ✅ Saved: ${results.totalJobsSaved} jobs (merged, no duplicates)`
    );
    console.log(
      `   🧹 Deleted: ${results.jobsDeleted || 0} jobs (older than 7 days)`
    );

    const totalJobs = await ScrapedJob.countDocuments();
    console.log(`   📦 Total in DB: ${totalJobs} jobs`);
    console.log(`✅ [${new Date().toISOString()}] Scraper job completed\n`);
  } catch (error) {
    console.error(
      `❌ [${new Date().toISOString()}] Error in scheduled scraper job:`,
      error.message
    );
  }
};

/**
 * Initialize all cron jobs
 * Uses PATCH (upsert) strategy for intelligent data management:
 * - Scrape new jobs every 5 minutes
 * - Merge with existing jobs (no deletions)
 * - Auto-cleanup jobs older than 7 days
 * - Result: Fresh data + optimized database size
 */
export const initializeCronJobs = () => {
  try {
    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║          ⏰ INITIALIZING CRON SCHEDULER JOBS           ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    // Cron job to run scraper every 5 minutes
    // Pattern: "*/5 * * * *" = Every 5 minutes (00, 05, 10, 15, 20, ... 55)
    // Uses PATCH (upsert) strategy - smart incremental updates
    cronJobs.scraper = cron.schedule("*/5 * * * *", runScraperJob, {
      scheduled: false,
    });

    cronJobs.scraper.start();
    console.log(
      "✅ Scraper Job initialized - runs every 5 minutes with PATCH (upsert) strategy"
    );

    console.log("\n📅 Cron Schedule Details:");
    console.log("   • Cycle: Every 5 minutes (00, 05, 10, 15, 20, ... 55)");
    console.log(
      "   • Strategy: PATCH (upsert) - intelligent incremental updates"
    );
    console.log("   • Per cycle:");
    console.log("     1. 📡 Scrape fresh jobs from all platforms");
    console.log(
      "     2. 🔄 MERGE with existing jobs (no duplicates, no deletions)"
    );
    console.log("     3. 🧹 AUTO-CLEANUP: Delete jobs older than 7 days");
    console.log(
      "   • Result: Always fresh data + optimized database size (~2500-4200 jobs)\n"
    );

    return {
      status: "initialized",
      jobs: {
        scraper: "*/5 * * * *",
      },
    };
  } catch (error) {
    console.error("❌ Error initializing cron jobs:", error.message);
    return {
      status: "failed",
      error: error.message,
    };
  }
};

/**
 * Stop all cron jobs
 */
export const stopCronJobs = () => {
  try {
    if (cronJobs.scraper) {
      cronJobs.scraper.stop();
      console.log("⏸️  Scraper cron job stopped");
    }
    if (cronJobs.cleaner) {
      cronJobs.cleaner.stop();
      console.log("⏸️  Cleaner cron job stopped");
    }
    console.log("✅ All cron jobs stopped\n");
  } catch (error) {
    console.error("Error stopping cron jobs:", error.message);
  }
};

/**
 * Get status of all cron jobs
 */
export const getCronJobStatus = async () => {
  try {
    const totalJobs = await ScrapedJob.countDocuments();
    const platformStats = await ScrapedJob.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const oldJobsCount = await ScrapedJob.countDocuments({
      scrapedDate: { $lt: threeDaysAgo },
    });

    return {
      status: "active",
      cronJobs: {
        scraper: cronJobs.scraper?.status || "stopped",
        cleaner: cronJobs.cleaner?.status || "stopped",
      },
      database: {
        totalJobs,
        platformBreakdown: platformStats,
        oldJobsWaitingForDeletion: oldJobsCount,
      },
      nextCleanup: new Date(Date.now() + 60 * 60 * 1000), // Approximate next cleanup
      lastUpdate: new Date(),
    };
  } catch (error) {
    console.error("Error getting cron status:", error.message);
    return { status: "error", error: error.message };
  }
};

/**
 * Manual trigger to run scraper now (bypassing schedule)
 * Uses PATCH strategy - no data loss
 */
export const manualTriggerScraper = async () => {
  console.log(`🚀 Manual scraper trigger at ${new Date().toISOString()}`);
  return await runScraperJob();
};

export default {
  initializeCronJobs,
  stopCronJobs,
  getCronJobStatus,
  manualTriggerScraper,
};
