/**
 * Shared, client-safe constants and pure helpers for PulseAI.
 * Imported by both the browser dashboard and server-side ingestion code.
 */

export type Sentiment = "positive" | "neutral" | "negative";

export interface Article {
  id: string;
  headline: string;
  article: string;
  summary: string | null;
  source: string;
  author: string | null;
  category: string;
  municipality: string;
  url: string;
  image_url: string | null;
  published_at: string;
  sentiment: string;
  confidence: number;
  keywords: string[];
  topic: string | null;
}

export interface IngestionRun {
  started_at: string;
  finished_at: string | null;
  fetched_count: number;
  inserted_count: number;
  status: string;
  error: string | null;
}

/** Western Cape places used both to filter incoming news and to tag municipality. */
export const WESTERN_CAPE_PLACES = [
  "Western Cape",
  "Cape Town",
  "Gugulethu",
  "Khayelitsha",
  "Mitchells Plain",
  "Bellville",
  "Stellenbosch",
  "Paarl",
  "George",
  "Worcester",
  "Knysna",
  "Mossel Bay",
  "Hermanus",
  "Somerset West",
  "Saldanha Bay",
  "Beaufort West",
] as const;

/** Sub-places that roll up into a parent municipality for reporting. */
export const PLACE_TO_MUNICIPALITY: Record<string, string> = {
  "cape town": "Cape Town",
  gugulethu: "Cape Town",
  khayelitsha: "Cape Town",
  "mitchells plain": "Cape Town",
  bellville: "Cape Town",
  "somerset west": "Cape Town",
  stellenbosch: "Stellenbosch",
  paarl: "Drakenstein (Paarl)",
  george: "George",
  worcester: "Breede Valley (Worcester)",
  knysna: "Knysna",
  "mossel bay": "Mossel Bay",
  hermanus: "Overstrand (Hermanus)",
  "saldanha bay": "Saldanha Bay",
  "beaufort west": "Beaufort West",
  "western cape": "Western Cape",
};

export const CATEGORIES = [
  "Politics",
  "Crime",
  "Economy",
  "Business",
  "Energy",
  "Health",
  "Education",
  "Technology",
  "Tourism",
  "Sports",
  "Entertainment",
  "Environment",
  "Transport",
  "Community",
  "Other",
] as const;

export const STOP_WORDS = new Set(
  `a about after all also an and any are as at be because been before being between both but by can could did do does for from had has have he her here his how i if in into is it its just like made make may me more most my no not of on once only or other our out over own said same she should since so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who why will with would you your western cape south africa`.split(
    /\s+/,
  ),
);

/** Detect which Western Cape municipality an article refers to, or null if none. */
export function detectMunicipality(text: string): string | null {
  const haystack = text.toLowerCase();
  let match: string | null = null;
  for (const [place, municipality] of Object.entries(PLACE_TO_MUNICIPALITY)) {
    if (place === "western cape") continue;
    if (haystack.includes(place)) {
      match = municipality;
      break;
    }
  }
  if (match) return match;
  return haystack.includes("western cape") ? "Western Cape" : null;
}

export function sentimentScore(sentiment: string): number {
  if (sentiment === "positive") return 1;
  if (sentiment === "negative") return -1;
  return 0;
}

export function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

/** Frequency-count keywords across a set of articles, ignoring stop words. */
export function countKeywords(articles: Article[]): { word: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of articles) {
    for (const raw of a.keywords ?? []) {
      const word = raw.trim().toLowerCase();
      if (!word || word.length < 3 || STOP_WORDS.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}
