/* End-to-end smoke test: boot, click objects, walk, use doors, chat, explore, 404. */
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SHOT = (name) =>
  `/private/tmp/claude-501/-Users-ahanasabat/2b81634b-d601-4e45-a7b6-c9abd8ab317f/scratchpad/${name}.png`;

const results = [];
const check = (name, ok, extra = "") => {
  results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " — " + extra : ""}`);
};

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(BASE);
// Wait for the loading screen to finish (avatar appears).
await page.waitForSelector('[aria-label*="avatar"]', { timeout: 20000 });
check("boot: world visible after loading screen", true);

// 1. Click the desk -> Projects window opens.
await page.click('button[aria-label="Computer — Projects"]');
const dialog = await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
check("click desk opens Projects window", !!dialog);
await page.screenshot({ path: SHOT("t-window") });

// 2. Esc closes it, focus returns.
await page.keyboard.press("Escape");
await page.waitForSelector('[role="dialog"]', { state: "detached", timeout: 5000 });
check("Escape closes the window", true);

// 3. Walk with WASD — avatar transform should change.
const before = await page.$eval('[aria-label*="avatar"]', (el) =>
  el.closest("div.absolute").style.transform);
await page.keyboard.down("d");
await page.waitForTimeout(600);
await page.keyboard.up("d");
const after = await page.$eval('[aria-label*="avatar"]', (el) =>
  el.closest("div.absolute").style.transform);
check("WASD walking moves the avatar", before !== after, `${before} -> ${after}`);

// 4. Kick the soccer ball -> toast.
await page.click('button[aria-label="Soccer ball (kick me)"]');
await page.waitForTimeout(400);
const toast = await page.textContent("body");
check("soccer ball toast", toast.includes("GOOOAL"));

// 5. Door -> Studio room transition.
await page.click('button[aria-label="Door — Studio"]');
await page.waitForTimeout(1500);
const roomName = await page.textContent("body");
check("door leads to the Studio", roomName.includes("THE STUDIO"));
await page.screenshot({ path: SHOT("t-studio") });

// 6. Walk to the contact nook via bedroom.
await page.click('button[aria-label="Door — Bedroom"]');
await page.waitForTimeout(1200);
await page.click('button[aria-label="Door — Contact Nook"]');
await page.waitForTimeout(1500);
check("bedroom -> contact nook", (await page.textContent("body")).includes("THE CONTACT NOOK"));
await page.screenshot({ path: SHOT("t-contact") });
await page.click('button[aria-label="Door — Bedroom"]');
await page.waitForTimeout(1200);

// 7. Bookshelf opens the Writing window.
await page.click('button[aria-label="Bookshelf — Writing & Fiction"]');
await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
check("bookshelf opens Writing window", true);
await page.keyboard.press("Escape");

// 8. Explore page renders all panels.
await page.goto(BASE + "/explore");
const explore = await page.textContent("body");
check(
  "explore page lists content",
  explore.includes("Design & Art") && explore.includes("sabat.arnav@gmail.com"),
);
await page.screenshot({ path: SHOT("t-explore"), fullPage: false });

// 9. 404 page.
await page.goto(BASE + "/nowhere");
check("404 page", (await page.textContent("body")).includes("empty room"));
await page.screenshot({ path: SHOT("t-404") });

// 10. Mobile viewport sanity — no horizontal overflow.
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(BASE);
await mobile.waitForSelector('[aria-label*="avatar"]', { timeout: 20000 });
const overflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
);
check("mobile: no horizontal overflow", !overflow);
await mobile.screenshot({ path: SHOT("t-mobile") });

console.log(results.join("\n"));
console.log("\nPage errors:", errors.length ? errors.join("\n") : "none");
await browser.close();
