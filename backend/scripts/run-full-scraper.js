#!/usr/bin/env node

/**
 * Full Web Development Jobs Scraper
 * Scrapes 500+ web development, frontend, and backend jobs from India
 * Usage: npm run scraper:full
 */

import { runMasterScraper } from "../scrapers/masterScraper.js";

const main = async () => {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   🚀 FULL WEB DEVELOPMENT JOBS SCRAPER (500+ jobs)    ║");
  console.log("║   Scraping: Frontend, Backend, Full Stack Developers   ║");
  console.log("║   Location: India                                      ║");
  console.log("║   Source: LinkedIn, Naukri, Internshala                ║");
  console.log("╚════════════════════════════════════════════════════════╝\n");

  const startTime = Date.now();

  try {
    const result = await runMasterScraper();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2); // Convert to minutes

    console.log("\n╔════════════════════════════════════════════════════════╗");
    console.log("║                    ✅ SCRAPING COMPLETE              ║");
    console.log("╚════════════════════════════════════════════════════════╝");
    console.log(`\n⏱️  Duration: ${duration} minutes`);
    console.log(`📊 Total Jobs Scraped: ${result.totalJobsScraped}`);
    console.log(`💾 Total Jobs Saved: ${result.totalJobsSaved}`);
    console.log(
      `\n✨ Jobs are ready to view at: http://localhost:5173/webscraping/home`
    );

    if (result.errors.length > 0) {
      console.log(
        `\n⚠️  ${result.errors.length} error(s) encountered during scraping`
      );
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    process.exit(1);
  }
};

main();
