#!/usr/bin/env node

/**
 * Quick Scraper Runner
 * Run this script to scrape jobs immediately and populate the database
 *
 * Usage:
 *   node scripts/run-scraper.js
 *   node scripts/run-scraper.js --linkedin
 *   node scripts/run-scraper.js --internshala
 *   node scripts/run-scraper.js --naukri
 */

import { runMasterScraper } from "../scrapers/masterScraper.js";

const args = process.argv.slice(2);

const scraperConfig = {
  internshala: { enabled: true, pages: 3 },
  naukri: {
    enabled: true,
    keywords: ["Developer", "Designer", "Manager"],
    pages: 2,
  },
  linkedin: {
    enabled: true,
    keywords: ["JavaScript Developer", "React Developer"],
    pages: 1,
  },
};

// Parse command line arguments
if (args.length > 0) {
  if (args.includes("--linkedin")) {
    scraperConfig.internshala.enabled = false;
    scraperConfig.naukri.enabled = false;
  } else if (args.includes("--internshala")) {
    scraperConfig.linkedin.enabled = false;
    scraperConfig.naukri.enabled = false;
  } else if (args.includes("--naukri")) {
    scraperConfig.linkedin.enabled = false;
    scraperConfig.internshala.enabled = false;
  }
}

console.log("🚀 Starting scraper with configuration:", scraperConfig);

runMasterScraper(scraperConfig)
  .then((results) => {
    console.log("\n📊 Final Results:", results);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
