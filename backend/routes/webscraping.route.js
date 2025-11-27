import express from "express";
import {
  getScrapedJobs,
  getScrapedJobById,
  searchScrapedJobs,
  getFilterOptions,
  saveUserFilter,
  getUserFilters,
  applyToJob,
  getJobStats,
  triggerScraper,
  getCronStatus,
  manualScraper,
  manualCleaner,
  getDatabaseDiagnostics,
  cleanupAndMigrateData,
  refreshScrapedJobs,
  getJobsWithBackgroundRefresh,
  forceRefreshJobs,
  getLastScrapInfo,
  cleanupOldJobs,
  getCleanupStats,
} from "../controllers/webscraping.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Public routes
router.get("/jobs", getScrapedJobs);
router.get("/jobs/:id", getScrapedJobById);
router.get("/search", searchScrapedJobs);
router.get("/filter-options", getFilterOptions);
router.get("/stats", getJobStats);
router.get("/cron/status", getCronStatus);
router.get("/diagnostics", getDatabaseDiagnostics);

// NEW: Cache/Refresh routes
// PATCH - Refresh jobs (keep existing data)
router.patch("/jobs/refresh", refreshScrapedJobs);
// GET - Jobs with background refresh (instant cache + background update)
router.get("/jobs/with-refresh", getJobsWithBackgroundRefresh);
// PUT - Force full refresh (user triggers manually)
router.put("/jobs/force-refresh", forceRefreshJobs);
// GET - Last scrape info and cache status
router.get("/info/last-scrap", getLastScrapInfo);

// NEW: Cleanup routes (database maintenance)
// GET - Get cleanup recommendations
router.get("/cleanup/stats", getCleanupStats);
// DELETE - Execute cleanup (remove jobs older than X days, default 7)
router.delete("/cleanup", cleanupOldJobs);

// Protected routes
router.post("/filters/save", isAuthenticated, saveUserFilter);
router.get("/filters", isAuthenticated, getUserFilters);
router.post("/jobs/:jobId/apply", isAuthenticated, applyToJob);

// Admin routes (for triggering manual jobs)
router.post("/scraper/trigger", triggerScraper);
router.post("/scraper/manual", manualScraper);
router.post("/cleaner/manual", manualCleaner);
router.post("/cleanup/migrate", cleanupAndMigrateData);

export default router;
