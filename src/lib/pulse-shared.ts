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
  "Stellenbosch",
  "Paarl",
  "Wellington",
  "Franschhoek",
  "Worcester",
  "Ceres",
  "Tulbagh",
  "Robertson",
  "Montagu",
  "Ashton",
  "Bonnievale",
  "Swellendam",
  "Caledon",
  "Grabouw",
  "Hermanus",
  "Gansbaai",
  "Bredasdorp",
  "Napier",
  "Struisbaai",
  "Riversdale",
  "Heidelberg",
  "Still Bay",
  "Mossel Bay",
  "George",
  "Oudtshoorn",
  "De Rust",
  "Calitzdorp",
  "Ladismith",
  "Knysna",
  "Sedgefield",
  "Plettenberg Bay",
  "Bitou",
  "Beaufort West",
  "Laingsburg",
  "Prince Albert",
  "Malmesbury",
  "Darling",
  "Moorreesburg",
  "Saldanha Bay",
  "Vredenburg",
  "Langebaan",
  "St Helena Bay",
  "Piketberg",
  "Velddrif",
  "Citrusdal",
  "Clanwilliam",
  "Vredendal",
  "Vanrhynsdorp",
  "Lutzville",
  "Doringbaai",
  "Somerset West",
  "Khayelitsha",
  "Gugulethu",
  "Mitchells Plain",
  "Bellville",
  "Cape Agulhas",
  "Hessequa",
  "Kannaland",
  "Witzenberg",
  "Langeberg",
  "Theewaterskloof",
  "Overstrand",
  "Drakenstein",
  "Breede Valley",
  "Bergrivier",
  "Swartland",
  "Cederberg",
  "Matzikama",
  "Prince Albert",
] as const;

