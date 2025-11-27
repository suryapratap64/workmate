import { scrapeLinkedIn } from "./linkedinScraper.js";
import connectDB from "../utils/db.js";
import ScrapedJob from "../models/scrapedJob.model.js";
import { filterJobsByLastWeek } from "./utils.js";

/**
 * Fast test scraper - LinkedIn only, 1 page per keyword
 * Used to test the full pipeline without timeout
 */

async function testFastScraper() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║         ⚡ FAST TEST SCRAPER - LINKEDIN ONLY          ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  try {
    // Connect to DB
    console.log("📡 Connecting to database...");
    await connectDB();
    console.log("✅ Connected\n");

    // Scrape LinkedIn - 1 page per keyword
    const keywords = [
      "Web Developer India",
      "Frontend Developer India",
      "Backend Developer India",
    ];

    console.log("🚀 Starting LinkedIn scraper...");
    console.log(`   Keywords: ${keywords.join(", ")}`);
    console.log("   Pages per keyword: 1\n");

    const jobs = await scrapeLinkedIn(keywords, 1);

    console.log(`\n📊 Scraping complete!`);
    console.log(`   Total jobs collected: ${jobs.length}`);

    if (jobs.length === 0) {
      console.log("\n⚠️ No jobs collected!");
      process.exit(0);
    }

    // Filter to last week
    console.log(`\n📅 Filtering to last week...`);
    const filteredJobs = filterJobsByLastWeek(jobs);
    console.log(`   After filtering: ${filteredJobs.length} jobs\n`);

    // Show sample jobs
    console.log("📋 Sample jobs:");
    filteredJobs.slice(0, 3).forEach((job, i) => {
      console.log(`   ${i + 1}. ${job.title}`);
      console.log(`      Company: ${job.company}`);
      console.log(`      Posted: ${job.postedDate}`);
    });

    // Save to database
    console.log(`\n💾 Saving to database...`);
    if (filteredJobs.length > 0) {
      const jobsWithId = filteredJobs.map((job) => ({
        ...job,
        platform: "LinkedIn",
        isActive: true,
        scrapedDate: new Date(),
        uniqueId: `LinkedIn-${job.title}-${job.company}`
          .toLowerCase()
          .replace(/\s+/g, "-")
          .substring(0, 100),
      }));

      const operations = jobsWithId.map((job) => ({
        updateOne: {
          filter: { uniqueId: job.uniqueId },
          update: { $set: job },
          upsert: true,
        },
      }));

      const result = await ScrapedJob.bulkWrite(operations);
      const savedCount =
        (result.upsertedCount || 0) + (result.modifiedCount || 0);

      console.log(`✅ Saved ${savedCount} jobs to database\n`);

      // Show database stats
      const total = await ScrapedJob.countDocuments();
      console.log(`📈 Database now has: ${total} total jobs\n`);
    }

    console.log("✅ Test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testFastScraper();
