import ScrapedJob from "../models/scrapedJob.model.js";
import WebscrapingFilter from "../models/webscrapingFilter.model.js";
import {
  getCronJobStatus,
  manualTriggerScraper,

} from "../utils/cronScheduler.js";


export const getScrapedJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      platform,
      jobType,
      experience,
      minSalary,
      maxSalary,
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isActive: true }; // Only active jobs

    // Apply filters
    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      filter.location = { $in: locations };
    }

    if (platform) {
      const platforms = Array.isArray(platform) ? platform : [platform];
      filter.platform = { $in: platforms };
    }

    if (jobType) {
      const jobTypes = Array.isArray(jobType) ? jobType : [jobType];
      filter.jobType = { $in: jobTypes };
    }

    if (experience) {
      const experiences = Array.isArray(experience) ? experience : [experience];
      filter.experience = { $in: experiences };
    }

    if (minSalary || maxSalary) {
      if (minSalary) {
        filter.salaryMin = { $gte: parseInt(minSalary) };
      }
      if (maxSalary) {
        filter.salaryMax = { $lte: parseInt(maxSalary) };
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const jobs = await ScrapedJob.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ postedDate: -1, scrapedDate: -1 }); // Sort by actual posting date first, then scraping date

    const total = await ScrapedJob.countDocuments(filter);

    console.log(
      `📊 API - Fetching jobs: filter=${JSON.stringify(
        filter
      )}, found=${total}, returning=${jobs.length}`
    );

    res.status(200).json({
      success: true,
      jobs,
      totalJobs: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in getScrapedJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

// Get single job by ID
export const getScrapedJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await ScrapedJob.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Error in getScrapedJobById:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching job",
      error: error.message,
    });
  }
};

// Search jobs with text search
export const searchScrapedJobs = async (req, res) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const skip = (page - 1) * limit;

    const jobs = await ScrapedJob.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(limit * 1)
      .skip(skip);

    const total = await ScrapedJob.countDocuments({
      $text: { $search: query },
      isActive: true,
    });

    res.status(200).json({
      success: true,
      jobs,
      totalJobs: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in searchScrapedJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error searching jobs",
      error: error.message,
    });
  }
};

// Get filter options (for dropdown menus)
export const getFilterOptions = async (req, res) => {
  try {
    const locations = await ScrapedJob.distinct("location", {
      isActive: true,
    });
    const platforms = await ScrapedJob.distinct("platform", {
      isActive: true,
    });
    const jobTypes = await ScrapedJob.distinct("jobType", { isActive: true });
    const experiences = await ScrapedJob.distinct("experience", {
      isActive: true,
    });

    // Get salary range
    const salaryStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minSalary: { $min: "$salaryMin" },
          maxSalary: { $max: "$salaryMax" },
        },
      },
    ]);

    const salaryRange = salaryStats[0] || {
      minSalary: 0,
      maxSalary: 500000,
    };

    res.status(200).json({
      success: true,
      filterOptions: {
        locations: locations.sort(),
        platforms: platforms.sort(),
        jobTypes: jobTypes.sort(),
        experiences: experiences.sort(),
        salaryRange,
      },
    });
  } catch (error) {
    console.error("Error in getFilterOptions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching filter options",
      error: error.message,
    });
  }
};

// Save user filter
export const saveUserFilter = async (req, res) => {
  try {
    const userId = req.user?._id;
    const {
      filterName,
      location,
      platforms,
      jobTypes,
      experienceLevels,
      salaryRange,
      keywords,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    const filter = new WebscrapingFilter({
      userId,
      filterName,
      location,
      platforms,
      jobTypes,
      experienceLevels,
      salaryRange,
      keywords,
    });

    await filter.save();

    res.status(201).json({
      success: true,
      message: "Filter saved successfully",
      filter,
    });
  } catch (error) {
    console.error("Error in saveUserFilter:", error);
    res.status(500).json({
      success: false,
      message: "Error saving filter",
      error: error.message,
    });
  }
};

// Get user filters
export const getUserFilters = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    const filters = await WebscrapingFilter.find({ userId, isActive: true });

    res.status(200).json({
      success: true,
      filters,
    });
  } catch (error) {
    console.error("Error in getUserFilters:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching filters",
      error: error.message,
    });
  }
};

