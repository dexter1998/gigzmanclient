import { chromium } from '/Users/dextermorgan/Desktop/Dhando/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon';
const RAW = path.join(DIR, 'raw');
const BASE = 'https://www.99acres.com/farm-house-in-gurgaon-ffid';
fs.mkdirSync(RAW, { recursive: true });

const sleep = ms => new Promise(r => setTimeout(r, ms));

const ctx = await chromium.launchPersistentContext(DIR + '/profile', {
  headless: false, viewport: { width: 1440, height: 900 },
  locale: 'en-IN', timezoneId: 'Asia/Kolkata',
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || await ctx.newPage();
// don't waste bandwidth on images/media while collecting JSON
await page.route('**/*', route => {
  const t = route.request().resourceType();
  if (t === 'image' || t === 'media' || t === 'font') return route.abort();
  route.continue();
});

let totalPages = 18;
for (let n = 1; n <= totalPages; n++) {
  const out = path.join(RAW, `page-${n}.json`);
  if (fs.existsSync(out)) { console.log(`skip page ${n} (cached)`); continue; }
  const url = n === 1 ? BASE : `${BASE}-page-${n}`;
  let ok = false;
  for (let attempt = 1; attempt <= 3 && !ok; attempt++) {
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => window.__initialData__?.srp?.pageData?.properties?.length > 0, { timeout: 30000 });
      const payload = await page.evaluate(() => {
        const d = window.__initialData__;
        return JSON.parse(JSON.stringify({
          properties: d.srp.pageData.properties,
          count: d.pagination?.count,
          pageNumber: d.pagination?.pageNumber,
          facets: d.filter?.facets || null,
        }));
      });
      fs.writeFileSync(out, JSON.stringify(payload));
      if (payload.count) totalPages = Math.ceil(payload.count / 25);
      console.log(`page ${n}/${totalPages}  status=${resp?.status()}  props=${payload.properties.length}  total=${payload.count}`);
      ok = true;
    } catch (e) {
      console.log(`page ${n} attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
      await sleep(5000 * attempt);
    }
  }
  if (!ok) console.log(`!! page ${n} GAVE UP`);
  await sleep(2500 + Math.floor(Math.random() * 2000));
}
await ctx.close();
console.log('done');
