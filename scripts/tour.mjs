/* Screenshot tour: every room + a zoomed avatar check. */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOT = (n) =>
  `/private/tmp/claude-501/-Users-ahanasabat/2b81634b-d601-4e45-a7b6-c9abd8ab317f/scratchpad/${n}.png`;

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE);
await page.waitForSelector('[role="status"]', { state: "detached", timeout: 25000 });
await page.waitForTimeout(2500); // let the speech bubble finish typing
await page.screenshot({ path: SHOT("r-bedroom") });

await page.click('button[aria-label="Door — Studio"]');
await page.waitForTimeout(6500); // let the speech bubble dismiss

await page.screenshot({ path: SHOT("r-studio") });

await page.click('button[aria-label="Door — Bedroom"]');
await page.waitForTimeout(1200);
await page.click('button[aria-label="Door — Contact Nook"]');
await page.waitForTimeout(1400);
await page.screenshot({ path: SHOT("r-contact") });

console.log("done");
await browser.close();
