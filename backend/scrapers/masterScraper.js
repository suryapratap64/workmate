import { scrapeInternshala } from "./internshalaScraper.js";
import { scrapeNaukri } from "./naukriScraper.js";
import { scrapeLinkedIn } from "./linkedinScraper.js";
import connectDB from "../utils/db.js";
import ScrapedJob from "../models/scrapedJob.model.js";
import { filterJobsByLastWeek } from "./utils.js";

/**
 * Master Scraper Orchestrator
 * Coordinates scraping from multiple platforms and saves to MongoDB
 * Can be run manually or via cron job
 */

const SCRAPER_CONFIG = {
  internshala: {
    enabled: true, // Scraping internships alongside LinkedIn
    pages: 3,
    timeout: 60000,
  },
  naukri: {
    enabled: true, // ✅ RE-ENABLED - Using optimized URL for better job discovery
    pages: 3, // 3 pages = ~150-300 jobs per cycle
    timeout: 45000,
  },
  linkedin: {
    enabled: true,
    keywords: [
      "Frontend Developer",
      "Backend Developer",
      "Web Developer",
      "React Developer",
      "Node.js Developer",
      "Full Stack Developer",
    ],
    pages: 2, // 2 pages = ~50 jobs per cycle
    timeout: 120000, // 2 minutes for all pages
  },
};

/**
 * Run a scraper with timeout
 */
const runScraperWithTimeout = async (scraperName, scraperFn, timeout) => {
  return new Promise(async (resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ ${scraperName} scraper timed out after ${timeout}ms`);
      resolve([]);
    }, timeout);

    try {
      const result = await scraperFn();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ ${scraperName} scraper error:`, error.message);
      resolve([]);
    }
  });
};

/**
 * Save jobs to MongoDB
 */
const saveJobsToDatabase = async (jobs, platform) => {
  if (jobs.length === 0) {
    console.log(`No jobs to save for ${platform}`);
    return 0;
  }

  try {
    // ✅ PATCH Strategy: Save ALL jobs, cleanup handles old ones separately
    // NOTE: Removed filterJobsByLastWeek() - cleanup function handles date-based deletion
    const filteredJobs = jobs; // Save all jobs collected
    console.log(
      `💾 Saving ${filteredJobs.length} jobs from ${platform} (cleanup runs after save)`
    );

    // Create unique identifier for each job and ensure all required fields are present
    const jobsWithIdentifier = filteredJobs
      .filter((job) => {
        // Only save jobs with required fields
        if (!job.title || !job.company || !job.applyLink) {
          console.log(
            `⚠️  Skipping invalid job: ${job.title} from ${job.company}`
          );
          return false;
        }
        return true;
      })
      .map((job) => ({
        ...job,
        platform: platform,
        isActive: true, // Ensure all jobs are marked as active
        scrapedDate: new Date(), // Update scrape date
        uniqueId: `${platform}-${job.title}-${job.company}`
          .toLowerCase()
          .replace(/\s+/g, "-")
          .substring(0, 100), // Limit uniqueId length
      }));

    if (jobsWithIdentifier.length === 0) {
      console.log(`⚠️  No valid jobs to save for ${platform}`);
      return 0;
    }

    // Upsert jobs (update if exists, insert if not)
    const operations = jobsWithIdentifier.map((job) => ({
      updateOne: {
        filter: { uniqueId: job.uniqueId },
        update: { $set: job },
        upsert: true,
      },
    }));

    const result = await ScrapedJob.bulkWrite(operations);
    console.log(
      `✅ Saved ${
        result.upsertedCount + result.modifiedCount
      } jobs from ${platform}`
    );
    return result.upsertedCount + result.modifiedCount;
  } catch (error) {
    console.error(`Error saving ${platform} jobs to database:`, error.message);
    return 0;
  }
};

/**
 * Clear old jobs (optional - to avoid duplicates)
 */
const clearOldJobs = async (platform) => {
  try {
    const result = await ScrapedJob.deleteMany({ platform });
    console.log(`🗑️ Cleared ${result.deletedCount} old ${platform} jobs`);
    return result.deletedCount;
  } catch (error) {
    console.error(`Error clearing old ${platform} jobs:`, error.message);
    return 0;
  }
};

/**
 * Get scraping statistics
 */
const getScrapingStats = async () => {
  try {
    const stats = {};
    const platforms = ["LinkedIn", "Internshala", "Naukri"];

    for (const platform of platforms) {
      const count = await ScrapedJob.countDocuments({ platform });
      stats[platform] = count;
    }

    const total = await ScrapedJob.countDocuments();
    stats.total = total;
    return stats;
  } catch (error) {
    console.error("Error getting scraping stats:", error.message);
    return {};
  }
};

/**
 * Clean up old jobs (older than 7 days)
 * Keeps database optimized by removing stale job postings
 * Preserves recent jobs for better recommendations
 */
const cleanupOldJobs = async (daysOld = 7) => {
  try {
    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(
      `🧹 Starting cleanup - removing jobs older than ${daysOld} days (before ${cutoffDate.toLocaleDateString()})`
    );

    // Delete jobs older than 7 days based on postedDate (actual job posting date)
    const result = await ScrapedJob.deleteMany({
      postedDate: { $lt: cutoffDate },
      isActive: true,
    });

    if (result.deletedCount > 0) {
      console.log(
        `✅ Cleanup complete: Deleted ${result.deletedCount} old job postings`
      );
    } else {
      console.log(`✅ Cleanup complete: No old jobs to delete`);
    }

    return result.deletedCount;
  } catch (error) {
    console.error("Error during cleanup:", error.message);
    return 0;
  }
};

