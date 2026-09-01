import { chromium, type Page, type Browser } from "playwright";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * End-to-end exercise of every page and feature, capturing screenshots at three
 * viewports for visual review.
 *
 * Usage: pnpm dry-run [baseUrl]
 */

const BASE = process.argv[2] ?? "http://localhost:3001";
const TENANT = "/cafirm/arora-k-associates";
const REALESTATE_TENANT = "/realestate/high-properties";
const SHOTS = join(process.cwd(), "screenshots");

/**
 * The real-estate tenant gets the same public-page/viewport/overflow/tap-target/
 * console-error pass as the CA tenant, plus its own small feature exercise
 * below (EMI calculator, property filters, RERA disclosure) — it does not
 * replay the CA-only dashboard CRUD flows (compliance popup, editorial
 * gating, etc.), which are genuinely CA-specific behaviour, not something a
 * second vertical needs an equivalent of one-for-one.
 */
const REALESTATE_PUBLIC_PAGES = [
  { path: "", name: "re-home" },
  { path: "/properties", name: "re-properties" },
  { path: "/properties/horizon-residences-golf-course-road", name: "re-property-detail" },
  { path: "/properties/canvas-villas-sohna-road", name: "re-property-detail-pending-rera" },
  { path: "/localities", name: "re-localities" },
  { path: "/localities/golf-course-road", name: "re-locality-detail" },
  { path: "/calculators", name: "re-calculators" },
  { path: "/calculators/emi", name: "re-calc-emi" },
  { path: "/calculators/stamp-duty", name: "re-calc-stamp-duty" },
  { path: "/calculators/rental-yield", name: "re-calc-rental-yield" },
  { path: "/updates", name: "re-updates" },
  { path: "/firm-profile", name: "re-firm-profile" },
  { path: "/contact", name: "re-contact" },
  { path: "/legal/privacy-policy", name: "re-legal-privacy" },
];

const ADMIN_EMAIL = process.env.DRY_RUN_EMAIL ?? "admin@arora-k-associates.local";
const ADMIN_PASSWORD = process.env.DRY_RUN_PASSWORD ?? "";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const PUBLIC_PAGES = [
  { path: "", name: "home" },
  { path: "/firm-profile", name: "firm-profile" },
  { path: "/services", name: "services" },
  { path: "/services/income-tax-return", name: "service-detail" },
  { path: "/calculators", name: "calculators" },
  { path: "/calculators/income-tax", name: "calc-income-tax" },
  { path: "/calculators/tds", name: "calc-tds" },
  { path: "/calculators/gst", name: "calc-gst" },
  { path: "/updates", name: "updates" },
  { path: "/updates/advance-tax-september-instalment", name: "update-detail" },
  { path: "/compliance-calendar", name: "compliance-calendar" },
  { path: "/knowledge", name: "knowledge" },
  { path: "/faq", name: "faq" },
  { path: "/careers", name: "careers" },
  { path: "/contact", name: "contact" },
  { path: "/chartered-accountant-in-gurugram", name: "location-gurugram" },
  { path: "/legal/privacy-policy", name: "legal-privacy" },
];

const DASHBOARD_PAGES = [
  { path: "/dashboard", name: "dash-overview" },
  { path: "/dashboard/queries", name: "dash-queries" },
  { path: "/dashboard/updates", name: "dash-updates" },
  { path: "/dashboard/compliance", name: "dash-compliance" },
  { path: "/dashboard/calculators", name: "dash-calculators" },
  { path: "/dashboard/settings", name: "dash-settings" },
];

interface Issue {
  area: string;
  detail: string;
  severity: "fail" | "warn";
}

const issues: Issue[] = [];
const passes: string[] = [];

function pass(label: string) {
  passes.push(label);
  console.log(`  ok    ${label}`);
}

function fail(area: string, detail: string, severity: Issue["severity"] = "fail") {
  issues.push({ area, detail, severity });
  console.log(`  ${severity === "fail" ? "FAIL" : "warn"}  ${area}: ${detail}`);
}

/** Flags horizontal overflow, which is the most common mobile layout defect. */
async function checkOverflow(page: Page, label: string) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scroll: doc.scrollWidth, client: doc.clientWidth };
  });
  if (overflow.scroll > overflow.client + 1) {
    fail(label, `horizontal overflow (${overflow.scroll}px content in ${overflow.client}px viewport)`);
    return false;
  }
  return true;
}

/**
 * WCAG 2.5.8 Target Size (Minimum) sets 24x24 CSS px at AA. A control wrapped in
 * its own label is measured through the label, since clicking the label activates
 * it — measuring the bare checkbox would report a false positive.
 */
