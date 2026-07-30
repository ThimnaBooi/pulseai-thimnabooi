import { ArrowDownRight, ArrowRight, ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";
import type { Article } from "@/lib/pulse-shared";
import type { GroupRow, Totals, TrendingTopic } from "@/lib/pulse-stats";

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface fade-up p-5 md:p-6 ${className}`}>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-accent">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function StatCards({ totals }: { totals: Totals }) {
  const cards = [
    { label: "Total Articles", value: totals.total.toLocaleString(), tone: "text-accent" },
    { label: "Positive", value: `${totals.positivePct}%`, tone: "text-positive" },
    { label: "Neutral", value: `${totals.neutralPct}%`, tone: "text-neutral" },
    { label: "Negative", value: `${totals.negativePct}%`, tone: "text-negative" },
    {
      label: "Avg. Confidence",
      value: `${Math.round(totals.avgConfidence * 100)}%`,
      tone: "text-accent",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="surface surface-hover fade-up p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {card.label}
          </p>
          <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}

export function InsightsPanel({ insights }: { insights: string[] }) {
  return (
    <SectionCard title="AI Insights" description="Regenerated whenever new articles are analysed.">
      <ul className="space-y-3">
        {insights.map((insight) => (
          <li key={insight} className="flex gap-3 rounded-xl bg-muted/70 p-3 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{insight}</span>
          </li>
        ))}
        {insights.length === 0 ? (
          <li className="text-sm text-muted-foreground">No articles analysed yet.</li>
        ) : null}
      </ul>
    </SectionCard>
  );
}

export function TrendingTopics({ topics }: { topics: TrendingTopic[] }) {
  return (
    <SectionCard title="Trending Topics" description="Keyword frequency vs. the previous week.">
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li
            key={topic.word}
            className="flex items-center justify-between rounded-xl bg-muted/70 px-3 py-2 text-sm"
          >
            <span className="capitalize">{topic.word}</span>
            <span className="flex items-center gap-2 text-muted-foreground">
              {topic.count}
              {topic.direction === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-positive" />
              ) : topic.direction === "down" ? (
                <ArrowDownRight className="h-4 w-4 text-negative" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </span>
          </li>
        ))}
        {topics.length === 0 ? (
          <li className="text-sm text-muted-foreground">No keywords detected yet.</li>
        ) : null}
      </ul>
    </SectionCard>
  );
}

export function GroupTable({
  title,
  description,
  rows,
  showTopic,
}: {
  title: string;
  description: string;
  rows: GroupRow[];
  showTopic?: boolean;
}) {
  return (
    <SectionCard title={title} description={description}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-3 font-medium">Name</th>
              <th className="pb-2 pr-3 font-medium">Articles</th>
              {showTopic ? <th className="pb-2 pr-3 font-medium">Top topic</th> : null}
              <th className="pb-2 pr-3 font-medium">Positive</th>
              <th className="pb-2 pr-3 font-medium">Neutral</th>
              <th className="pb-2 pr-3 font-medium">Negative</th>
              <th className="pb-2 font-medium">Avg. conf.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-border/70">
                <td className="py-2 pr-3 font-medium">{row.name}</td>
                <td className="py-2 pr-3">{row.total}</td>
                {showTopic ? (
                  <td className="py-2 pr-3 text-muted-foreground">{row.topTopic}</td>
                ) : null}
                <td className="py-2 pr-3 text-positive">{row.positivePct}%</td>
                <td className="py-2 pr-3 text-muted-foreground">{row.neutralPct}%</td>
                <td className="py-2 pr-3 text-negative">{row.negativePct}%</td>
                <td className="py-2">{Math.round(row.avgConfidence * 100)}%</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-muted-foreground">
                  No data available.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

export function StoryCards({ title, articles }: { title: string; articles: Article[] }) {
  return (
    <SectionCard title={title} description="Ranked by model confidence.">
      <div className="space-y-3">
        {articles.map((article) => (
          <article key={article.id} className="rounded-xl bg-muted/70 p-4">
            <h3 className="text-base font-semibold leading-snug">{article.headline}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {article.source} · {Math.round(Number(article.confidence) * 100)}% confidence
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{article.summary}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </article>
        ))}
        {articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stories in this range yet.</p>
        ) : null}
      </div>
    </SectionCard>
  );
}
