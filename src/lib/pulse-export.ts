/** Client-side export helpers for the PulseAI news table (CSV / JSON / PDF). */
import type { Article } from "./pulse-shared";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

const COLUMNS = [
  "headline",
  "source",
  "municipality",
  "category",
  "published_at",
  "sentiment",
  "confidence",
  "topic",
  "keywords",
  "summary",
  "url",
] as const;

function cell(article: Article, key: (typeof COLUMNS)[number]): string {
  if (key === "keywords") return (article.keywords ?? []).join("; ");
  if (key === "confidence") return `${Math.round(Number(article.confidence) * 100)}%`;
  if (key === "published_at") return article.published_at.slice(0, 10);
  return String(article[key] ?? "");
}

export function exportCsv(articles: Article[], filename: string) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    COLUMNS.join(","),
    ...articles.map((a) => COLUMNS.map((key) => escape(cell(a, key))).join(",")),
  ];
  download(new Blob([`\uFEFF${rows.join("\n")}`], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

export function exportJson(articles: Article[], filename: string) {
  download(
    new Blob([JSON.stringify(articles, null, 2)], { type: "application/json" }),
    `${filename}.json`,
  );
}

export async function exportPdf(articles: Article[], filename: string, subtitle: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(18);
  doc.text("PulseAI — Western Cape News Report", 40, 40);
  doc.setFontSize(10);
  doc.text(subtitle, 40, 58);
  doc.text(`Generated ${new Date().toLocaleString("en-ZA")}`, 40, 72);

  const positive = articles.filter((a) => a.sentiment === "positive").length;
  const negative = articles.filter((a) => a.sentiment === "negative").length;
  const neutral = articles.length - positive - negative;
  doc.text(
    `Articles: ${articles.length}  |  Positive: ${positive}  |  Neutral: ${neutral}  |  Negative: ${negative}`,
    40,
    86,
  );

  autoTable(doc, {
    startY: 100,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [122, 78, 47], textColor: 255 },
    head: [["Headline", "Source", "Municipality", "Category", "Published", "Sentiment", "Conf."]],
    body: articles.map((a) => [
      a.headline,
      a.source,
      a.municipality,
      a.category,
      a.published_at.slice(0, 10),
      a.sentiment,
      `${Math.round(Number(a.confidence) * 100)}%`,
    ]),
    columnStyles: { 0: { cellWidth: 300 } },
  });

  doc.save(`${filename}.pdf`);
}
