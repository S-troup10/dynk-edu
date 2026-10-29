#!/usr/bin/env node
// Screen-record a website with Playwright (phone-sized by default) for use as scene footage.
// Usage:
//   node tools/record_web.mjs --url https://explorer.solana.com --out runs/<id>/captures/S03.mp4 \
//        [--steps steps.json] [--device phone|desktop] [--seconds 6]
// steps.json: [{"wait":800},{"scroll":600},{"click":"text=Wallet"},{"type":["#search","DYNK"]},{"hover":"css=.btn"}]
// Output is converted to H.264 mp4 at 1080 wide.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith("--") ? [...acc, [a.slice(2), arr[i + 1]]] : acc), []),
);
if (!args.url || !args.out) {
  console.error("need --url and --out");
  process.exit(1);
}
const phone = (args.device ?? "phone") === "phone";
const viewport = phone ? { width: 430, height: 932 } : { width: 1280, height: 800 };
const tmp = fs.mkdtempSync(path.join(path.dirname(path.resolve(args.out)), ".rec-"));
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport,
  deviceScaleFactor: 2,
  isMobile: phone,
  hasTouch: phone,
  recordVideo: { dir: tmp, size: phone ? { width: 860, height: 1864 } : { width: 1280, height: 800 } },
});
const page = await ctx.newPage();
await page.goto(args.url, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
const steps = args.steps ? JSON.parse(fs.readFileSync(args.steps, "utf8")) : [{ wait: 1500 }, { scroll: 700 }, { wait: 1200 }, { scroll: 700 }, { wait: 1200 }];
for (const s of steps) {
  if (s.wait) await page.waitForTimeout(s.wait);
  if (s.scroll) await page.mouse.wheel(0, s.scroll), await page.waitForTimeout(400);
  if (s.click) await page.click(s.click).catch((e) => console.warn("click failed", s.click, e.message));
  if (s.hover) await page.hover(s.hover).catch(() => {});
  if (s.type) await page.fill(s.type[0], "").then(() => page.type(s.type[0], s.type[1], { delay: 70 })).catch(() => {});
}
if (args.seconds) await page.waitForTimeout(Number(args.seconds) * 1000);
const vid = page.video();
await ctx.close();
await browser.close();
const webm = await vid.path();
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", webm, "-vf", "scale=1080:-2,fps=30", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-an", args.out]);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Recorded ${args.url} -> ${args.out}`);
