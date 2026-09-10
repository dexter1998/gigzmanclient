import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantBySlug } from "@/lib/tenant";
import { buildSiteIndex } from "@/lib/ai/site-index";

/**
 * The site assistant.
 *
 * Server-only, and it has to be: `GEMINI_API_KEY` is a billable credential.
 * Anything prefixed `NEXT_PUBLIC_` is compiled into the page, so the key is
 * read here and never sent to the browser.
 *
 * Grounding is the other half. The model is given the tenant's own pages and
 * inventory and told to answer from that alone — a property assistant that
 * invents a price or a project is worse than no assistant, because it is
 * wrong in the client's name.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * `gemini-2.5-flash` still appears in the models list but its generateContent
 * endpoint answers 404 for keys created since it was retired: "no longer
 * available to new users". Listing a model is not the same as being able to
 * call it — verify against generateContent before changing this.
 */
const MODEL = "gemini-3.6-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

/**
 * Per-IP throttle, in memory.
 *
 * A public endpoint spending someone else's Gemini quota needs a ceiling.
 * In-memory means it resets on a cold start and is per-instance rather than
 * global — enough to stop a browser tab hammering it, not enough to stop a
 * determined attacker. If this endpoint is ever abused, the fix is a real
 * store, not a bigger number here.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const SYSTEM = `You are the assistant on a real-estate firm's own website.

Rules, in order of importance:
1. Answer ONLY from the SITE CONTEXT below. It is the firm's live data.
2. Never invent a price, a project name, an availability or a legal fact. If
   the context does not answer the question, say so plainly and point at the
   page or the phone number where a person can.
3. Always end with the most relevant page path from the context, written as a
   markdown link, e.g. [See all plots](/properties?type=plot). Use paths
   exactly as they appear in the context — do not construct new ones.
4. Prices in the context are asking prices from listings and corridor
   averages. Say that when you quote one. Never present one as a valuation.
5. Be brief: two or three short paragraphs at most. Indian English. Do not
   greet, do not describe yourself, do not apologise.`;

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "The assistant is not configured." }, { status: 503 });
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions in a row. Give it a minute." },
      { status: 429 },
    );
  }

  let body: { question?: string; tenant?: string; mode?: string; page?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const question = (body.question ?? "").trim().slice(0, 500);
  const tenantSlug = (body.tenant ?? "").trim();
  if (!question || !tenantSlug) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const tenant = await getTenantBySlug(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "Unknown site." }, { status: 404 });

  const index = await buildSiteIndex(tenant);
  if (!index) return NextResponse.json({ error: "Unknown site." }, { status: 404 });

  const prompt =
    body.mode === "summarize"
      ? `Summarise what this page offers for someone deciding whether to read it, in three sentences. Page: ${body.page ?? "/"}\n\nQuestion context: ${question}`
      : question;

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\n\n=== SITE CONTEXT ===\n${index.context}` }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
      // Vercel's function timeout is shorter than Gemini's patience.
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("gemini call failed", res.status, detail.slice(0, 300));
      return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 502 });
    }

    const data = await res.json();
    const answer: string =
      data?.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? "").join("") ?? "";

    if (!answer.trim()) {
      // A greeting or a one-word question produces nothing: the prompt tells
      // the model not to greet and not to pad. That is the model behaving,
      // not the server failing, so it answers rather than erroring.
      return NextResponse.json({
        answer:
          "Ask me something specific about this site — a locality, a budget, a property type, or the paperwork for a purchase — and I will answer from the firm's own listings and pages.",
        firmName: index.firmName,
      });
    }

    return NextResponse.json({ answer: answer.trim(), firmName: index.firmName });
  } catch (error) {
    console.error("gemini call errored", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 502 });
  }
}