const MIN_TARGET_PX = 24;

async function checkTapTargets(page: Page, label: string) {
  const small = await page.evaluate((minPx) => {
    const results: string[] = [];
    document.querySelectorAll("a, button, select, input[type=checkbox]").forEach((el) => {
      const wrappingLabel = el.closest("label");
      const measured = wrappingLabel ?? el;
      const rect = measured.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (rect.height < minPx) {
        const text = (el.textContent ?? "").trim().slice(0, 30) || el.tagName;
        results.push(`${text} (${Math.round(rect.height)}px)`);
      }
    });
    return [...new Set(results)].slice(0, 5);
  }, MIN_TARGET_PX);

  if (small.length > 0) {
    fail(label, `tap targets under ${MIN_TARGET_PX}px: ${small.join(", ")}`, "warn");
  }
}

async function shoot(page: Page, viewport: string, name: string) {
  await page.screenshot({ path: join(SHOTS, viewport, `${name}.png`), fullPage: true });
}

async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text().slice(0, 160));
  });
  page.on("pageerror", (err) => errors.push(err.message.slice(0, 160)));
  return errors;
}

/**
 * Public-page/viewport/overflow/tap-target/console-error pass for one tenant.
 * Shared by both tenants so a second vertical gets the same baseline checks
 * without duplicating the loop.
 */
