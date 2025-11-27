import axios from "axios";
import * as cheerio from "cheerio";

// Utility functions for web scraping
const scraperConfig = {
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  },
};

/**
 * Fetch HTML content from URL with retries
 */
export const fetchHTML = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, scraperConfig);
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
      if (i === retries - 1) throw error;
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

/**
 * Parse HTML using Cheerio
 */
export const parseHTML = (html) => {
  return cheerio.load(html);
};

/**
 * Wait for random time to avoid detection
 */
export const randomDelay = (min = 1000, max = 3000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Extract and clean text
 */
export const cleanText = (text) => {
  return text.trim().replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
};

/**
 * Extract salary range from text
 */
export const extractSalary = (salaryText) => {
  if (!salaryText) return { min: 0, max: 0 };

  const numbers = salaryText.match(/\d+/g);
  if (!numbers || numbers.length === 0) return { min: 0, max: 0 };

  const min = parseInt(numbers[0]) * (salaryText.includes("L") ? 100000 : 1);
  const max =
    numbers.length > 1
      ? parseInt(numbers[1]) * (salaryText.includes("L") ? 100000 : 1)
      : min + 10000;

  return { min, max };
};

/**
 * Parse relative date strings from job platforms
 * Converts "2 days ago", "5h ago", "22 Nov 2025", "Posted 2 days ago" to Date object
 */
export const parseJobPostingDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date();
  }

  dateStr = dateStr.trim().toLowerCase();

  // Handle "recently posted" or "just posted" - treat as today
  if (
    dateStr.includes("recently") ||
    dateStr.includes("just now") ||
    dateStr.includes("today")
  ) {
    return new Date(); // Return today's date
  }

  // Handle "X ago" format (with optional "Posted" prefix)
  // Matches: "2 days ago", "Posted 5 hours ago", "5h ago", "1 minute ago", etc.
  if (dateStr.includes("ago")) {
    // Try different regex patterns
    const patterns = [
      /(\d+)\s*(minute|hour|day|week|month|year)s?\s+ago/, // "2 days ago", "1 hour ago"
      /(\d+)(m|h|d|w)\s+ago/, // "5h ago", "2d ago", "1m ago"
    ];

    let match = null;
    let amount = 0;
    let unit = "";

    for (const pattern of patterns) {
      match = dateStr.match(pattern);
      if (match) {
        amount = parseInt(match[1]);
        unit = match[2];

        // Convert short units to long form
        if (unit === "m") unit = "minute";
        if (unit === "h") unit = "hour";
        if (unit === "d") unit = "day";
        if (unit === "w") unit = "week";

        break;
      }
    }

    if (match && amount > 0) {
      const date = new Date();

      if (unit.startsWith("minute"))
        date.setMinutes(date.getMinutes() - amount);
      else if (unit.startsWith("hour")) date.setHours(date.getHours() - amount);
      else if (unit.startsWith("day")) date.setDate(date.getDate() - amount);
      else if (unit.startsWith("week"))
        date.setDate(date.getDate() - amount * 7);
      else if (unit.startsWith("month"))
        date.setMonth(date.getMonth() - amount);
      else if (unit.startsWith("year"))
        date.setFullYear(date.getFullYear() - amount);

      return date;
    }
  }

  // Try to parse as direct date string (e.g., "Nov 22, 2025")
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Fallback: if no valid date found, return today's date (recently posted)
  // This ensures Internshala's "Recently Posted" jobs are included in last-week filter
  console.warn(
    `⚠️  Could not parse date string: "${dateStr}" - treating as today`
  );
  return new Date(); // Return today instead of 30 days ago
};

/**
 * Validate job object
 */
export const isValidJob = (job) => {
  return (
    job.title &&
    job.company &&
    job.description &&
    job.applyLink &&
    job.title.length > 2 &&
    job.company.length > 2
  );
};

/**
 * Filter jobs to only include those posted within the last week
 * This optimization reduces database size and improves query performance
 */
export const filterJobsByLastWeek = (jobs) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return jobs.filter((job) => {
    if (!job.postedDate) return true; // Include if date is missing
    const jobDate = new Date(job.postedDate);
    return jobDate >= sevenDaysAgo;
  });
};

export default {
  fetchHTML,
  parseHTML,
  randomDelay,
  cleanText,
  extractSalary,
  parseJobPostingDate,
  isValidJob,
  filterJobsByLastWeek,
  scraperConfig,
};
