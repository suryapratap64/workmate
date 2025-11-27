import {
  fetchHTML,
  parseHTML,
  randomDelay,
  cleanText,
  extractSalary,
  parseJobPostingDate,
  isValidJob,
} from "./utils.js";

/**
 * Naukri Scraper - Scrapes job listings from naukri.com
 * Website: https://naukri.com (India's largest job platform)
 * Data: Job titles, companies, locations, salary, experience required
 *
 * Optimized Search URL Parameters:
 * - k: Keywords (fullstack developer, backend development, etc.)
 * - l: Location (remote, bangalore, etc.)
 * - qproductJobSource=2: Job search source
 * - qinternshipFlag=true: Include internships
 * - naukriCampus=true: Include campus jobs
 * - experience=0-5: Years of experience filter
 * - nignbevent_src=jobsearchDeskGNB: Analytics tracking
 */

const NAUKRI_BASE_URL = "https://naukri.com";
const NAUKRI_SEARCH_URL =
  "https://www.naukri.com/fullstack-developer-backend-development-frontend-development-web-development-internship-jobs-in-remote";

// Backup keywords for pagination/fallback
const DEFAULT_NAUKRI_KEYWORDS = [
  "fullstack developer",
  "backend development",
  "frontend development",
  "web development internship",
];

/**
 * Scrape jobs from optimized Naukri URL with filters
 */
const scrapeNaukriJobs = async (pages = 2) => {
  const allJobs = [];

  try {
    for (let page = 1; page <= pages; page++) {
      // Naukri pagination uses query params
      const pageUrl = `${NAUKRI_SEARCH_URL}?k=${encodeURIComponent(
        DEFAULT_NAUKRI_KEYWORDS.join(", ")
      )}&l=remote&qproductJobSource=2&qinternshipFlag=true&naukriCampus=true&experience=0&pageNo=${page}`;

      console.log(`Scraping Naukri (page ${page})...`);

      try {
        const html = await fetchHTML(pageUrl);
        const $ = parseHTML(html);

        // Find all job cards - Naukri uses articleTag wrapper
        const jobElements = $("article.jobCard, div.jobCardWrapper");
        let pageJobCount = 0;

        jobElements.each((i, element) => {
          const job = scrapeJobFromNaukri($, element);
          if (job && isValidJob(job)) {
            allJobs.push(job);
            pageJobCount++;
          }
        });

        console.log(`Found ${pageJobCount} jobs on page ${page}`);
        await randomDelay(2000, 3500); // Respectful delay

        if (pageJobCount === 0) {
          console.log("No more jobs found, stopping pagination");
          break;
        }
      } catch (pageError) {
        console.error(`Error scraping page ${page}:`, pageError.message);
        continue;
      }
    }

    return allJobs;
  } catch (error) {
    console.error("Error scraping Naukri:", error.message);
    return [];
  }
};

/**
 * Scrape single job from Naukri
 */