// Apply to a job
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login to apply",
      });
    }

    const job = await ScrapedJob.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Increment applications count
    job.applications += 1;
    await job.save();

    // In a real application, you would save the application to a database
    // For now, we'll return the apply link and job details

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        applyLink: job.applyLink,
      },
    });
  } catch (error) {
    console.error("Error in applyToJob:", error);
    res.status(500).json({
      success: false,
      message: "Error applying to job",
      error: error.message,
    });
  }
};

// Get job statistics
export const getJobStats = async (req, res) => {
  try {
    const stats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          totalApplications: { $sum: "$applications" },
          totalViews: { $sum: "$views" },
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const platformStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const experienceStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$experience",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalJobs: 0,
        totalApplications: 0,
        totalViews: 0,
        avgRating: 0,
      },
      platformStats,
      experienceStats,
    });
  } catch (error) {
    console.error("Error in getJobStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

// Trigger scraper endpoint
export const triggerScraper = async (req, res) => {
  try {
    console.log("🚀 Scraper trigger received...");

    // Dynamic import to avoid requiring node-cron if not needed
    const { runMasterScraper } = await import("../scrapers/masterScraper.js");

    const scraperConfig = req.body || {
      linkedin: { enabled: true, pages: 1 },
      internshala: { enabled: true, pages: 2 },
      naukri: { enabled: true, pages: 2 },
    };

    console.log("📊 Running scraper with config:", scraperConfig);

    // Run scraper in background (non-blocking)
    runMasterScraper(scraperConfig)
      .then((results) => {
        console.log("✅ Scraper completed:", results);
      })
      .catch((error) => {
        console.error("❌ Scraper error:", error.message);
      });

    res.status(200).json({
      success: true,
      message: "Scraper started. Check backend logs for progress.",
      config: scraperConfig,
    });
  } catch (error) {
    console.error("Error triggering scraper:", error);
    res.status(500).json({
      success: false,
      message: "Error triggering scraper",
      error: error.message,
    });
  }
};

// Get cron job status
export const getCronStatus = async (req, res) => {
  try {
    const status = await getCronJobStatus();

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error("Error getting cron status:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cron status",
      error: error.message,
    });
  }
};

// Manual trigger scraper (admin only)
export const manualScraper = async (req, res) => {
  try {
    console.log("🚀 Manual scraper trigger from API...");

    manualTriggerScraper()
      .then((results) => {
        console.log("✅ Manual scraper completed:", results);
      })
      .catch((error) => {
        console.error("❌ Manual scraper error:", error.message);
      });

    res.status(200).json({
      success: true,
      message: "Manual scraper triggered. Check backend logs for progress.",
    });
  } catch (error) {
    console.error("Error triggering manual scraper:", error);
    res.status(500).json({
      success: false,
      message: "Error triggering manual scraper",
      error: error.message,
    });
  }
};

// Manual trigger cleaner (admin only)
export const manualCleaner = async (req, res) => {
  try {
    console.log("🗑️  Manual cleaner trigger from API...");

    manualTriggerCleaner()
      .then((result) => {
        console.log("✅ Manual cleaner completed");
      })
      .catch((error) => {
        console.error("❌ Manual cleaner error:", error.message);
      });

    res.status(200).json({
      success: true,
      message: "Manual cleaner triggered. Old jobs will be deleted.",
    });
  } catch (error) {
    console.error("Error triggering manual cleaner:", error);
    res.status(500).json({
      success: false,
      message: "Error triggering manual cleaner",
      error: error.message,
    });
  }
};

// Database diagnostic endpoint
export const getDatabaseDiagnostics = async (req, res) => {
  try {
    // Total jobs in database (all statuses)
    const totalJobs = await ScrapedJob.countDocuments();

    // Active jobs
    const activeJobs = await ScrapedJob.countDocuments({ isActive: true });

    // Inactive jobs
    const inactiveJobs = await ScrapedJob.countDocuments({ isActive: false });

    // Jobs with missing required fields
    const missingApplyLink = await ScrapedJob.countDocuments({
      $or: [{ applyLink: null }, { applyLink: "" }],
    });

    const missingTitle = await ScrapedJob.countDocuments({
      $or: [{ title: null }, { title: "" }],
    });

    // Jobs by platform
    const jobsByPlatform = await ScrapedJob.aggregate([
      {
        $group: {
          _id: "$platform",
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactive: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Recent jobs (last 5)
    const recentJobs = await ScrapedJob.find()
      .sort({ scrapedDate: -1 })
      .limit(5)
      .select("title company platform isActive scrapedDate");

    console.log("📊 Database Diagnostics:");
    console.log(`   Total Jobs: ${totalJobs}`);
    console.log(`   Active Jobs: ${activeJobs}`);
    console.log(`   Inactive Jobs: ${inactiveJobs}`);
    console.log(`   Missing applyLink: ${missingApplyLink}`);
    console.log(`   Missing title: ${missingTitle}`);

    res.status(200).json({
      success: true,
      diagnostics: {
        totalJobs,
        activeJobs,
        inactiveJobs,
        missingApplyLink,
        missingTitle,
        jobsByPlatform,
        recentJobs,
      },
    });
  } catch (error) {
    console.error("Error in getDatabaseDiagnostics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching diagnostics",
      error: error.message,
    });
  }
};

// Data cleanup and migration endpoint
export const cleanupAndMigrateData = async (req, res) => {
  try {
    console.log("🔧 Starting database cleanup and migration...\n");

    // Step 1: Fix jobs with undefined isActive field
    const undefinedResult = await ScrapedJob.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    console.log(
      `✅ Step 1: Fixed ${undefinedResult.modifiedCount} jobs with undefined isActive`
    );

    // Step 2: Delete jobs with missing required fields
    const missingLinkResult = await ScrapedJob.deleteMany({
      $or: [{ applyLink: null }, { applyLink: "" }],
    });
    console.log(
      `🗑️  Step 2: Deleted ${missingLinkResult.deletedCount} jobs with missing applyLink`
    );

    const missingTitleResult = await ScrapedJob.deleteMany({
      $or: [{ title: null }, { title: "" }],
    });
    console.log(
      `🗑️  Step 3: Deleted ${missingTitleResult.deletedCount} jobs with missing title`
    );

    // Step 3: Ensure all jobs have required fields
    const missingCompanyResult = await ScrapedJob.deleteMany({
      $or: [{ company: null }, { company: "" }],
    });
    console.log(
      `🗑️  Step 4: Deleted ${missingCompanyResult.deletedCount} jobs with missing company`
    );

    // Step 4: Ensure all remaining jobs are active
    const activateResult = await ScrapedJob.updateMany(
      { isActive: { $ne: true } },
      { $set: { isActive: true } }
    );
    console.log(
      `✅ Step 5: Activated ${activateResult.modifiedCount} inactive jobs`
    );

    // Final statistics
    const finalStats = await ScrapedJob.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalAfter = await ScrapedJob.countDocuments();
    const activeAfter = await ScrapedJob.countDocuments({ isActive: true });

    console.log("\n📈 Cleanup Complete!");
    console.log(`   Total Jobs After: ${totalAfter}`);
    console.log(`   Active Jobs: ${activeAfter}`);
    console.log(`   By Platform:`);
    finalStats.forEach((stat) => {
      console.log(`      ${stat._id}: ${stat.count} jobs`);
    });

    res.status(200).json({
      success: true,
      message: "Database cleanup completed successfully",
      changes: {
        fixedUndefinedIsActive: undefinedResult.modifiedCount,
        deletedMissingApplyLink: missingLinkResult.deletedCount,
        deletedMissingTitle: missingTitleResult.deletedCount,
        deletedMissingCompany: missingCompanyResult.deletedCount,
        activatedInactive: activateResult.modifiedCount,
      },
      finalStats: {
        totalJobs: totalAfter,
        activeJobs: activeAfter,
        byPlatform: finalStats,
      },
    });
  } catch (error) {
    console.error("Error in cleanupAndMigrateData:", error);
    res.status(500).json({
      success: false,
      message: "Error during database cleanup",
      error: error.message,
    });
  }
};

/**
 * PATCH endpoint - Refresh/Update jobs incrementally (upsert strategy)
 * This keeps existing jobs and updates with new ones instead of deleting
 * More efficient than PUT for partial updates
 */
export const refreshScrapedJobs = async (req, res) => {
  try {
    console.log(
      "🔄 API - Refresh endpoint called - Getting latest jobs without deletion..."
    );

    // Just fetch fresh jobs, don't delete old ones
    const jobs = await ScrapedJob.find({ isActive: true })
      .sort({ postedDate: -1, scrapedDate: -1 })
      .limit(100);

    const total = await ScrapedJob.countDocuments({ isActive: true });

    console.log(
      `📊 API - Refresh: Found ${jobs.length} latest jobs, total in DB: ${total}`
    );

    res.status(200).json({
      success: true,
      message: "Jobs refreshed successfully - data preserved and updated",
      jobs,
      totalJobs: total,
      cacheTimestamp: new Date(),
      dataFresh: true,
    });
  } catch (error) {
    console.error("Error in refreshScrapedJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing jobs",
      error: error.message,
    });
  }
};

/**
 * PATCH endpoint - Get jobs and trigger background refresh
 * Returns cached data immediately, refreshes in background
 * Best user experience: instant load + fresh data
 */
export const getJobsWithBackgroundRefresh = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      platform,
      jobType,
      experience,
      minSalary,
      maxSalary,
      search,
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    // Apply filters (same as getScrapedJobs)
    if (location) {
      const locations = Array.isArray(location) ? location : [location];
      filter.location = { $in: locations };
    }
    if (platform) {
      const platforms = Array.isArray(platform) ? platform : [platform];
      filter.platform = { $in: platforms };
    }
    if (jobType) {
      const jobTypes = Array.isArray(jobType) ? jobType : [jobType];
      filter.jobType = { $in: jobTypes };
    }
    if (experience) {
      const experiences = Array.isArray(experience) ? experience : [experience];
      filter.experience = { $in: experiences };
    }
    if (minSalary || maxSalary) {
      if (minSalary) filter.salaryMin = { $gte: parseInt(minSalary) };
      if (maxSalary) filter.salaryMax = { $lte: parseInt(maxSalary) };
    }
    if (search) filter.$text = { $search: search };

    // Get cached data immediately
    const jobs = await ScrapedJob.find(filter)
      .limit(limit * 1)
      .skip(skip)
      .sort({ postedDate: -1, scrapedDate: -1 });

    const total = await ScrapedJob.countDocuments(filter);

    console.log(
      `📊 API - Background refresh: Returning ${jobs.length} cached jobs, total: ${total}`
    );

    // Trigger scraper in background (non-blocking)
    if (req.query.triggerRefresh === "true") {
      console.log("🔄 API - Triggering background scraper refresh...");
      // Import dynamically to avoid circular dependencies
      const { runMasterScraper } = await import("../scrapers/masterScraper.js");

      // Run scraper in background without waiting
      runMasterScraper().catch((error) => {
        console.error("⚠️ Background scraper error:", error.message);
      });
    }

    res.status(200).json({
      success: true,
      jobs,
      totalJobs: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      cacheTimestamp: new Date(),
      refreshTriggered: req.query.triggerRefresh === "true",
      message: "Returning cached data. Fresh data being fetched in background.",
    });
  } catch (error) {
    console.error("Error in getJobsWithBackgroundRefresh:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

/**
 * PUT endpoint - Force full refresh (manual trigger for users)
 * Immediate scrape and return fresh results
 * Use when user explicitly clicks "Refresh Now" button
 */
export const forceRefreshJobs = async (req, res) => {
  try {
    console.log(
      "🚀 API - Force refresh endpoint called - Running scraper immediately..."
    );

    // Import and run scraper
    const { runMasterScraper } = await import("../scrapers/masterScraper.js");
    const scraperResults = await runMasterScraper();

    // Get fresh jobs after scraping
    const jobs = await ScrapedJob.find({ isActive: true })
      .sort({ postedDate: -1, scrapedDate: -1 })
      .limit(50);

    const total = await ScrapedJob.countDocuments({ isActive: true });

    console.log(
      `✅ API - Force refresh complete: Scraped ${scraperResults.totalJobsScraped} jobs, saved ${scraperResults.totalJobsSaved}, DB total: ${total}`
    );

    res.status(200).json({
      success: true,
      message: "Jobs refreshed with latest scrape",
      jobs,
      totalJobs: total,
      scraperStats: scraperResults,
      refreshedAt: new Date(),
      dataFresh: true,
    });
  } catch (error) {
    console.error("Error in forceRefreshJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error force refreshing jobs",
      error: error.message,
    });
  }
};

/**
 * Get last scrape timestamp and job count
 * Used to show cache status to user
 */
export const getLastScrapInfo = async (req, res) => {
  try {
    const allJobs = await ScrapedJob.find({ isActive: true })
      .sort({ scrapedDate: -1 })
      .limit(1);

    const latestJob = allJobs[0];
    const total = await ScrapedJob.countDocuments({ isActive: true });

    // Get platform breakdown
    const platformStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      lastScrapTime: latestJob?.scrapedDate || null,
      totalJobs: total,
      platforms: platformStats,
    });
  } catch (error) {
    console.error("Error in getLastScrapInfo:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching scrape info",
      error: error.message,
    });
  }
};

