import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import {
  cleanText,
  extractSalary,
  parseJobPostingDate,
  randomDelay,
  isValidJob,
} from "./utils.js";

puppeteer.use(StealthPlugin());

const LINKEDIN_BASE_URL = "https://www.linkedin.com";
const LINKEDIN_JOBS_URL = "https://www.linkedin.com/jobs/search";


const extractJobDetails = (jobCard) => {
  try {
    // Extract title
    const titleElement = jobCard.querySelector("h3.base-search-card__title");
    const title = titleElement ? cleanText(titleElement.textContent) : "";

    // Extract company
    const companyElement = jobCard.querySelector(
      "h4.base-search-card__subtitle a"
    );
    const company = companyElement ? cleanText(companyElement.textContent) : "";

    // Extract location
    const locationElement = jobCard.querySelector(
      "span.job-search-card__location"
    );
    const location = locationElement
      ? cleanText(locationElement.textContent)
      : "";

    // Extract job link
    const linkElement = jobCard.querySelector("a.base-card__full-link");
    const applyLink = linkElement ? linkElement.getAttribute("href") : "";

    // Extract salary (if visible)
    const salaryElement = jobCard.querySelector(
      ".job-search-card__salary-info"
    );
    const salaryText = salaryElement
      ? cleanText(salaryElement.textContent)
      : "";

    // Extract job type
    const jobTypeElement = jobCard.querySelector(".job-search-card__job-type");
    const jobType = jobTypeElement
      ? cleanText(jobTypeElement.textContent)
      : "Full-time";

    // Extract posted date (e.g., "1 day ago", "2 weeks ago")
    const dateElement = jobCard.querySelector(
      ".job-search-card__job-insight-text span"
    );
    const postedDateStr = dateElement ? cleanText(dateElement.textContent) : "";

    if (!title || !company) {
      return null;
    }

    const { min: salaryMin, max: salaryMax } = extractSalary(salaryText);

    return {
      title,
      company,
      location,
      salary: salaryMin > 0 ? `$${salaryMin}-${salaryMax}` : "Not disclosed",
      salaryMin,
      salaryMax,
      jobType,
      platform: "LinkedIn",
      description: title, // Full description requires clicking the job
      skills: [],
      experience: "1-5 years",
      applyLink: applyLink.split("?")[0], // Remove query params
      rating: 4.7,
      postedDate: parseJobPostingDate(postedDateStr), // ← Use real platform date
    };
  } catch (error) {
    console.error("Error extracting LinkedIn job details:", error.message);
    return null;
  }
};

/**
 * Scroll and collect all jobs on a page
 */
const collectJobsFromPage = async (page) => {
  try {
    // Scroll to load more jobs
    let previousHeight = 0;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const jobsContainer = await page.$(".jobs-search__results-list");

      if (jobsContainer) {
        const currentHeight = await page.evaluate((element) => {
          return element.scrollHeight;
        }, jobsContainer);

        if (currentHeight === previousHeight) {
          break;
        }

        previousHeight = currentHeight;

        await page.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        }, jobsContainer);

        await randomDelay(1000, 2000);
      }

      attempts++;
    }

    // Extract job cards with better data extraction
    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll(".base-card");
      const extractedJobs = [];

      jobElements.forEach((jobCard, index) => {
        const titleElement = jobCard.querySelector(
          "h3.base-search-card__title"
        );
        const companyElement = jobCard.querySelector(
          "h4.base-search-card__subtitle a"
        );
        const locationElement = jobCard.querySelector(
          "span.job-search-card__location"
        );

        // Try multiple selectors for link
        let linkElement = jobCard.querySelector("a.base-card__full-link");
        let applyLink = linkElement?.getAttribute("href") || "";

        // Fallback: try to find any job link
        if (!applyLink) {
          linkElement = jobCard.querySelector("a[href*='/jobs/']");
          applyLink = linkElement?.getAttribute("href") || "";
        }

        const salaryElement = jobCard.querySelector(
          ".job-search-card__salary-info"
        );
        const jobTypeElement = jobCard.querySelector(
          ".job-search-card__job-type"
        );

        // Extract posted date - LinkedIn shows "Posted X days ago" in multiple possible locations
        let postedDateStr = "";

        // Try multiple selectors for date
        let dateElement = jobCard.querySelector(
          ".job-search-card__job-insight-text span"
        );
        if (dateElement) {
          postedDateStr = dateElement.textContent.trim();
        }

        // Fallback: look for any span with "ago" text
        if (!postedDateStr || !postedDateStr.includes("ago")) {
          const allSpans = jobCard.querySelectorAll("span");
          for (let span of allSpans) {
            const text = span.textContent?.trim()?.toLowerCase() || "";
            if (
              text.includes("ago") &&
              (text.includes("day") ||
                text.includes("hour") ||
                text.includes("minute") ||
                text.includes("week") ||
                text.includes("month") ||
                text.includes("year"))
            ) {
              postedDateStr = span.textContent.trim();
              break;
            }
          }
        }

        // If still not found, try to extract from job insights text
        if (!postedDateStr) {
          const allText = jobCard.innerText;
          const match = allText.match(
            /(\d+\s*(day|hour|minute|week|month|year)s?\s+ago)/i
          );
          if (match) {
            postedDateStr = match[1];
          }
        }

        const title = titleElement?.textContent?.trim() || "";
        const company = companyElement?.textContent?.trim() || "";

        // Only add if we have essential data
        if (title && company && applyLink) {
          extractedJobs.push({
            title,
            company,
            location: locationElement?.textContent?.trim() || "",
            salary: salaryElement?.textContent?.trim() || "",
            jobType: jobTypeElement?.textContent?.trim() || "Full-time",
            applyLink,
            postedDateStr, // ← Pass the raw date string
          });
        }
      });

      return extractedJobs;
    });

    console.log(`✅ Collected ${jobs.length} jobs from page`);
    return jobs;
  } catch (error) {
    console.error("Error collecting jobs from page:", error.message);
    return [];
  }
};