const scrapeJobFromNaukri = ($, jobElement) => {
  try {
    // Extract job title - multiple selector fallbacks
    let title = "";
    let titleElement = $(jobElement).find(".jobTitle span");
    if (titleElement.length === 0) {
      titleElement = $(jobElement).find("h2.jobTitle");
    }
    if (titleElement.length === 0) {
      titleElement = $(jobElement).find("a.jobTitleLink");
    }
    title = cleanText(titleElement.attr("title") || titleElement.text());

    // Extract company name - multiple selector fallbacks
    let company = "";
    let companyElement = $(jobElement).find(".companyName span");
    if (companyElement.length === 0) {
      companyElement = $(jobElement).find(".companyName");
    }
    if (companyElement.length === 0) {
      companyElement = $(jobElement).find("a.companyName");
    }
    company = cleanText(companyElement.text());

    // Extract location
    let location = "";
    let locationElement = $(jobElement).find(".location span");
    if (locationElement.length === 0) {
      locationElement = $(jobElement).find(".location");
    }
    location = cleanText(locationElement.text());

    // Extract experience
    let experience = "";
    let expElement = $(jobElement).find(".expwdth");
    if (expElement.length === 0) {
      expElement = $(jobElement).find(".experience");
    }
    experience = cleanText(expElement.text());

    // Extract salary
    let salaryText = "";
    let salaryElement = $(jobElement).find(".sal");
    if (salaryElement.length === 0) {
      salaryElement = $(jobElement).find(".salary");
    }
    salaryText = cleanText(salaryElement.text());

    // Extract job link with better fallback logic
    let applyLink = "";
    let linkElement = $(jobElement).find(".jobTitle a");
    if (linkElement.length === 0) {
      linkElement = $(jobElement).find("a.jobTitleLink");
    }
    if (linkElement.length === 0) {
      linkElement = $(jobElement).find("a[href*='/jobs/']");
    }

    const jobPath = linkElement.attr("href");
    if (jobPath) {
      applyLink = jobPath.startsWith("http")
        ? jobPath
        : NAUKRI_BASE_URL + (jobPath.startsWith("/") ? jobPath : "/" + jobPath);
    }

    // Extract skills - improved fallback
    const skillsElement = $(jobElement).find(".skills span");
    const skills = [];
    skillsElement.each((i, elem) => {
      const skill = cleanText($(elem).text());
      if (skill && i < 5) skills.push(skill);
    });

    // If no skills found, try alternative selector
    if (skills.length === 0) {
      const altSkillsElement = $(jobElement).find(".tags span");
      altSkillsElement.each((i, elem) => {
        const skill = cleanText($(elem).text());
        if (skill && i < 5) skills.push(skill);
      });
    }

    // Extract brief description with fallbacks
    let description = "";
    let descElement = $(jobElement).find(".job-description");
    if (descElement.length === 0) {
      descElement = $(jobElement).find(".jobBriefDescription");
    }
    description = cleanText(descElement.text()) || title;

    // Extract posted date (e.g., "1d ago", "2h ago", "Posted 1 day ago")
    let postedDateStr = "";
    let dateElement = $(jobElement).find(".posted");
    if (dateElement.length === 0) {
      dateElement = $(jobElement).find(".postedTimeText");
    }
    if (dateElement.length === 0) {
      dateElement = $(jobElement).find(".jobPostedDate");
    }
    postedDateStr = cleanText(dateElement.text());

    // Validation
    if (!title || !company || title.length < 2) {
      return null;
    }

    // Parse salary
    const { min: salaryMin, max: salaryMax } = extractSalary(salaryText);

    return {
      title,
      company,
      location: location || "Remote",
      salary: salaryMin > 0 ? `₹${salaryMin}-${salaryMax} PA` : "Not disclosed",
      salaryMin,
      salaryMax,
      jobType: "Full-time",
      platform: "Naukri",
      description: description || title,
      skills: skills.slice(0, 5),
      experience: experience || "0-5 years",
      applyLink,
      rating: 4.6,
      postedDate: parseJobPostingDate(postedDateStr),
    };
  } catch (error) {
    console.error("Error parsing Naukri job:", error.message);
    return null;
  }
};

/**
 * Scrape jobs for a specific keyword (fallback function)
 */
const scrapeKeywordJobs = async (keyword, pages = 2) => {
  const allJobs = [];

  try {
    for (let page = 1; page <= pages; page++) {
      const pageUrl = `https://www.naukri.com/search?query=${encodeURIComponent(
        keyword
      )}&pageNo=${page}`;

      console.log(`Scraping Naukri - "${keyword}" (page ${page})`);

      try {
        const html = await fetchHTML(pageUrl);
        const $ = parseHTML(html);

        // Find all job cards
        const jobElements = $("article.jobCard, div.jobCardWrapper");
        let pageJobCount = 0;

        jobElements.each((i, element) => {
          const job = scrapeJobFromNaukri($, element);
          if (job && isValidJob(job)) {
            allJobs.push(job);
            pageJobCount++;
          }
        });

        console.log(`Found ${pageJobCount} jobs on page ${page}`);
        await randomDelay(2000, 3500); // Respectful delay

        if (pageJobCount === 0) {
          console.log("No more jobs found, stopping pagination");
          break;
        }
      } catch (pageError) {
        console.error(`Error scraping page ${page}:`, pageError.message);
        continue;
      }
    }

    return allJobs;
  } catch (error) {
    console.error(`Error scraping Naukri for "${keyword}":`, error.message);
    return [];
  }
};

/**
 * Main scraper function - uses optimized Naukri URL for better job discovery
 * Similar to LinkedIn optimization, this URL targets:
 * - Fullstack Developer + Backend + Frontend + Web Development Internship roles
 * - Remote location
 * - All experience levels (0-5+ years)
 * - Campus + Professional jobs
 */
export const scrapeNaukri = async (pages = 3) => {
  console.log(
    `\n🔍 Starting Naukri scraper (optimized URL, ${pages} pages)...`
  );
  console.log(
    "📍 Targeting: Fullstack/Backend/Frontend/Web Dev + Internships (Remote)"
  );

  try {
    // Use optimized Naukri URL with curated filters
    const jobs = await scrapeNaukriJobs(pages);

    // Remove duplicates based on title + company combination
    const uniqueJobs = [];
    const seen = new Set();

    for (const job of jobs) {
      const key = `${job.title}-${job.company}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueJobs.push(job);
      }
    }

    console.log(
      `✅ Naukri scraping complete! Total: ${uniqueJobs.length} unique jobs`
    );
    return uniqueJobs;
  } catch (error) {
    console.error("❌ Naukri scraper error:", error.message);
    return [];
  }
};

export default { scrapeNaukri };
