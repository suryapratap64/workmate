import cron from "node-cron";
import { runMasterScraper } from "../scrapers/masterScraper.js";
import connectDB from "./db.js";

/**
 * Scraper Scheduler - Automatically runs web scrapers at scheduled intervals
 * Uses node-cron for scheduling tasks
 */

let scheduledTasks = [];

/**
 * Cron schedule patterns:
 * 
 * Format: minute hour day-of-month month day-of-week
 * 
//  * Examples:
//  * 0 0 * * * - Every day at 00:00 (midnight)
 * 0 *6 * * * - Every 6 hours
//  * 0 9,14,19 * * * - At 9 AM, 2 PM, 7 PM daily
//  * 0 * * * * - Every hour
//  * *30 * * * * - Every 30 minutes
//  */

const SCHEDULE_PATTERNS = {
  EVERY_2_MINUTES: "*/2 * * * *", // Every 2 minutes
  DAILY: "0 0 * * *", // 00:00 daily
  EVERY_6_HOURS: "0 */6 * * *", // Every 6 hours
  EVERY_12_HOURS: "0 */12 * * *", // Every 12 hours
  HOURLY: "0 * * * *", // Every hour
  MORNING: "0 9 * * *", // 9 AM daily
  AFTERNOON: "0 14 * * *", // 2 PM daily
  EVENING: "0 19 * * *", // 7 PM daily
};

/**
 * Schedule scraper task
 */
export const scheduleScraperTask = (name, cronPattern, scraperConfig = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const task = cron.schedule(
        cronPattern,
        async () => {
          console.log(
            `\n⏱️ [${name}] Scheduled scraper task triggered at ${new Date().toISOString()}`
          );

          try {
            // Connect to DB if not connected
            await connectDB();

            // Run scraper
            const results = await runMasterScraper(scraperConfig);

            console.log(`\n✅ [${name}] Task completed successfully`);
            console.log(`   Scraped: ${results.totalJobsScraped} jobs`);
            console.log(`   Saved: ${results.totalJobsSaved} jobs`);

            if (results.errors.length > 0) {
              console.log(`   ⚠️ Errors: ${results.errors.length}`);
              results.errors.forEach((error) =>
                console.log(`      - ${error}`)
              );
            }
          } catch (error) {
            console.error(`❌ [${name}] Task failed:`, error.message);
          }
        },
        {
          scheduled: false, // Don't auto-start
        }
      );

      // Start the scheduled task
      task.start();

      const taskInfo = {
        name,
        pattern: cronPattern,
        task,
        createdAt: new Date(),
      };

      scheduledTasks.push(taskInfo);

      console.log(`✅ Scheduled task "${name}" created`);
      console.log(`   Pattern: ${cronPattern}`);
      console.log(`   Next run: ${task.nextDate().toString()}`);

      resolve(taskInfo);
    } catch (error) {
      console.error(`Error scheduling task "${name}":`, error.message);
      reject(error);
    }
  });
};

/**
 * Stop a scheduled task
 */
export const stopScheduledTask = (taskName) => {
  const taskIndex = scheduledTasks.findIndex((t) => t.name === taskName);

  if (taskIndex === -1) {
    console.warn(`Task "${taskName}" not found`);
    return false;
  }

  const task = scheduledTasks[taskIndex];
  task.task.stop();
  scheduledTasks.splice(taskIndex, 1);

  console.log(`✅ Stopped scheduled task: "${taskName}"`);
  return true;
};

/**
 * Stop all scheduled tasks
 */
export const stopAllScheduledTasks = () => {
  scheduledTasks.forEach((t) => t.task.stop());
  console.log(`✅ Stopped ${scheduledTasks.length} scheduled tasks`);
  scheduledTasks = [];
};

/**
 * List all scheduled tasks
 */
export const listScheduledTasks = () => {
  if (scheduledTasks.length === 0) {
    console.log("No scheduled tasks");
    return [];
  }

  console.log("\n📅 Scheduled Tasks:");
  scheduledTasks.forEach((t, index) => {
    console.log(`  ${index + 1}. ${t.name}`);
    console.log(`     Pattern: ${t.pattern}`);
    console.log(`     Created: ${t.createdAt.toLocaleString()}`);
    console.log(`     Next run: ${t.task.nextDate().toString()}`);
  });

  return scheduledTasks;
};

/**
 * Initialize default scheduled tasks
 */
export const initializeScheduledScrapers = async () => {
  console.log("\n🚀 Initializing scheduled scrapers...\n");

  try {
    // Schedule scraper to run every 2 minutes
    // This ensures constant fresh data from job websites

    await scheduleScraperTask(
      "Every-2-Minutes-Scrape",
      SCHEDULE_PATTERNS.EVERY_2_MINUTES,
      {
        internshala: { enabled: true, pages: 1 },
        naukri: {
          enabled: true,
          keywords: ["Developer", "Designer", "Manager"],
          pages: 1,
        },
        linkedin: { enabled: false }, // Disable LinkedIn due to rate limiting
      }
    );

    console.log("\n✅ Scheduled scrapers initialized successfully\n");
  } catch (error) {
    console.error("Error initializing scheduled scrapers:", error.message);
  }
};

/**
 * Run scraper immediately (one-time)
 */
export const runScraperNow = async (scraperConfig = {}) => {
  console.log("\n🚀 Running scraper immediately...\n");

  try {
    await connectDB();
    const results = await runMasterScraper(scraperConfig);
    return results;
  } catch (error) {
    console.error("Error running scraper:", error.message);
    throw error;
  }
};

/**
 * Validate cron pattern
 */
export const validateCronPattern = (pattern) => {
  try {
    cron.validate(pattern);
    return true;
  } catch (error) {
    console.error("Invalid cron pattern:", error.message);
    return false;
  }
};

export default {
  scheduleScraperTask,
  stopScheduledTask,
  stopAllScheduledTasks,
  listScheduledTasks,
  initializeScheduledScrapers,
  runScraperNow,
  validateCronPattern,
  SCHEDULE_PATTERNS,
};
