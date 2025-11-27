import {
  cleanText,
  extractSalary,
  parseJobPostingDate,
  randomDelay,
  isValidJob,
} from "./utils.js";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

/**
 * Internshala Scraper - Scrapes internship listings from internshala.com
 * Website: https://internshala.com
 * Data: Internship titles, companies, stipends, locations, duration
 * Focus: Web Development internships (Backend, Frontend, Full-Stack) - Work from Home
 */

const INTERNSHALA_BASE_URL = "https://internshala.com";
const INTERNSHALA_JOBS_URL =
  "https://internshala.com/internships/work-from-home-backend-development,front-end-development,web-development-internships/";

/**
 * Scrape all internships from a page using Puppeteer (JavaScript rendering)
 * Properly extracts individual internship cards with clean separation of data fields
 */
const scrapePage = async (page, pageNum = 0) => {
  try {
    // Internshala uses AJAX pagination
    const pageUrl =
      pageNum === 0
        ? INTERNSHALA_JOBS_URL
        : `${INTERNSHALA_JOBS_URL}?page=${pageNum}`;

    console.log(`\n📍 Scraping Internshala page ${pageNum + 1}...`);

    // Navigate to page
    await page.goto(pageUrl, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // Wait and scroll to load all cards
    await randomDelay(2000, 3000);
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 3);
    });
    await randomDelay(1000, 2000);

    // Extract internship data with ROBUST selector fallbacks
    const jobs = await page.evaluate(() => {
      const internships = [];

      // Try multiple selectors for internship cards (Internshala changes structure frequently)
      const selectors = [
        "div.internship_card", // Most common
        "div[data-internship-id]", // Data attribute based
        "div.card_internship", // Alternative
        "article.internship", // HTML5 semantic
        "div.individual_internship", // Alternative name
        "li.internship_item", // List item variant
        ".internship-listing", // Class variant
      ];

      let cards = [];
      for (const selector of selectors) {
        cards = Array.from(document.querySelectorAll(selector));
        if (cards.length > 0) {
          console.log(
            `✓ Found ${cards.length} cards using selector: ${selector}`
          );
          break;
        }
      }

      // If still no cards, try a more general approach - look for clickable containers with internship links
      if (cards.length === 0) {
        const allContainers = Array.from(
          document.querySelectorAll(
            "div[class*='card'], div[class*='listing'], article"
          )
        );
        cards = allContainers.filter(
          (el) =>
            el.querySelector("a[href*='internship']") ||
            el.innerText.toLowerCase().includes("internship")
        );
      }

      for (const card of cards) {
        try {
          // Extract title - look for the main heading
          let title = "";
          const titleSelectors = [
            "h3", // Most common
            "h2", // Alternative
            "a[href*='internship']", // Link text
            "span[class*='title']", // Class-based title
          ];

          for (const selector of titleSelectors) {
            const titleEl = card.querySelector(selector);
            if (titleEl) {
              title = titleEl.textContent?.trim() || "";
              if (title && title.length > 3) break;
            }
          }

          title = title.trim().substring(0, 150);
          if (!title || title.length < 3) continue;

          // Extract company - look for company-specific elements
          let company = "";
          const companySelectors = [
            "a[href*='company']", // Company link
            "span[class*='company']", // Company class
            "span[class*='organization']", // Organization class
            "div[class*='recruiter']", // Recruiter name
            "div.company_name", // Internshala specific
          ];

          for (const selector of companySelectors) {
            const companyEl = card.querySelector(selector);
            if (companyEl) {
              company = companyEl.textContent?.trim() || "";
              if (company && company.length > 2 && company.length < 100) break;
            }
          }

          // If company not found via selectors, extract from visible text
          // by finding text between title and location/salary info
          if (!company || company.length < 2) {
            const allSpans = Array.from(card.querySelectorAll("span, p, div"));
            for (const span of allSpans) {
              const text = span.textContent?.trim() || "";
              // Look for company-like text: not too short, not too long, not numbers/currency
              if (
                text.length > 4 &&
                text.length < 100 &&
                !text.includes("₹") &&
                !text.includes("ago") &&
                !text.includes("Apply") &&
                !text.includes("posted") &&
                !text.includes("Duration") &&
                !text.includes("Stipend") &&
                text !== title
              ) {
                company = text;
                break;
              }
            }
          }

          company = company.trim().substring(0, 100);
          if (!company || company.length < 2) continue;

          // Extract stipend/salary
          let salary = "Not disclosed";
          const cardText = card.textContent || "";
          const salaryMatch = cardText.match(/₹\s*[\d,]+/);
          if (salaryMatch) {
            salary = salaryMatch[0].trim();
          }

          // Extract location from text or attributes
          let location = "Work from Home";
          const locationKeywords = {
            delhi: "Delhi",
            mumbai: "Mumbai",
            bangalore: "Bangalore",
            hyderabad: "Hyderabad",
            pune: "Pune",
            "new delhi": "Delhi",
            bengaluru: "Bangalore",
            "work from home": "Work from Home",
            remote: "Work from Home",
          };

          const lowerCardText = cardText.toLowerCase();
          for (const [keyword, locationName] of Object.entries(
            locationKeywords
          )) {
            if (lowerCardText.includes(keyword)) {
              location = locationName;
              break;
            }
          }

          // Extract apply link
          let applyLink = "";
          const mainLink = card.querySelector("a[href*='internship']");
          if (mainLink) {
            applyLink = mainLink.getAttribute("href") || "";
          }

          if (!applyLink) {
            applyLink = `${INTERNSHALA_BASE_URL}/internships/`;
          }

          // Extract posting date - look for "posted X ago" patterns
          let postedDate = "Recently Posted";
          const datePatterns = [
            /posted\s+(\d+\s+(?:hour|day|week|month)s?\s+ago)/i,
            /(\d+\s+(?:hour|day|week|month)s?\s+ago)/i,
            /recently/i,
          ];

          for (const pattern of datePatterns) {
            const dateMatch = cardText.match(pattern);
            if (dateMatch) {
              postedDate = dateMatch[1] || dateMatch[0] || "Recently Posted";
              break;
            }
          }

          internships.push({
            title,
            company,
            location,
            salary,
            applyLink,
            postedDate: postedDate || "Recently Posted",
            description: title, // Use title as fallback description
          });
        } catch (err) {
          // Skip this card silently
        }
      }

      return internships;
    });

    console.log(
      `   ✅ Found ${jobs.length} internships on page ${pageNum + 1}`
    );

    if (jobs.length > 0) {
      console.log(`   📋 Sample internships:`);
      jobs.slice(0, 3).forEach((job) => {
        console.log(`      • "${job.title}" @ "${job.company}"`);
      });
    }

    await randomDelay(1500, 2500);
    return jobs;
  } catch (error) {
    console.error(`Error scraping page: ${error.message}`);
    return [];
  }
};

