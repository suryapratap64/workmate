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
 * Test the parseJobPostingDate function with various inputs
 * This script validates that date parsing works correctly
 */

const testCases = [
  // LinkedIn format
  { input: "Posted 2 days ago", expectedDaysAgo: 2 },
  { input: "Posted 5 hours ago", expectedDaysAgo: 0 },
  { input: "Posted 1 week ago", expectedDaysAgo: 7 },
  { input: "2 days ago", expectedDaysAgo: 2 },
  { input: "5 hours ago", expectedDaysAgo: 0 },
  { input: "1 week ago", expectedDaysAgo: 7 },
  { input: "3 months ago", expectedDaysAgo: 90 },

  // Short format
  { input: "2d ago", expectedDaysAgo: 2 },
  { input: "5h ago", expectedDaysAgo: 0 },
  { input: "1w ago", expectedDaysAgo: 7 },
  { input: "30m ago", expectedDaysAgo: 0 },

  // Edge cases
  { input: "1 minute ago", expectedDaysAgo: 0 },
  { input: "1 day ago", expectedDaysAgo: 1 },
  { input: "1 month ago", expectedDaysAgo: 30 },
  { input: "1 year ago", expectedDaysAgo: 365 },

  // Invalid/empty
  { input: "", expectedDaysAgo: 30 }, // Fallback to 30 days
  { input: "invalid date", expectedDaysAgo: 30 }, // Fallback
  { input: null, expectedDaysAgo: 0 }, // Current date
];

console.log("📅 Testing parseJobPostingDate function...\n");

let passedTests = 0;
let failedTests = 0;

testCases.forEach(({ input, expectedDaysAgo }) => {
  try {
    const result = parseJobPostingDate(input);
    const now = new Date();
    const diffMs = now - result;
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    // Allow 1 day tolerance for the diff
    const tolerance = 1;
    const isValid = Math.abs(diffDays - expectedDaysAgo) <= tolerance;

    if (isValid) {
      console.log(`✅ PASS: "${input}"`);
      console.log(`   Expected ~${expectedDaysAgo}d ago, got ${diffDays}d ago`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: "${input}"`);
      console.log(`   Expected ~${expectedDaysAgo}d ago, got ${diffDays}d ago`);
      failedTests++;
    }
    console.log();
  } catch (error) {
    console.log(`❌ ERROR: "${input}"`);
    console.log(`   ${error.message}`);
    failedTests++;
    console.log();
  }
});

console.log("═══════════════════════════════════════");
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
console.log("═══════════════════════════════════════\n");

if (failedTests === 0) {
  console.log("🎉 All tests passed! Date parsing is working correctly.\n");
  process.exit(0);
} else {
  console.log(
    `⚠️  ${failedTests} test(s) failed. Please review the date parsing logic.\n`
  );
  process.exit(1);
}
