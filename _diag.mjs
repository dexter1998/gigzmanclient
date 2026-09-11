import { chromium } from "playwright";
const b = await chromium.launch();
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto("https://www.highproperties.in/", { waitUntil: "networkidle", timeout: 120000 });
await m.waitForTimeout(1500);
await m.click('button[aria-label="Open menu"]');
await m.waitForTimeout(800);
console.log("DRAWER", JSON.stringify(await m.evaluate(() => {
  const d = document.querySelector("header > div:last-child");
  return {
    bottom: Math.round(d.getBoundingClientRect().bottom),
    scrollable: d.scrollHeight > d.clientHeight,
    groups: [...d.querySelectorAll("details")].map(x => `${x.querySelector("summary")?.textContent?.trim().slice(0,20)}:${x.open ? "open" : "closed"}`),
    reachable: /Post Your Property/i.test(d.innerText) && /Summarise with AI/i.test(d.innerText),
  };
})));
await m.close();
const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
await d.goto("https://www.highproperties.in/", { waitUntil: "networkidle", timeout: 120000 });
await d.waitForTimeout(1200);
console.log("STRIP", JSON.stringify(await d.evaluate(() => {
  const s = document.querySelector("header div.hidden.lg\\:block");
  return { bg: getComputedStyle(s).backgroundColor, text: s.innerText.replace(/\n/g," | ") };
})));
await b.close();