/**
 * Main orchestrator function
 */
export const runMasterScraper = async (options = {}) => {
  const config = { ...SCRAPER_CONFIG, ...options };
  const results = {
    timestamp: new Date(),
    platforms: {},
    totalJobsSaved: 0,
    totalJobsScraped: 0,
    errors: [],
  };

  console.log("\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║       🚀 MASTER WEB SCRAPER ORCHESTRATOR STARTED      ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    // Connect to database
    console.log("📡 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected\n");

    // Scrape from each platform
    const scraperTasks = [];

    // Internshala
    if (config.internshala.enabled) {
      console.log("📍 Starting Internshala scraper...");
      scraperTasks.push(
        runScraperWithTimeout(
          "Internshala",
          () => scrapeInternshala(config.internshala.pages),
          config.internshala.timeout
        )
          .then((jobs) => {
            results.platforms.internshala = {
              scraped: jobs.length,
              saved: 0,
              status: "completed",
            };
            results.totalJobsScraped += jobs.length;
            return { platform: "Internshala", jobs };
          })
          .catch((error) => {
            results.platforms.internshala = {
              status: "failed",
              error: error.message,
            };
            results.errors.push(`Internshala: ${error.message}`);
            return { platform: "Internshala", jobs: [] };
          })
      );
    }

    // Naukri
    if (config.naukri.enabled) {
      console.log("📍 Starting Naukri scraper...");
      scraperTasks.push(
        runScraperWithTimeout(
          "Naukri",
          () => scrapeNaukri(config.naukri.keywords),
          config.naukri.timeout
        )
          .then((jobs) => {
            results.platforms.naukri = {
              scraped: jobs.length,
              saved: 0,
              status: "completed",
            };
            results.totalJobsScraped += jobs.length;
            return { platform: "Naukri", jobs };
          })
          .catch((error) => {
            results.platforms.naukri = {
              status: "failed",
              error: error.message,
            };
            results.errors.push(`Naukri: ${error.message}`);
            return { platform: "Naukri", jobs: [] };
          })
      );
    }

    // LinkedIn
    if (config.linkedin.enabled) {
      console.log("📍 Starting LinkedIn scraper...");
      scraperTasks.push(
        runScraperWithTimeout(
          "LinkedIn",
          () => scrapeLinkedIn(config.linkedin.keywords, config.linkedin.pages),
          config.linkedin.timeout
        )
          .then((jobs) => {
            results.platforms.linkedin = {
              scraped: jobs.length,
              saved: 0,
              status: "completed",
            };
            results.totalJobsScraped += jobs.length;
            return { platform: "LinkedIn", jobs };
          })
          .catch((error) => {
            results.platforms.linkedin = {
              status: "failed",
              error: error.message,
            };
            results.errors.push(`LinkedIn: ${error.message}`);
            return { platform: "LinkedIn", jobs: [] };
          })
      );
    }

    // Wait for all scrapers
    console.log("⏳ Waiting for all scrapers to complete...\n");
    const scrapedData = await Promise.all(scraperTasks);

    // Save to database
    console.log("\n📊 Saving jobs to database...\n");
    for (const { platform, jobs } of scrapedData) {
      console.log(`\n🔍 Processing ${platform}...`);
      console.log(`   Jobs collected: ${jobs.length}`);

      if (jobs.length > 0) {
        try {
          const saved = await saveJobsToDatabase(jobs, platform);
          results.platforms[platform.toLowerCase()].saved = saved;
          results.totalJobsSaved += saved;
          console.log(`   ✅ Saved: ${saved} jobs`);
        } catch (error) {
          console.error(`   ❌ Error saving ${platform} jobs:`, error.message);
          results.platforms[platform.toLowerCase()].saved = 0;
        }
      } else {
        console.log(`   ⚠️ No jobs to save`);
      }
    }

    // Get final statistics
    console.log("\n📈 Fetching database statistics...");
    const stats = await getScrapingStats();

    // Cleanup old jobs (>7 days old)
    console.log("\n🧹 Running cleanup on old jobs...");
    const deletedCount = await cleanupOldJobs(7);
    results.jobsDeleted = deletedCount;

    // Get stats after cleanup
    const statsAfterCleanup = await getScrapingStats();

    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════╗");
    console.log("║              ✅ SCRAPING COMPLETED SUCCESSFULLY         ║");
    console.log("╚════════════════════════════════════════════════════════╝\n");

    console.log("📊 SUMMARY:");
    console.log(`   Total Jobs Scraped: ${results.totalJobsScraped}`);
    console.log(`   Total Jobs Saved:   ${results.totalJobsSaved}`);
    console.log(`   Old Jobs Deleted:   ${deletedCount}`);
    console.log(`   Total in Database:  ${statsAfterCleanup.total}\n`);

    console.log("📍 Platform Statistics (After Cleanup):");
    for (const [platform, count] of Object.entries(statsAfterCleanup)) {
      if (platform !== "total") {
        console.log(`   ${platform}: ${count} jobs`);
      }
    }

    if (results.errors.length > 0) {
      console.log("\n⚠️ ERRORS ENCOUNTERED:");
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log("\n✅ Scraping and cleanup completed!");

    return results;
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error.message);
    results.errors.push(`Fatal: ${error.message}`);
    return results;
  }
};

/**
 * CLI execution
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runMasterScraper().then((results) => {
    process.exit(results.errors.length > 0 ? 1 : 0);
  });
}

export default { runMasterScraper };
