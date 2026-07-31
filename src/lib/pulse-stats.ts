/**
 * Pure derivations from the article set: distributions, trends, breakdowns,
 * trending keywords and natural-language insights.
 */
import { countKeywords, pct, sentimentScore, type Article } from "./pulse-shared";

export type RangeKey = "7" | "30" | "60";

export function filterByRange(articles: Article[], range: RangeKey): Article[] {
  const cutoff = Date.now() - Number(range) * 86_400_000;
  return articles.filter((a) => new Date(a.published_at).getTime() >= cutoff);
}

export interface Totals {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  avgConfidence: number;
}

export function computeTotals(articles: Article[]): Totals {
  const positive = articles.filter((a) => a.sentiment === "positive").length;
  const negative = articles.filter((a) => a.sentiment === "negative").length;
  const neutral = articles.length - positive - negative;
  const avgConfidence =
    articles.length === 0
      ? 0
      : articles.reduce((sum, a) => sum + Number(a.confidence), 0) / articles.length;
  return {
    total: articles.length,
    positive,
    neutral,
    negative,
    positivePct: pct(positive, articles.length),
    neutralPct: pct(neutral, articles.length),
    negativePct: pct(negative, articles.length),
    avgConfidence,
  };
}

export interface TrendPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export function computeTrend(articles: Article[]): TrendPoint[] {
  const byDay = new Map<string, TrendPoint>();
  for (const a of articles) {
    const date = a.published_at.slice(0, 10);
    const point = byDay.get(date) ?? { date, positive: 0, neutral: 0, negative: 0 };
    if (a.sentiment === "positive") point.positive += 1;
    else if (a.sentiment === "negative") point.negative += 1;
    else point.neutral += 1;
    byDay.set(date, point);
  }
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export interface GroupRow {
  name: string;
  total: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  avgSentiment: number;
  avgConfidence: number;
  topTopic: string;
}

function mostCommon(values: (string | null)[]): string {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}

export function groupBy(articles: Article[], key: "municipality" | "category"): GroupRow[] {
  const groups = new Map<string, Article[]>();
  for (const a of articles) {
    const name = a[key] || "Other";
    groups.set(name, [...(groups.get(name) ?? []), a]);
  }
  return [...groups.entries()]
    .map(([name, items]) => {
      const totals = computeTotals(items);
      return {
        name,
        total: items.length,
        positivePct: totals.positivePct,
        neutralPct: totals.neutralPct,
        negativePct: totals.negativePct,
        avgSentiment:
          items.reduce((sum, a) => sum + sentimentScore(a.sentiment), 0) / items.length,
        avgConfidence: totals.avgConfidence,
        topTopic: mostCommon(items.map((a) => a.topic)),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export interface TrendingTopic {
  word: string;
  count: number;
  direction: "up" | "down" | "flat";
}

/** Trending keywords: current-week frequency compared with the previous week. */
export function computeTrending(articles: Article[], limit = 10): TrendingTopic[] {
  const now = Date.now();
  const recent = articles.filter(
    (a) => now - new Date(a.published_at).getTime() <= 7 * 86_400_000,
  );
  const previous = articles.filter((a) => {
    const age = now - new Date(a.published_at).getTime();
    return age > 7 * 86_400_000 && age <= 14 * 86_400_000;
  });

  const prevCounts = new Map(countKeywords(previous).map((k) => [k.word, k.count]));
  const source = recent.length > 0 ? recent : articles;

  return countKeywords(source)
    .slice(0, limit)
    .map(({ word, count }) => {
      const before = prevCounts.get(word) ?? 0;
      return {
        word,
        count,
        direction: count > before ? "up" : count < before ? "down" : "flat",
      } as TrendingTopic;
    });
}

export function topStories(articles: Article[], sentiment: "positive" | "negative") {
  return articles
    .filter((a) => a.sentiment === sentiment)
    .sort((a, b) => Number(b.confidence) - Number(a.confidence))
    .slice(0, 5);
}

/** Generate plain-language insights that update whenever the data changes. */
export function generateInsights(articles: Article[]): string[] {
  if (articles.length === 0) return [];
  const totals = computeTotals(articles);
  const insights: string[] = [];

  const mood =
    totals.positivePct >= totals.negativePct && totals.positivePct >= totals.neutralPct
      ? "predominantly positive"
      : totals.negativePct >= totals.neutralPct
        ? "predominantly negative"
        : "largely neutral";
  insights.push(`Coverage in this period is ${mood} across ${totals.total} articles.`);

  const categories = groupBy(articles, "category");
  const worstCategory = [...categories]
    .filter((c) => c.total >= 2)
    .sort((a, b) => b.negativePct - a.negativePct)[0];
  if (worstCategory) {
    insights.push(
      `${worstCategory.name} is the leading contributor to negative sentiment (${worstCategory.negativePct}% negative).`,
    );
  }

  const municipalities = groupBy(articles, "municipality");
  const mostPositiveArea = [...municipalities]
    .filter((m) => m.total >= 2)
    .sort((a, b) => b.positivePct - a.positivePct)[0];
  if (mostPositiveArea) {
    insights.push(
      `${mostPositiveArea.name} recorded the highest positive sentiment (${mostPositiveArea.positivePct}%).`,
    );
  }

  const busiest = municipalities[0];
  if (busiest) {
    insights.push(`${busiest.name} generated the most coverage with ${busiest.total} articles.`);
  }

  const topCategory = categories[0];
  if (topCategory) {
    insights.push(`${topCategory.name} remains the most discussed topic.`);
  }

  insights.push(
    `Average model confidence across analysed articles is ${Math.round(totals.avgConfidence * 100)}%.`,
  );

  return insights;
}