/**
 * Main LinkedIn scraper function
 * Optimized: Search for web development jobs in India with location filter
 */
export const scrapeLinkedIn = async (
  keywords = [
    "Frontend Developer",
    "Backend Developer",
    "Web Developer",
    "React Developer",
    "Node.js Developer",
    "Full Stack Developer",
  ],
  pages = 3 // Reduced to 3 pages per keyword (75 jobs per keyword × 6 keywords = ~450 jobs)
) => {
  console.log(
    `\n🔍 Starting LinkedIn scraper - India based Web Development jobs (${keywords.length} keywords, ${pages} pages)...`
  );

  let browser;
  const allJobs = [];
  let pageTimeouts = 0;

  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    for (const keyword of keywords) {
      console.log(
        `\n📍 Scraping LinkedIn for: "${keyword}" (India - Last 24h, Remote/On-site)`
      );

      for (let page = 0; page < pages; page++) {
        try {
          const linkedinPage = await browser.newPage();
          await linkedinPage.setViewport({ width: 1280, height: 720 });

          // Set user agent
          await linkedinPage.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          );

          // Navigate to LinkedIn jobs with optimized filters for India-based, latest jobs
          // LinkedIn URL parameters explained:
          // - keywords: job title/keywords (Frontend Developer, Backend Developer, etc.)
          // - geoId=102713980: India's LinkedIn geo ID
          // - f_TPR=r86400: Time posted range (r86400 = last 24 hours, r604800 = last week)
          // - f_WT=2: Work type (2 = flexible/remote options)
          // - origin=JOB_SEARCH_PAGE_JOB_FILTER: Analytics tracking
          // - start: pagination (0, 25, 50, 75, etc.)
          const searchUrl = `${LINKEDIN_JOBS_URL}?keywords=${encodeURIComponent(
            keyword
          )}&geoId=102713980&f_TPR=r86400&f_WT=2&origin=JOB_SEARCH_PAGE_JOB_FILTER&start=${
            page * 25
          }`;

          console.log(`   Loading page ${page + 1}/${pages}: ${keyword}...`);

          try {
            await linkedinPage.goto(searchUrl, {
              waitUntil: "domcontentloaded",
              timeout: 18000, // Reduced to 18 seconds
            });
          } catch (navError) {
            console.warn(`   ⚠️  Navigation timeout, retrying...`);
            try {
              await linkedinPage.goto(searchUrl, {
                waitUntil: "domcontentloaded",
                timeout: 10000, // Retry with 10 seconds
              });
            } catch (retryError) {
              console.warn(`   ⚠️  Retry failed, skipping page...`);
              await linkedinPage.close();
              continue;
            }
          }

          // Wait for job cards to load
          try {
            await linkedinPage.waitForSelector(".base-card", {
              timeout: 6000,
            });
          } catch (selectorError) {
            console.warn(`   ⚠️  No job cards found on page`);
            await linkedinPage.close();
            continue;
          }

          // Collect jobs
          const pageJobs = await collectJobsFromPage(linkedinPage);

          // Process jobs
          let jobsAdded = 0;
          let jobsSkipped = 0;

          for (const job of pageJobs) {
            if (job.title && job.company && job.applyLink) {
              const { min: salaryMin, max: salaryMax } = extractSalary(
                job.salary
              );

              const parsedPostedDate = parseJobPostingDate(job.postedDateStr);

              const processedJob = {
                title: cleanText(job.title),
                company: cleanText(job.company),
                location: cleanText(job.location),
                salary:
                  salaryMin > 0
                    ? `$${salaryMin}-${salaryMax}`
                    : "Not disclosed",
                salaryMin,
                salaryMax,
                jobType: job.jobType || "Full-time",
                platform: "LinkedIn",
                description: cleanText(job.title),
                skills: [],
                experience: "1-5 years",
                applyLink: job.applyLink,
                rating: 4.7,
                postedDate: parsedPostedDate,
              };

              if (isValidJob(processedJob)) {
                allJobs.push(processedJob);
                jobsAdded++;
              } else {
                jobsSkipped++;
              }
            } else {
              jobsSkipped++;
            }
          }

          console.log(
            `   📊 Page results: ${jobsAdded} added, ${jobsSkipped} skipped`
          );

          await linkedinPage.close();
          await randomDelay(800, 1200); // Faster delays between pages
        } catch (pageError) {
          console.error(
            `   ❌ Error scraping page ${page} for "${keyword}":`,
            pageError.message
          );
          pageTimeouts++;
          if (pageTimeouts > 1) {
            console.warn(`   ⚠️  Too many timeouts, moving to next keyword`);
            pageTimeouts = 0;
            break;
          }
          continue;
        }
      }
    }

    console.log(
      `\n✅ LinkedIn scraping complete! Total: ${allJobs.length} India-based web dev jobs collected`
    );
    return allJobs;
  } catch (error) {
    console.error("❌ LinkedIn scraper error:", error.message);
    console.log(`📊 Returning ${allJobs.length} jobs collected so far...`);
    return allJobs; // Return collected jobs even on error
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default { scrapeLinkedIn };
