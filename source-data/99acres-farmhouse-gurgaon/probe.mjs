import { chromium } from '/Users/dextermorgan/Desktop/Dhando/node_modules/playwright/index.mjs';

const ctx = await chromium.launchPersistentContext('/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon/profile', {
  headless: false,
  viewport: { width: 1440, height: 900 },
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
const resp = await page.goto('https://www.99acres.com/farm-house-in-gurgaon-ffid', { waitUntil: 'domcontentloaded', timeout: 60000 });
console.log('STATUS', resp && resp.status());
await page.waitForTimeout(6000);
const html = await page.content();
console.log('LEN', html.length);
console.log('TITLE', await page.title());
const fs = await import('node:fs');
fs.writeFileSync('/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon/probe.html', html);
await page.screenshot({ path: '/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon/probe.png' });
await ctx.close();
