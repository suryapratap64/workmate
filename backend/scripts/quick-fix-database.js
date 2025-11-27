#!/usr/bin/env node

/**
 * Quick Database Fix Script
 * Run: node scripts/quick-fix-database.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import ScrapedJob from "../models/scrapedJob.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const runCleanup = async () => {
  try {
    console.log("🔧 Starting Database Quick Fix...\n");

    // Show before state
    const totalBefore = await ScrapedJob.countDocuments();
    const activeBefore = await ScrapedJob.countDocuments({ isActive: true });
    const undefinedBefore = await ScrapedJob.countDocuments({
      isActive: { $exists: false },
    });

    console.log("📊 BEFORE CLEANUP:");
    console.log(`   Total Jobs: ${totalBefore}`);
    console.log(`   Active Jobs: ${activeBefore}`);
    console.log(`   Undefined isActive: ${undefinedBefore}\n`);

    // Step 1: Fix undefined isActive
    console.log("⏳ Step 1: Fixing undefined isActive field...");
    const undefinedResult = await ScrapedJob.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(`✅ Fixed ${undefinedResult.modifiedCount} jobs\n`);

    // Step 2: Delete jobs with missing applyLink
    console.log("⏳ Step 2: Deleting jobs with missing applyLink...");
    const missingLinkResult = await ScrapedJob.deleteMany({
      $or: [{ applyLink: null }, { applyLink: "" }],
    });
    console.log(`🗑️  Deleted ${missingLinkResult.deletedCount} jobs\n`);

    // Step 3: Delete jobs with missing title
    console.log("⏳ Step 3: Deleting jobs with missing title...");
    const missingTitleResult = await ScrapedJob.deleteMany({
      $or: [{ title: null }, { title: "" }],
    });
    console.log(`🗑️  Deleted ${missingTitleResult.deletedCount} jobs\n`);

    // Step 4: Delete jobs with missing company
    console.log("⏳ Step 4: Deleting jobs with missing company...");
    const missingCompanyResult = await ScrapedJob.deleteMany({
      $or: [{ company: null }, { company: "" }],
    });
    console.log(`🗑️  Deleted ${missingCompanyResult.deletedCount} jobs\n`);

    // Step 5: Activate all inactive jobs
    console.log("⏳ Step 5: Activating all inactive jobs...");
    const activateResult = await ScrapedJob.updateMany(
      { isActive: { $ne: true } },
      { $set: { isActive: true } }
    );
    console.log(`✅ Activated ${activateResult.modifiedCount} jobs\n`);

    // Final statistics
    const totalAfter = await ScrapedJob.countDocuments();
    const activeAfter = await ScrapedJob.countDocuments({ isActive: true });

    const jobsByPlatform = await ScrapedJob.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log("✅ CLEANUP COMPLETE!\n");
    console.log("📊 AFTER CLEANUP:");
    console.log(`   Total Jobs: ${totalAfter}`);
    console.log(`   Active Jobs: ${activeAfter}`);
    console.log(`   By Platform:`);

    jobsByPlatform.forEach((platform) => {
      console.log(`      • ${platform._id}: ${platform.count} jobs`);
    });

    console.log("\n✨ Database is now ready to use!");
    console.log(
      "🚀 API endpoint: GET http://localhost:8000/api/v1/webscraping/jobs"
    );
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
};

// Run
(async () => {
  await connectDB();
  await runCleanup();
})();
