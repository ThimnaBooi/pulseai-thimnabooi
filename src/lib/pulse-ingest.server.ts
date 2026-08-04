/**
 * Server-only news ingestion + AI analysis pipeline for PulseAI.
 *
 * Flow: fetch real articles from GNews -> keep only Western Cape relevant ones
 * -> drop URLs already stored -> analyse with Lovable AI -> persist.
 */
import { detectMunicipality, CATEGORIES } from "./pulse-shared";

const GNEWS_ENDPOINT = "https://gnews.io/api/v4/search";

/** Search queries used against GNews; each is Western Cape scoped. */
const QUERIES = [
  '"Western Cape"',
  '"Cape Town"',
  "Khayelitsha OR Gugulethu OR \"Mitchells Plain\" OR Bellville OR Delft",
  "Stellenbosch OR Franschhoek OR Paarl OR Wellington",
  "Worcester OR Ceres OR Tulbagh OR Robertson OR Montagu",
  "George OR Knysna OR \"Mossel Bay\" OR \"Plettenberg Bay\" OR Oudtshoorn",
  "Hermanus OR Gansbaai OR Grabouw OR Caledon OR Bredasdorp OR Swellendam",
  "Riversdale OR Ladismith OR Calitzdorp OR \"Still Bay\"",
  "Malmesbury OR Vredenburg OR Langebaan OR Saldanha OR Piketberg",
  "Citrusdal OR Clanwilliam OR Vredendal OR Vanrhynsdorp",
  "\"Beaufort West\" OR Laingsburg OR \"Prince Albert\"",
];

export interface RawArticle {
  headline: string;
  article: string;
  source: string;
  author: string | null;
  url: string;
  image_url: string | null;
  published_at: string;
  municipality: string;
}

interface GNewsItem {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
}

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`Upstream ${res.status}`);
      } else {
        return res;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

/** Fetch real Western Cape articles from GNews across all configured queries. */
export async function fetchGNewsArticles(apiKey: string): Promise<RawArticle[]> {
  const byUrl = new Map<string, RawArticle>();

  for (const query of QUERIES) {
    const url =
      `${GNEWS_ENDPOINT}?q=${encodeURIComponent(query)}&lang=en&country=za&max=25&expand=content&sortby=publishedAt&apikey=${apiKey}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.error("GNews request failed", query, res.status, await res.text());
      continue;
    }
    const payload = (await res.json()) as { articles?: GNewsItem[] };
    for (const item of payload.articles ?? []) {
      if (!item.url || !item.title) continue;
      const body = [item.title, item.description, item.content].filter(Boolean).join(" ");
      const municipality = detectMunicipality(body);
      if (!municipality) continue; // ignore anything outside the Western Cape
      byUrl.set(item.url, {
        headline: item.title,
        article: (item.content || item.description || "").slice(0, 4000),
        source: item.source?.name ?? "Unknown",
        author: null,
        url: item.url,
        image_url: item.image ?? null,
        published_at: item.publishedAt ?? new Date().toISOString(),
        municipality,
      });
    }
  }

  return [...byUrl.values()];
}

interface Analysis {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  category: string;
  topic: string;
  summary: string;
  keywords: string[];
}

/** Analyse a batch of articles with Lovable AI, returning one result per input. */
export async function analyseBatch(
  items: RawArticle[],
  apiKey: string,
): Promise<Analysis[]> {
  const prompt = items
    .map(
      (a, i) =>
        `[${i}] HEADLINE: ${a.headline}\nBODY: ${a.article.slice(0, 900) || a.headline}`,
    )
    .join("\n\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-3.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a news sentiment analyst for South African (Western Cape) news. For each numbered article return sentiment (positive|neutral|negative), confidence 0-1, one category from this list: " +
            CATEGORIES.join(", ") +
            ", a short topic label, a one-sentence factual summary, and 5 lowercase keywords (no stop words, no place names). Respond ONLY with JSON of shape {\"results\":[{\"index\":0,\"sentiment\":\"neutral\",\"confidence\":0.9,\"category\":\"Politics\",\"topic\":\"...\",\"summary\":\"...\",\"keywords\":[\"...\"]}]}",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as {
    results?: (Partial<Analysis> & { index?: number })[];
  };

  return items.map((item, i) => {
    const r = parsed.results?.find((x) => x.index === i) ?? parsed.results?.[i];
    const sentiment = r?.sentiment;
    return {
      sentiment:
        sentiment === "positive" || sentiment === "negative" ? sentiment : "neutral",
      confidence: Math.max(0, Math.min(1, Number(r?.confidence ?? 0.5))),
      category:
        r?.category && (CATEGORIES as readonly string[]).includes(r.category)
          ? r.category
          : "Other",
      topic: r?.topic ?? "General",
      summary: r?.summary ?? item.headline,
      keywords: Array.isArray(r?.keywords) ? r!.keywords!.slice(0, 8) : [],
    };
  });
}

export interface IngestResult {
  fetched: number;
  inserted: number;
  skipped: number;
}

/** Run the full collection + analysis pipeline and persist new articles. */
export async function ingestNews(): Promise<IngestResult> {
  const gnewsKey = process.env.GNEWS_API_KEY;
  const aiKey = process.env.LOVABLE_API_KEY;
  if (!gnewsKey) throw new Error("Missing GNEWS_API_KEY");
  if (!aiKey) throw new Error("Missing LOVABLE_API_KEY");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: run } = await supabaseAdmin
    .from("ingestion_runs")
    .insert({ status: "running" })
    .select("id")
    .single();
  const runId = run?.id as string | undefined;

  try {
    const fetched = await fetchGNewsArticles(gnewsKey);

    const { data: existing } = await supabaseAdmin
      .from("articles")
      .select("url")
      .in(
        "url",
        fetched.map((a) => a.url),
      );
    const seen = new Set((existing ?? []).map((r) => r.url));
    const fresh = fetched.filter((a) => !seen.has(a.url));

    let inserted = 0;
    for (let i = 0; i < fresh.length; i += 6) {
      const batch = fresh.slice(i, i + 6);
      const analyses = await analyseBatch(batch, aiKey);
      const rows = batch.map((a, idx) => ({
        headline: a.headline,
        article: a.article,
        summary: analyses[idx].summary,
        source: a.source,
        author: a.author,
        category: analyses[idx].category,
        municipality: a.municipality,
        url: a.url,
        image_url: a.image_url,
        published_at: a.published_at,
        sentiment: analyses[idx].sentiment,
        confidence: analyses[idx].confidence,
        keywords: analyses[idx].keywords,
        topic: analyses[idx].topic,
      }));
      const { error, count } = await supabaseAdmin
        .from("articles")
        .upsert(rows, { onConflict: "url", ignoreDuplicates: true, count: "exact" });
      if (error) throw error;
      inserted += count ?? rows.length;
    }

    if (runId) {
      await supabaseAdmin
        .from("ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          fetched_count: fetched.length,
          inserted_count: inserted,
          status: "success",
        })
        .eq("id", runId);
    }

    return { fetched: fetched.length, inserted, skipped: fetched.length - fresh.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (runId) {
      await supabaseAdmin
        .from("ingestion_runs")
        .update({
          finished_at: new Date().toISOString(),
          status: "error",
          error: message.slice(0, 500),
        })
        .eq("id", runId);
    }
    throw error;
  }
}