/** Sub-places and towns that roll up into a parent municipality for reporting. */
export const PLACE_TO_MUNICIPALITY: Record<string, string> = {
  // City of Cape Town
  "cape town": "City of Cape Town",
  "city of cape town": "City of Cape Town",
  khayelitsha: "City of Cape Town",
  gugulethu: "City of Cape Town",
  "mitchells plain": "City of Cape Town",
  "mitchell's plain": "City of Cape Town",
  langa: "City of Cape Town",
  nyanga: "City of Cape Town",
  delft: "City of Cape Town",
  bellville: "City of Cape Town",
  "somerset west": "City of Cape Town",
  goodwood: "City of Cape Town",
  "sea point": "City of Cape Town",
  "green point": "City of Cape Town",
  observatory: "City of Cape Town",
  woodstock: "City of Cape Town",
  claremont: "City of Cape Town",
  wynberg: "City of Cape Town",
  athlone: "City of Cape Town",
  "hout bay": "City of Cape Town",
  "simon's town": "City of Cape Town",
  simonstown: "City of Cape Town",
  muizenberg: "City of Cape Town",
  "kraaifontein": "City of Cape Town",
  brackenfell: "City of Cape Town",
  durbanville: "City of Cape Town",
  parow: "City of Cape Town",
  milnerton: "City of Cape Town",
  "table view": "City of Cape Town",
  atlantis: "City of Cape Town",
  "philippi": "City of Cape Town",
  "strand": "City of Cape Town",
  gordonsbay: "City of Cape Town",
  "gordon's bay": "City of Cape Town",
  "cape flats": "City of Cape Town",

  // Cape Winelands district
  stellenbosch: "Stellenbosch",
  franschhoek: "Stellenbosch",
  "kayamandi": "Stellenbosch",
  paarl: "Drakenstein (Paarl)",
  wellington: "Drakenstein (Paarl)",
  drakenstein: "Drakenstein (Paarl)",
  worcester: "Breede Valley (Worcester)",
  "breede valley": "Breede Valley (Worcester)",
  "de doorns": "Breede Valley (Worcester)",
  rawsonville: "Breede Valley (Worcester)",
  ceres: "Witzenberg (Ceres)",
  witzenberg: "Witzenberg (Ceres)",
  tulbagh: "Witzenberg (Ceres)",
  wolseley: "Witzenberg (Ceres)",
  "op-die-berg": "Witzenberg (Ceres)",
  robertson: "Langeberg (Robertson)",
  langeberg: "Langeberg (Robertson)",
  montagu: "Langeberg (Robertson)",
  ashton: "Langeberg (Robertson)",
  bonnievale: "Langeberg (Robertson)",
  mcgregor: "Langeberg (Robertson)",

  // Overberg district
  hermanus: "Overstrand (Hermanus)",
  overstrand: "Overstrand (Hermanus)",
  gansbaai: "Overstrand (Hermanus)",
  stanford: "Overstrand (Hermanus)",
  kleinmond: "Overstrand (Hermanus)",
  "betty's bay": "Overstrand (Hermanus)",
  caledon: "Theewaterskloof (Caledon)",
  theewaterskloof: "Theewaterskloof (Caledon)",
  grabouw: "Theewaterskloof (Caledon)",
  villiersdorp: "Theewaterskloof (Caledon)",
  greyton: "Theewaterskloof (Caledon)",
  riviersonderend: "Theewaterskloof (Caledon)",
  bredasdorp: "Cape Agulhas (Bredasdorp)",
  "cape agulhas": "Cape Agulhas (Bredasdorp)",
  napier: "Cape Agulhas (Bredasdorp)",
  struisbaai: "Cape Agulhas (Bredasdorp)",
  "l'agulhas": "Cape Agulhas (Bredasdorp)",
  arniston: "Cape Agulhas (Bredasdorp)",
  swellendam: "Swellendam",
  barrydale: "Swellendam",
  suurbraak: "Swellendam",

  // Garden Route district
  george: "George",
  wilderness: "George",
  "uniondale": "George",
  "mossel bay": "Mossel Bay",
  hartenbos: "Mossel Bay",
  knysna: "Knysna",
  sedgefield: "Knysna",
  "plettenberg bay": "Bitou (Plettenberg Bay)",
  bitou: "Bitou (Plettenberg Bay)",
  "nature's valley": "Bitou (Plettenberg Bay)",
  kurland: "Bitou (Plettenberg Bay)",
  oudtshoorn: "Oudtshoorn",
  "de rust": "Oudtshoorn",
  dysselsdorp: "Oudtshoorn",
  riversdale: "Hessequa (Riversdale)",
  hessequa: "Hessequa (Riversdale)",
  "still bay": "Hessequa (Riversdale)",
  stilbaai: "Hessequa (Riversdale)",
  heidelberg: "Hessequa (Riversdale)",
  albertinia: "Hessequa (Riversdale)",
  ladismith: "Kannaland (Ladismith)",
  kannaland: "Kannaland (Ladismith)",
  calitzdorp: "Kannaland (Ladismith)",
  zoar: "Kannaland (Ladismith)",

  // Central Karoo district
  "beaufort west": "Beaufort West",
  laingsburg: "Laingsburg",
  "prince albert": "Prince Albert",
  leeu-gamka: "Prince Albert",
  merweville: "Beaufort West",

  // West Coast district
  malmesbury: "Swartland (Malmesbury)",
  swartland: "Swartland (Malmesbury)",
  darling: "Swartland (Malmesbury)",
  moorreesburg: "Swartland (Malmesbury)",
  riebeek: "Swartland (Malmesbury)",
  "saldanha bay": "Saldanha Bay",
  saldanha: "Saldanha Bay",
  vredenburg: "Saldanha Bay",
  langebaan: "Saldanha Bay",
  "st helena bay": "Saldanha Bay",
  paternoster: "Saldanha Bay",
  piketberg: "Bergrivier (Piketberg)",
  bergrivier: "Bergrivier (Piketberg)",
  velddrif: "Bergrivier (Piketberg)",
  velddrift: "Bergrivier (Piketberg)",
  porterville: "Bergrivier (Piketberg)",
  aurora: "Bergrivier (Piketberg)",
  clanwilliam: "Cederberg (Clanwilliam)",
  cederberg: "Cederberg (Clanwilliam)",
  citrusdal: "Cederberg (Clanwilliam)",
  lambertsbaai: "Cederberg (Clanwilliam)",
  "lamberts bay": "Cederberg (Clanwilliam)",
  vredendal: "Matzikama (Vredendal)",
  matzikama: "Matzikama (Vredendal)",
  vanrhynsdorp: "Matzikama (Vredendal)",
  lutzville: "Matzikama (Vredendal)",
  klawer: "Matzikama (Vredendal)",
  doringbaai: "Matzikama (Vredendal)",

  // Fallback
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

/**
 * Place names sorted longest-first so specific towns win over broader names
 * (e.g. "cape agulhas" is matched before "cape town" style partial overlaps).
 */
const SORTED_PLACES: [string, string][] = Object.entries(PLACE_TO_MUNICIPALITY)
  .filter(([place]) => place !== "western cape")
  .sort((a, b) => b[0].length - a[0].length);

/** Detect which Western Cape municipality an article refers to, or null if none. */
export function detectMunicipality(text: string): string | null {
  const haystack = text.toLowerCase();
  for (const [place, municipality] of SORTED_PLACES) {
    const pattern = new RegExp(`\\b${place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
    if (pattern.test(haystack)) return municipality;
  }
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