async function runPublicPass(
  browser: Browser,
  tenantPath: string,
  pages: { path: string; name: string }[],
  label: string,
) {
  for (const viewport of VIEWPORTS) {
    console.log(`\n── ${label} · ${viewport.name} (${viewport.width}px) ─────────────────────`);
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    const errors = await collectConsoleErrors(page);

    for (const target of pages) {
      const url = `${BASE}${tenantPath}${target.path}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });

      if (!response || response.status() !== 200) {
        fail(target.name, `HTTP ${response?.status() ?? "no response"} at ${viewport.name}`);
        continue;
      }

      await checkOverflow(page, `${target.name}@${viewport.name}`);
      if (viewport.name === "mobile") await checkTapTargets(page, `${target.name}@mobile`);
      await shoot(page, viewport.name, target.name);
    }

    if (errors.length > 0) {
      fail(`${label} console@${viewport.name}`, [...new Set(errors)].slice(0, 3).join(" | "));
    } else {
      pass(`${label}: no console errors at ${viewport.name}`);
    }

    await context.close();
  }
}

async function run() {
  rmSync(SHOTS, { recursive: true, force: true });
  for (const v of VIEWPORTS) mkdirSync(join(SHOTS, v.name), { recursive: true });

  const browser: Browser = await chromium.launch();

  // ─────────────────────────────────────────── public pages, all viewports
  await runPublicPass(browser, TENANT, PUBLIC_PAGES, "cafirm");

  // ──────────────────────────────────────────────────── feature exercises
  console.log("\n── features ──────────────────────────────────────");
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await collectConsoleErrors(page);

  // Announcement bar with a live countdown
  await page.goto(`${BASE}${TENANT}`, { waitUntil: "networkidle" });
  const barText = await page.locator("header").first().textContent();
  const countdown = page.locator('[aria-label*="remaining"]').first();
  if (await countdown.count()) {
    const first = await countdown.textContent();
    await page.waitForTimeout(1600);
    const second = await countdown.textContent();
    if (first !== second) pass("countdown timer is ticking");
    else fail("countdown", `value did not change in 1.6s (stuck at "${first?.trim()}")`);
  } else {
    fail("countdown", "no countdown element found on the home page");
  }
  void barText;

  // Income tax calculator produces a result
  await page.goto(`${BASE}${TENANT}/calculators/income-tax`, { waitUntil: "networkidle" });
  await page.fill("#salaryIncome", "1500000");
  await page.fill("#section80C", "150000");
  await page.click('button:has-text("Calculate Estimate")');
  await page.waitForTimeout(400);
  const taxSummary = await page.locator("aside").first().textContent();
  if (taxSummary?.includes("Old regime") && taxSummary?.includes("New regime")) {
    pass("income tax calculator renders both regimes");
    await shoot(page, "desktop", "calc-income-tax-result");
  } else {
    fail("calculator", "income tax result did not render both regimes");
  }

  // GST calculator
  await page.goto(`${BASE}${TENANT}/calculators/gst`, { waitUntil: "networkidle" });
  await page.fill("#amount", "10000");
  await page.click('button:has-text("Calculate Estimate")');
  await page.waitForTimeout(300);
  const gstText = await page.locator("aside").first().textContent();
  if (gstText?.includes("CGST") && gstText?.includes("SGST")) pass("GST calculator splits CGST/SGST");
  else fail("calculator", "GST result missing CGST/SGST split");

  // TDS calculator
  await page.goto(`${BASE}${TENANT}/calculators/tds`, { waitUntil: "networkidle" });
  await page.fill("#paymentAmount", "200000");
  await page.click('button:has-text("Calculate Estimate")');
  await page.waitForTimeout(300);
  const tdsText = await page.locator("aside").first().textContent();
  if (tdsText?.includes("Estimated TDS")) pass("TDS calculator produces a deduction");
  else fail("calculator", "TDS result did not render");

  // Contact form validation then a real submission
  await page.goto(`${BASE}${TENANT}/contact`, { waitUntil: "networkidle" });
  await page.fill("#name", "Dry Run Verification");
  await page.click('button[type="submit"]:has-text("Submit Requirement")');
  await page.waitForTimeout(700);
  if (page.url().includes("/thank-you")) {
    fail("form validation", "submitted without phone/email or consent");
  } else {
    pass("form rejects submission without contact detail or consent");
  }

  // Start from a clean form: re-submitting the same instance after a validation
  // failure is not what a real visitor does and muddies the result.
  await page.goto(`${BASE}${TENANT}/contact`, { waitUntil: "networkidle" });
  await page.fill("#name", "Dry Run Verification");
  await page.fill("#phone", "9876500011");
  await page.selectOption("#clientType", "individual");
  await page.selectOption("#service", "income-tax-return");
  await page.fill("#message", "Automated dry run submission.");
  await page.check("#consent");
  await page.click('button[type="submit"]:has-text("Submit Requirement")');
  await page.waitForURL("**/thank-you**", { timeout: 15000 }).catch(() => {});

  let reference: string | null = null;
  if (page.url().includes("/thank-you")) {
    reference = new URL(page.url()).searchParams.get("ref");
    pass(`contact form created query ${reference}`);
    await shoot(page, "desktop", "thank-you-real");
  } else {
    fail("contact form", "submission did not reach the thank-you page");
  }

  // PAN rejection — the privacy policy promises these are never collected
  await page.goto(`${BASE}${TENANT}/contact`, { waitUntil: "networkidle" });
  await page.fill("#name", "PAN Guard Check");
  await page.fill("#phone", "9876500012");
  await page.fill("#message", "My PAN is ABCDE1234F please use it");
  await page.check("#consent");
  await page.click('button[type="submit"]:has-text("Submit Requirement")');
  await page.waitForTimeout(900);
  const panBlocked = !page.url().includes("/thank-you");
  if (panBlocked) pass("form refuses a message containing a PAN");
  else fail("privacy", "a message containing a PAN was accepted");

  // Dashboard must be protected
  await page.goto(`${BASE}${TENANT}/dashboard`, { waitUntil: "networkidle" });
  const loginVisible = await page.locator('input[name="password"]').count();
  if (loginVisible > 0) pass("dashboard requires sign-in");
  else fail("auth", "dashboard rendered without a session");

  // Sign in and exercise the dashboard
  if (ADMIN_PASSWORD) {
    await page.goto(`${BASE}${TENANT}/dashboard/login`, { waitUntil: "networkidle" });
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL("**/dashboard", { timeout: 12000 }).catch(() => {});

    if (page.url().includes("/dashboard") && !page.url().includes("login")) {
      pass("sign-in succeeds");

      for (const viewport of VIEWPORTS) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        for (const target of DASHBOARD_PAGES) {
          const res = await page.goto(`${BASE}${TENANT}${target.path}`, {
            waitUntil: "networkidle",
          });
          if (!res || res.status() !== 200) {
            fail(target.name, `HTTP ${res?.status()} at ${viewport.name}`);
            continue;
          }
          await checkOverflow(page, `${target.name}@${viewport.name}`);
          await shoot(page, viewport.name, target.name);
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 });

      // The submitted query should be visible
      await page.goto(`${BASE}${TENANT}/dashboard/queries`, { waitUntil: "networkidle" });
      const queriesText = await page.locator("body").textContent();
      if (reference && queriesText?.includes(reference)) {
        pass(`submitted query ${reference} appears in the dashboard`);
      } else if (reference) {
        fail("dashboard", `query ${reference} not listed`);
      }

      // Open it and change status, then confirm persistence
      if (reference) {
        await page.click(`text=${reference}`);
        await page.waitForLoadState("networkidle");
        await shoot(page, "desktop", "dash-query-detail");

        await page.selectOption("#status", "contact_attempted");
        await page.fill("#reason", "Dry run status change");
        await page.click('button:has-text("Update status")');
        await page.waitForTimeout(1200);
        await page.reload({ waitUntil: "networkidle" });
        const afterStatus = await page.locator("body").textContent();
        if (afterStatus?.includes("Contact Attempted")) {
          pass("query status change persists across reload");
        } else {
          fail("dashboard", "status change did not persist");
        }

        // Internal note
        await page.fill('textarea[name="body"]', "Dry run note.");
        await page.click('button:has-text("Add note")');
        await page.waitForTimeout(1200);
        await page.reload({ waitUntil: "networkidle" });
        const afterNote = await page.locator("body").textContent();
        if (afterNote?.includes("Dry run note.")) pass("internal note persists");
        else fail("dashboard", "internal note did not persist");
      }

      // Compliance date creation
      await page.goto(`${BASE}${TENANT}/dashboard/compliance`, { waitUntil: "networkidle" });
      await page.click('button:has-text("New date")');
      await page.fill("#title", "Dry Run Verification Date");
      await page.fill("#dueDate", "2027-01-20");
      await page.fill("#lastVerifiedAt", new Date().toISOString().slice(0, 10));
      await page.click('button:has-text("Save date")');
      await page.waitForTimeout(1400);
      const complianceText = await page.locator("body").textContent();
      if (complianceText?.includes("Dry Run Verification Date")) {
        pass("compliance date created and listed");
      } else {
        fail("dashboard", "compliance date was not created");
      }

      // Publish gating on updates
      await page.goto(`${BASE}${TENANT}/dashboard/updates`, { waitUntil: "networkidle" });
      await page.click('button:has-text("New update")');
      await page.fill("#title", "Dry Run Gating Check");
      await page.selectOption("#updateStatus", "published");
      await page.click('button:has-text("Save update")');
      await page.waitForTimeout(1200);
      const gateText = await page.locator("body").textContent();
      if (gateText?.includes("reviewer is required") || gateText?.includes("required before publishing")) {
        pass("publishing is blocked without a reviewer");
      } else {
        fail("editorial", "an update published without a reviewer or source");
      }

      // Settings ICAI warning
      await page.goto(`${BASE}${TENANT}/dashboard/settings`, { waitUntil: "networkidle" });
      const settingsText = await page.locator("body").textContent();
      if (settingsText?.includes("ICAI advertising restriction")) {
        pass("settings surfaces the ICAI restriction warning");
      } else {
        fail("compliance", "ICAI warning not shown in settings", "warn");
      }
    } else {
      fail("auth", "sign-in did not reach the dashboard");
    }
  } else {
    fail("auth", "DRY_RUN_PASSWORD not set — dashboard flows skipped", "warn");
  }

  // Mobile compliance popup rules
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE}${TENANT}`, { waitUntil: "networkidle" });
  await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
  await mobilePage.waitForTimeout(1500);
  const popup = mobilePage.locator('[role="dialog"][aria-label="Upcoming compliance deadline"]');
  if (await popup.count()) {
    pass("compliance popup appears on mobile after scrolling");
    await mobilePage.screenshot({ path: join(SHOTS, "mobile", "compliance-popup.png") });
    await popup.locator('button[aria-label="Dismiss"]').click();
    await mobilePage.waitForTimeout(300);
    if ((await popup.count()) === 0) pass("popup dismisses");
    await mobilePage.reload({ waitUntil: "networkidle" });
    await mobilePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await mobilePage.waitForTimeout(1500);
    if ((await popup.count()) === 0) pass("dismissal is remembered after reload");
    else fail("popup", "reappeared after being dismissed");
  } else {
    fail("popup", "did not appear on mobile within the scroll trigger");
  }

  // Suppressed on the calendar route
  await mobilePage.goto(`${BASE}${TENANT}/compliance-calendar`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1200);
  if ((await popup.count()) === 0) pass("popup suppressed on the compliance calendar");
  else fail("popup", "appeared on the compliance calendar route");

  // Desktop must not show the popup
  await page.goto(`${BASE}${TENANT}`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
  await page.waitForTimeout(1200);
  const desktopPopup = await page
    .locator('[role="dialog"][aria-label="Upcoming compliance deadline"]')
    .count();
  if (desktopPopup === 0) pass("popup does not appear on desktop");
  else fail("popup", "appeared on desktop, which should show only the bar");

  await mobileContext.close();
  await context.close();

  // ───────────────────────────────────── real-estate tenant, all viewports
  await runPublicPass(browser, REALESTATE_TENANT, REALESTATE_PUBLIC_PAGES, "realestate");

  console.log("\n── realestate features ───────────────────────────");
  const reContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const rePage = await reContext.newPage();
  await collectConsoleErrors(rePage);

  // EMI calculator — spot-checked by hand against the standard reducing-balance
  // formula (₹10L @ 9% / 20yr ≈ ₹8,997/month) when the calculator was built.
  await rePage.goto(`${BASE}${REALESTATE_TENANT}/calculators/emi`, { waitUntil: "networkidle" });
  await rePage.fill("#principal", "1000000");
  await rePage.click('button:has-text("Calculate EMI")');
  await rePage.waitForTimeout(300);
  const emiText = await rePage.locator("aside").first().textContent();
  if (emiText?.includes("Monthly EMI")) {
    pass("EMI calculator renders a result");
    await shoot(rePage, "desktop", "re-calc-emi-result");
  } else {
    fail("re-calculator", "EMI result did not render");
  }

  // A property seeded without a RERA number must show the pending state, not
  // hide it — this is the real-estate analogue of the CA ICAI-notice check.
  await rePage.goto(`${BASE}${REALESTATE_TENANT}/properties/canvas-villas-sohna-road`, {
    waitUntil: "networkidle",
  });
  const reraText = await rePage.locator("body").textContent();
  if (reraText?.includes("Registration pending")) {
    pass("property without a RERA number shows the registration-pending state");
  } else {
    fail("rera", "registration-pending state did not render for an unregistered listing");
  }

  // A property seeded with a RERA number must show it as registered.
  await rePage.goto(`${BASE}${REALESTATE_TENANT}/properties/emerald-court-golf-course-road`, {
    waitUntil: "networkidle",
  });
  const reraTextVerified = await rePage.locator("body").textContent();
  if (reraTextVerified?.includes("RERA registered")) {
    pass("property with a RERA number shows the registered state");
  } else {
    fail("rera", "registered state did not render for a listing with a RERA number");
  }

  // Property filters narrow the listing grid. The filter is a client-side
  // router.push (a soft RSC navigation, not a full page load), so waiting on
  // the URL itself is the reliable signal here — "networkidle" can resolve
  // before the new server-rendered list has actually replaced the DOM.
  await rePage.goto(`${BASE}${REALESTATE_TENANT}/properties`, { waitUntil: "networkidle" });
  const beforeCount = await rePage.locator('a[href*="/properties/"]').count();
  await rePage.selectOption('select[aria-label="Purpose"]', "rent");
  await rePage.waitForURL("**purpose=rent**", { timeout: 5000 }).catch(() => {});
  await rePage.waitForTimeout(500);
  const afterCount = await rePage.locator('a[href*="/properties/"]').count();
  if (afterCount > 0 && afterCount < beforeCount) {
    pass(`property filter narrows results (${beforeCount} → ${afterCount})`);
  } else {
    fail("re-filter", `filtering by purpose=rent did not narrow results (${beforeCount} → ${afterCount})`, "warn");
  }

  // Vertical-mismatch guard — a real-estate client under /cafirm/ must 404,
  // and a CA client under /realestate/ must 404.
  const mismatch1 = await rePage.goto(`${BASE}/cafirm/high-properties`, { waitUntil: "networkidle" });
  const mismatch2 = await rePage.goto(`${BASE}/realestate/arora-k-associates`, {
    waitUntil: "networkidle",
  });
  if (mismatch1?.status() === 404 && mismatch2?.status() === 404) {
    pass("vertical-mismatch tenant paths both 404");
  } else {
    fail("tenant-guard", `expected both 404, got ${mismatch1?.status()} and ${mismatch2?.status()}`);
  }

  await reContext.close();
  await browser.close();

  // ───────────────────────────────────────────────────────────── summary
  console.log(`\n${"═".repeat(58)}`);
  console.log(`DRY RUN COMPLETE — ${passes.length} passed, ${issues.length} issue(s)`);
  console.log("═".repeat(58));

  const failures = issues.filter((i) => i.severity === "fail");
  const warnings = issues.filter((i) => i.severity === "warn");

  if (failures.length > 0) {
    console.log(`\nFAILURES (${failures.length})`);
    for (const issue of failures) console.log(`  · ${issue.area}: ${issue.detail}`);
  }
  if (warnings.length > 0) {
    console.log(`\nWARNINGS (${warnings.length})`);
    for (const issue of warnings) console.log(`  · ${issue.area}: ${issue.detail}`);
  }

  console.log(`\nScreenshots in ${SHOTS}`);
  process.exit(failures.length > 0 ? 1 : 0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