/**
 * DELETE endpoint - Cleanup jobs older than X days
 * Keeps database optimized and prevents storage bloat
 * Default: Remove jobs older than 7 days (based on postedDate)
 */
export const cleanupOldJobs = async (req, res) => {
  try {
    const { daysOld = 7 } = req.query;

    console.log(
      `🧹 Cleanup endpoint called - removing jobs older than ${daysOld} days`
    );

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    // Count jobs before cleanup
    const countBefore = await ScrapedJob.countDocuments({ isActive: true });

    // Delete jobs older than X days based on postedDate
    const result = await ScrapedJob.deleteMany({
      postedDate: { $lt: cutoffDate },
      isActive: true,
    });

    // Count jobs after cleanup
    const countAfter = await ScrapedJob.countDocuments({ isActive: true });

    // Get platform breakdown after cleanup
    const platformStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log(
      `✅ Cleanup complete: Deleted ${result.deletedCount} jobs. Before: ${countBefore}, After: ${countAfter}`
    );

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} jobs older than ${daysOld} days`,
      jobsDeleted: result.deletedCount,
      jobsBefore: countBefore,
      jobsAfter: countAfter,
      cutoffDate,
      platforms: platformStats,
    });
  } catch (error) {
    console.error("Error in cleanupOldJobs:", error);
    res.status(500).json({
      success: false,
      message: "Error during cleanup",
      error: error.message,
    });
  }
};

/**
 * GET endpoint - Get cleanup recommendations
 * Shows jobs that will be deleted and database health stats
 */
export const getCleanupStats = async (req, res) => {
  try {
    const { daysOld = 7 } = req.query;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));

    // Jobs that will be deleted
    const jobsToDelete = await ScrapedJob.countDocuments({
      postedDate: { $lt: cutoffDate },
      isActive: true,
    });

    // Recent jobs (will be kept)
    const recentJobs = await ScrapedJob.countDocuments({
      postedDate: { $gte: cutoffDate },
      isActive: true,
    });

    // Total jobs
    const totalJobs = await ScrapedJob.countDocuments({ isActive: true });

    // Oldest job in DB
    const oldestJob = await ScrapedJob.findOne({ isActive: true })
      .sort({ postedDate: 1 })
      .lean();

    // Platform breakdown
    const platformStats = await ScrapedJob.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
          oldestPost: { $min: "$postedDate" },
          newestPost: { $max: "$postedDate" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Calculate database size estimate
    const dbStats = await ScrapedJob.collection.stats();
    const dbSizeMB = (dbStats.size / 1024 / 1024).toFixed(2);

    res.status(200).json({
      success: true,
      message: "Database cleanup recommendations",
      stats: {
        totalJobs,
        recentJobs,
        jobsToDelete,
        cutoffDate,
        daysOld: parseInt(daysOld),
        oldestJobDate: oldestJob?.postedDate || null,
        oldestJobTitle: oldestJob?.title || null,
        databaseSizeMB: parseFloat(dbSizeMB),
      },
      platforms: platformStats,
      recommendation:
        jobsToDelete > 100
          ? `⚠️ Consider cleanup: ${jobsToDelete} old jobs will free up space`
          : "✅ Database is clean",
    });
  } catch (error) {
    console.error("Error in getCleanupStats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cleanup stats",
      error: error.message,
    });
  }
};