/**
 * Main scraper function
 */
export const scrapeInternshala = async (pages = 3) => {
  console.log(
    `\n🔍 Starting Internshala scraper - Web Development Internships, Work from Home (${pages} pages)...`
  );

  const allJobs = [];
  let browser;
  let consecutiveEmptyPages = 0;

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

    // Scrape multiple pages
    for (let pageNum = 0; pageNum < pages; pageNum++) {
      try {
        const puppeteerPage = await browser.newPage();
        await puppeteerPage.setViewport({ width: 1280, height: 720 });

        // Set user agent
        await puppeteerPage.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        );

        const pageJobs = await scrapePage(puppeteerPage, pageNum);

        // Process jobs with data validation
        for (const rawJob of pageJobs) {
          try {
            // Skip if title or company is empty
            if (!rawJob.title || rawJob.title.length < 3) continue;
            if (!rawJob.company || rawJob.company.length < 2) continue;

            const { min: salaryMin, max: salaryMax } = extractSalary(
              rawJob.salary
            );

            const job = {
              title: cleanText(rawJob.title).substring(0, 150),
              company: cleanText(rawJob.company).substring(0, 100),
              location: cleanText(
                rawJob.location || "Work from Home"
              ).substring(0, 100),
              salary:
                salaryMin > 0
                  ? `₹${salaryMin}-${salaryMax}`
                  : rawJob.salary || "Not disclosed",
              salaryMin,
              salaryMax,
              jobType: "Internship",
              platform: "Internshala",
              description: cleanText(
                rawJob.description || rawJob.title
              ).substring(0, 300),
              skills: (rawJob.skills || []).slice(0, 5),
              experience: "0-1 years",
              applyLink:
                rawJob.applyLink && rawJob.applyLink.length > 0
                  ? rawJob.applyLink.startsWith("http")
                    ? rawJob.applyLink
                    : `${INTERNSHALA_BASE_URL}${rawJob.applyLink}`
                  : `${INTERNSHALA_BASE_URL}/internships/`,
              rating: 4.5,
              postedDate: parseJobPostingDate(rawJob.postedDate),
            };

            if (isValidJob(job)) {
              allJobs.push(job);
              console.log(
                `   ✅ Saved: ${job.title.substring(0, 40)}... (${job.company})`
              );
            } else {
              console.log(`   ⚠️  Invalid job: ${rawJob.title}`);
            }
          } catch (jobError) {
            console.log(`   ⚠️  Error processing job: ${jobError.message}`);
          }
        }

        if (pageJobs.length === 0) {
          consecutiveEmptyPages++;
          console.log(`⚠️  Empty page detected (${consecutiveEmptyPages}/2)`);

          if (consecutiveEmptyPages >= 2) {
            console.log(`ℹ️  Stopping pagination: no more internships found`);
            await puppeteerPage.close();
            break;
          }
        } else {
          consecutiveEmptyPages = 0;
        }

        await puppeteerPage.close();
        await randomDelay(2000, 3000);
      } catch (pageError) {
        console.error(`Error on page ${pageNum}:`, pageError.message);
        continue;
      }
    }

    console.log(
      `\n✅ Internshala scraping complete! Total: ${allJobs.length} web development internships collected`
    );
    return allJobs;
  } catch (error) {
    console.error("❌ Internshala scraper error:", error.message);
    console.log(
      `📊 Returning ${allJobs.length} internships collected so far...`
    );
    return allJobs;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export default { scrapeInternshala };
