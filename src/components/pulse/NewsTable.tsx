import { useMemo, useState } from "react";
import { Download, ExternalLink, FileJson, FileSpreadsheet, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import type { Article } from "@/lib/pulse-shared";
import { filterByRange, type RangeKey } from "@/lib/pulse-stats";
import { exportCsv, exportJson, exportPdf } from "@/lib/pulse-export";
import { SectionCard } from "./Panels";

const PAGE_SIZE = 12;

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

const today = new Date().toISOString().slice(0, 10);

const selectClass =
  "rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-ring";

const exportButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40";

/** Searchable, filterable, paginated table of analysed articles. */
export function NewsTable({ articles, range }: { articles: Article[]; range: RangeKey }) {
  const [query, setQuery] = useState("");
  const [sentiment, setSentiment] = useState("all");
  const [municipality, setMunicipality] = useState("all");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [exporting, setExporting] = useState(false);

  const options = useMemo(
    () => ({
      municipalities: unique(articles.map((a) => a.municipality)),
      categories: unique(articles.map((a) => a.category)),
      sources: unique(articles.map((a) => a.source)),
    }),
    [articles],
  );

  const dateFiltered = useMemo(() => {
    // Strict date mode: when any date is picked, only articles published within
    // that exact day (or from–to span) are shown and the range buttons are ignored.
    if (!from && !to) return filterByRange(articles, range);
    const start = (from || to).slice(0, 10);
    const end = (to || from).slice(0, 10);
    const lo = start <= end ? start : end;
    const hi = start <= end ? end : start;
    return articles.filter((a) => {
      const day = a.published_at.slice(0, 10);
      return day >= lo && day <= hi;
    });
  }, [articles, range, from, to]);


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dateFiltered.filter((a) => {
      if (sentiment !== "all" && a.sentiment !== sentiment) return false;
      if (municipality !== "all" && a.municipality !== municipality) return false;
      if (category !== "all" && a.category !== category) return false;
      if (source !== "all" && a.source !== source) return false;
      if (!q) return true;
      return [
        a.headline,
        a.municipality,
        a.category,
        a.source,
        a.topic ?? "",
        (a.keywords ?? []).join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [dateFiltered, query, sentiment, municipality, category, source]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  function update<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(0);
    };
  }

  const dateLabel = from || to ? (from && to && from !== to ? `${from} to ${to}` : from || to) : null;
  const scopeLabel = dateLabel ? `Published ${dateLabel}` : `Last ${range} days`;
  const fileBase = `pulseai-news-${dateLabel ? dateLabel.replace(/ to /, "_") : `last-${range}-days`}`;

  async function handleExport(kind: "pdf" | "csv" | "json") {
    if (filtered.length === 0) {
      toast.error("No articles to export for the selected filters.");
      return;
    }
    try {
      setExporting(true);
      if (kind === "csv") exportCsv(filtered, fileBase);
      else if (kind === "json") exportJson(filtered, fileBase);
      else await exportPdf(filtered, fileBase, scopeLabel);
      toast.success(`Report exported as ${kind.toUpperCase()}.`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <SectionCard
      title="News Table"
      description={`${filtered.length} article${filtered.length === 1 ? "" : "s"} match your filters — ${scopeLabel}.`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Download className="h-4 w-4" /> Download report:
        </span>
        <button type="button" disabled={exporting} onClick={() => handleExport("pdf")} className={exportButtonClass}>
          <FileText className="h-4 w-4" /> PDF
        </button>
        <button type="button" disabled={exporting} onClick={() => handleExport("csv")} className={exportButtonClass}>
          <FileSpreadsheet className="h-4 w-4" /> CSV / Excel
        </button>
        <button type="button" disabled={exporting} onClick={() => handleExport("json")} className={exportButtonClass}>
          <FileJson className="h-4 w-4" /> JSON
        </button>
      </div>


      <div className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => update(setQuery)(e.target.value)}
            placeholder="Search headline, keyword, municipality, category or source"
            aria-label="Search articles"
            className={`${selectClass} w-full pl-9`}
          />
        </label>
        <select
          aria-label="Filter by sentiment"
          className={selectClass}
          value={sentiment}
          onChange={(e) => update(setSentiment)(e.target.value)}
        >
          <option value="all">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select
          aria-label="Filter by municipality"
          className={selectClass}
          value={municipality}
          onChange={(e) => update(setMunicipality)(e.target.value)}
        >
          <option value="all">All municipalities</option>
          {options.municipalities.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by category"
          className={selectClass}
          value={category}
          onChange={(e) => update(setCategory)(e.target.value)}
        >
          <option value="all">All categories</option>
          {options.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by source"
          className={selectClass}
          value={source}
          onChange={(e) => update(setSource)(e.target.value)}
        >
          <option value="all">All sources</option>
          {options.sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="From date"
          max={to || today}
          className={selectClass}
          value={from}
          onChange={(e) => update(setFrom)(e.target.value)}
        />
        <input
          type="date"
          aria-label="To date"
          min={from || undefined}
          max={today}
          className={selectClass}
          value={to}
          onChange={(e) => update(setTo)(e.target.value)}
        />
        {from || to ? (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
              setPage(0);
            }}
            className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
          >
            Clear dates
          </button>
        ) : null}
      </div>


      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Headline</th>
              <th className="pb-2 pr-3 font-medium">Source</th>
              <th className="pb-2 pr-3 font-medium">Municipality</th>
              <th className="pb-2 pr-3 font-medium">Category</th>
              <th className="pb-2 pr-3 font-medium">Published</th>
              <th className="pb-2 pr-3 font-medium">Sentiment</th>
              <th className="pb-2 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="border-t border-border/70 align-top">
                <td className="max-w-sm py-2.5 pr-3">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-start gap-1.5 font-medium hover:text-accent"
                  >
                    {a.headline}
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                  </a>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">{a.source}</td>
                <td className="py-2.5 pr-3">{a.municipality}</td>
                <td className="py-2.5 pr-3">{a.category}</td>
                <td className="py-2.5 pr-3 text-muted-foreground">
                  {a.published_at.slice(0, 10)}
                </td>
                <td className="py-2.5 pr-3">
                  <span
                    className={
                      a.sentiment === "positive"
                        ? "text-positive"
                        : a.sentiment === "negative"
                          ? "text-negative"
                          : "text-muted-foreground"
                    }
                  >
                    {a.sentiment === "positive" ? "😊" : a.sentiment === "negative" ? "☹️" : "😐"}{" "}
                    {a.sentiment}
                  </span>
                </td>
                <td className="py-2.5">{Math.round(Number(a.confidence) * 100)}%</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                  No articles match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {current + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(pageCount - 1, current + 1))}
            disabled={current >= pageCount - 1}
            className="rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
