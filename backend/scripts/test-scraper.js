#!/usr/bin/env node

/**
 * Test Scraper - Simple script to test scraping and MongoDB saving
 * Usage: node scripts/test-scraper.js
 */

import connectDB from "../utils/db.js";
import { runMasterScraper } from "../scrapers/masterScraper.js";
import ScrapedJob from "../models/scrapedJob.model.js";

async function testScraper() {
  console.log("🚀 Starting Test Scraper...\n");

  try {
    // Connect to database
    console.log("📡 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Check existing jobs
    console.log("📊 Checking existing jobs...");
    const existingCount = await ScrapedJob.countDocuments();
    console.log(`Found ${existingCount} existing jobs in database\n`);

    // Run scraper with light config (faster testing)
    console.log("🔍 Starting scraper (light config for testing)...\n");
    const results = await runMasterScraper({
      internshala: { enabled: true, pages: 1 }, // Only 1 page for quick test
      naukri: { enabled: true, keywords: ["Developer"], pages: 1 },
      linkedin: { enabled: false }, // Skip LinkedIn to speed up
    });

    // Display results
    console.log("\n📊 Scraping Results:");
    console.log(`   Total Scraped: ${results.totalJobsScraped}`);
    console.log(`   Total Saved: ${results.totalJobsSaved}`);

    // Verify jobs were saved
    console.log("\n🔍 Verifying database...");
    const finalCount = await ScrapedJob.countDocuments();
    console.log(`Total jobs now in database: ${finalCount}`);

    // Show sample job
    const sampleJob = await ScrapedJob.findOne();
    if (sampleJob) {
      console.log("\n📋 Sample Job:");
      console.log(`   Title: ${sampleJob.title}`);
      console.log(`   Company: ${sampleJob.company}`);
      console.log(`   Platform: ${sampleJob.platform}`);
      console.log(`   Salary: ${sampleJob.salary}`);
      console.log(`   Location: ${sampleJob.location}`);
    }

    if (results.errors.length > 0) {
      console.log("\n⚠️ Errors:");
      results.errors.forEach((error) => console.log(`   - ${error}`));
    }

    console.log("\n✅ Test Scraper Complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Test Failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testScraper();
