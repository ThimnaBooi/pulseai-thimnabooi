import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { getDashboardData, refreshNews } from "@/lib/pulse.functions";
import {
  computeTotals,
  computeTrend,
  computeTrending,
  filterByRange,
  generateInsights,
  groupBy,
  topStories,
  type RangeKey,
} from "@/lib/pulse-stats";
import { SentimentBar, SentimentPie, TrendChart } from "@/components/pulse/Charts";
import {
  GroupTable,
  InsightsPanel,
  SectionCard,
  StatCards,
  StoryCards,
  TrendingTopics,
} from "@/components/pulse/Panels";
import { NewsTable } from "@/components/pulse/NewsTable";
import { ThemeToggle } from "@/components/pulse/ThemeToggle";

const dashboardQuery = {
  queryKey: ["pulse-dashboard"],
  queryFn: () => getDashboardData(),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulseAI — Western Cape News Sentiment Intelligence" },
      {
        name: "description",
        content:
          "AI-powered sentiment intelligence for Western Cape news: live sentiment analysis, municipality insights, trends and trending topics.",
      },
      { property: "og:title", content: "PulseAI — Western Cape News Sentiment Intelligence" },
      {
        property: "og:description",
        content:
          "AI-powered sentiment intelligence for Western Cape news: live sentiment analysis, municipality insights, trends and trending topics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(dashboardQuery);
  },
  component: Dashboard,
});

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7", label: "Last 7 days" },
  { key: "30", label: "Last 30 days" },
  { key: "60", label: "Last 60 days" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function Dashboard() {
  const { data, isLoading } = useQuery(dashboardQuery);
  const queryClient = useQueryClient();
  const runRefresh = useServerFn(refreshNews);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<RangeKey>("30");

  const articles = data?.articles ?? [];
  const scoped = useMemo(() => filterByRange(articles, range), [articles, range]);

  const totals = useMemo(() => computeTotals(scoped), [scoped]);
  const trend = useMemo(() => computeTrend(scoped), [scoped]);
  const insights = useMemo(() => generateInsights(scoped), [scoped]);
  const trending = useMemo(() => computeTrending(articles), [articles]);
  const municipalities = useMemo(() => groupBy(scoped, "municipality"), [scoped]);
  const categories = useMemo(() => groupBy(scoped, "category"), [scoped]);
  const positiveStories = useMemo(() => topStories(scoped, "positive"), [scoped]);
  const negativeStories = useMemo(() => topStories(scoped, "negative"), [scoped]);

  const lastUpdated = data?.lastRun?.finished_at ?? data?.lastRun?.started_at ?? null;

  async function handleRefresh() {
    setRefreshing(true);
    toast.loading("Collecting the latest Western Cape news…", { id: "refresh" });
    try {
      const result = await runRefresh({});
      if (result.ok) {
        toast.success(`${result.inserted} new article(s) analysed.`, { id: "refresh" });
        await queryClient.invalidateQueries({ queryKey: ["pulse-dashboard"] });
      } else {
        toast.error(result.error, { id: "refresh" });
      }
    } catch {
      toast.error("Could not refresh news right now.", { id: "refresh" });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="fade-up mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-accent md:text-5xl">PulseAI</h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            AI-powered sentiment intelligence for Western Cape news.
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <div className="flex gap-1.5">
              <dt>Today:</dt>
              <dd>{new Date().toLocaleDateString("en-ZA", { dateStyle: "medium" })}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Last updated:</dt>
              <dd>
                {lastUpdated
                  ? new Date(lastUpdated).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" })
                  : "Not yet collected"}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt>Total articles:</dt>
              <dd>{articles.length}</dd>
            </div>
          </dl>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="surface surface-hover inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Collecting…" : "Fetch latest news"}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-72" />
          <Skeleton className="h-96" />
        </div>
      ) : articles.length === 0 ? (
        <SectionCard
          title="No articles collected yet"
          description="PulseAI only ever displays real articles from live news APIs."
        >
          <p className="text-sm text-muted-foreground">
            Use <strong>Fetch latest news</strong> above to run the collector now. After that it runs
            automatically every 24 hours.
          </p>
        </SectionCard>
      ) : (
        <div className="space-y-5">
          <StatCards totals={totals} />

          <div className="flex flex-wrap gap-2">
            {RANGES.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRange(option.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  range === option.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="Sentiment Distribution" description="Share of positive, neutral and negative coverage.">
              <SentimentPie totals={totals} />
            </SectionCard>
            <SectionCard title="Sentiment Volume" description="Article counts per sentiment class.">
              <SentimentBar totals={totals} />
            </SectionCard>
          </div>

          <SectionCard title="Sentiment Trend" description="Daily sentiment counts over the selected period.">
            <TrendChart data={trend} />
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InsightsPanel insights={insights} />
            </div>
            <TrendingTopics topics={trending} />
          </div>

          <GroupTable
            title="Municipality Analysis"
            description="Sentiment split by Western Cape municipality."
            rows={municipalities}
            showTopic
          />
          <GroupTable
            title="Category Analysis"
            description="Sentiment split by automatically detected category."
            rows={categories}
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <StoryCards title="Top Positive Stories" articles={positiveStories} />
            <StoryCards title="Top Negative Stories" articles={negativeStories} />
          </div>

          <NewsTable articles={scoped} />
        </div>
      )}
    </main>
  );
}
