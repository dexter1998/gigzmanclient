import { chromium } from '/Users/dextermorgan/Desktop/Dhando/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const DIR='/Users/dextermorgan/Desktop/99acres-farmhouse-gurgaon';
const ctx = await chromium.launchPersistentContext(DIR+'/profile', {
  headless:false, viewport:{width:1440,height:900}, locale:'en-IN', timezoneId:'Asia/Kolkata',
  args:['--disable-blink-features=AutomationControlled'],
});
const page = ctx.pages()[0] || await ctx.newPage();
await page.goto('https://www.99acres.com/farm-house-in-gurgaon-ffid',{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(7000);
const data = await page.evaluate(() => {
  const d = window.__initialData__;
  if (!d) return null;
  return JSON.parse(JSON.stringify(d));
});
fs.writeFileSync(DIR+'/initialData.json', JSON.stringify(data,null,2));
console.log('TOPKEYS', data ? Object.keys(data).join(', ') : 'NULL');
await ctx.close();
