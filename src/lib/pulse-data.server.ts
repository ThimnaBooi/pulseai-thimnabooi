/**
 * Server-only read layer for the PulseAI dashboard.
 * Uses the publishable key (public, read-only news data behind anon SELECT policies).
 */
import { createClient } from "@supabase/supabase-js";
import type { Article, IngestionRun } from "./pulse-shared";

export interface DashboardData {
  articles: Article[];
  lastRun: IngestionRun | null;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createClient(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const [{ data: articles, error }, { data: runs }] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, headline, article, summary, source, author, category, municipality, url, image_url, published_at, sentiment, confidence, keywords, topic",
      )
      .order("published_at", { ascending: false })
      .limit(1000),
    supabase
      .from("ingestion_runs")
      .select("started_at, finished_at, fetched_count, inserted_count, status, error")
      .eq("status", "success")
      .order("started_at", { ascending: false })
      .limit(1),
  ]);

  if (error) {
    console.error("Failed to load articles", error);
    return { articles: [], lastRun: null };
  }

  return {
    articles: (articles ?? []) as Article[],
    lastRun: (runs?.[0] as IngestionRun | undefined) ?? null,
  };
}
