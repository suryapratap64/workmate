# Backend Database Fix Guide

## Problem Summary

The API endpoint `/api/v1/webscraping/jobs` was returning only 9 jobs even though hundreds were being scraped (890 from LinkedIn, 60 from Internshala, etc.).

## Root Causes Identified

1. **Missing `isActive: true` field** - Old jobs in database didn't have this field set
2. **Jobs with missing required fields** - Some jobs had empty `applyLink`, `title`, or `company`
3. **Filter logic too strict** - API was filtering by `isActive: true`, excluding old data

## Solution Steps

### Step 1: Diagnose Current Database State

```bash
curl http://localhost:8000/api/v1/webscraping/diagnostics
```

This will show:

- Total jobs in database
- Active jobs (isActive: true)
- Inactive jobs (isActive: false)
- Undefined isActive (jobs missing this field)
- Jobs with missing required fields

### Step 2: Run Database Cleanup

```bash
curl -X POST http://localhost:8000/api/v1/webscraping/cleanup
```

This will:

1. ✅ Fix all jobs with undefined `isActive` → set to `true`
2. 🗑️ Delete jobs missing `applyLink`
3. 🗑️ Delete jobs missing `title`
4. 🗑️ Delete jobs missing `company`
5. ✅ Activate all remaining inactive jobs

### Step 3: Verify Results

```bash
curl http://localhost:8000/api/v1/webscraping/diagnostics
```

Should show much higher `activeJobs` count.

### Step 4: Fetch Jobs

```bash
curl http://localhost:8000/api/v1/webscraping/jobs
```

Now should return all active jobs (not just 9).

## Changes Made to Backend

### 1. Master Scraper (`masterScraper.js`)

✅ **Already Fixed** - Sets `isActive: true` for all saved jobs

### 2. LinkedIn Scraper (`linkedinScraper.js`)

✅ **Already Fixed** - Better link extraction and validation

### 3. API Controller (`webscraping.controller.js`)

✅ **New Features Added:**

- Enhanced `getDatabaseDiagnostics()` - Shows undefined isActive field count
- New `cleanupAndMigrateData()` - Fixes all database issues

### 4. Routes (`webscraping.route.js`)

✅ **New Route Added:**

- POST `/api/v1/webscraping/cleanup` - Run database cleanup

## Expected Results

### Before Cleanup

```json
{
  "activeJobs": 9,
  "inactiveJobs": 0,
  "undefinedIsActive": 850,
  "missingApplyLink": 25,
  "missingTitle": 5
}
```

### After Cleanup

```json
{
  "activeJobs": 850,
  "inactiveJobs": 0,
  "undefinedIsActive": 0,
  "missingApplyLink": 0,
  "missingTitle": 0
}
```

## API Endpoints

### Get Jobs (with 20 per page limit)

```
GET http://localhost:8000/api/v1/webscraping/jobs?page=1&limit=20
```

### Get Jobs with Filters

```
GET http://localhost:8000/api/v1/webscraping/jobs?page=1&limit=20&platform=LinkedIn&location=USA
```

### Diagnostics

```
GET http://localhost:8000/api/v1/webscraping/diagnostics
```

### Cleanup Database

```
POST http://localhost:8000/api/v1/webscraping/cleanup
```

### Trigger Manual Scraper

```
POST http://localhost:8000/api/v1/webscraping/scraper/manual
```

### Trigger Manual Cleaner

```
POST http://localhost:8000/api/v1/webscraping/cleaner/manual
```

## Quick Fix Command

Run this sequence:

```bash
# 1. Check current state
curl http://localhost:8000/api/v1/webscraping/diagnostics

# 2. Run cleanup
curl -X POST http://localhost:8000/api/v1/webscraping/cleanup

# 3. Verify fixed state
curl http://localhost:8000/api/v1/webscraping/diagnostics

# 4. Check jobs
curl http://localhost:8000/api/v1/webscraping/jobs
```

## Scheduler Configuration

### Cron Jobs (Every 2 Minutes)

- **Scraper**: Fetches jobs every 2 minutes
- **Cleaner**: Deletes jobs older than 3 days (runs every hour)

### Files Involved

- `backend/utils/cronScheduler.js` - Main cron scheduler
- `backend/utils/scraperScheduler.js` - Alternative scheduler
- `backend/scrapers/masterScraper.js` - Orchestrates all scrapers
- `backend/scrapers/linkedinScraper.js` - LinkedIn scraper
- `backend/scrapers/naukriScraper.js` - Naukri scraper
- `backend/scrapers/internshalaScraper.js` - Internshala scraper

## Troubleshooting

### Still seeing only 9 jobs after cleanup?

1. Restart backend: `npm run dev`
2. Trigger manual scraper: `curl -X POST http://localhost:8000/api/v1/webscraping/scraper/manual`
3. Wait 5 seconds for jobs to process
4. Check jobs: `curl http://localhost:8000/api/v1/webscraping/jobs`

### No jobs appearing at all?

1. Check diagnostics: `curl http://localhost:8000/api/v1/webscraping/diagnostics`
2. Check database connection in logs
3. Verify MongoDB is running and accessible

### Jobs not being scraped?

1. Check cron status: `curl http://localhost:8000/api/v1/webscraping/cron/status`
2. Check backend logs for scraper errors
3. Verify internet connection for web scraping

## Notes

- All new jobs are automatically set to `isActive: true`
- Jobs older than 3 days are automatically deleted
- Scrapers run every 2 minutes for fresh data
- LinkedIn can return up to 890 jobs per scrape
- Internshala returns around 60-70 jobs per scrape
- Naukri returns around 100+ jobs per scrape
