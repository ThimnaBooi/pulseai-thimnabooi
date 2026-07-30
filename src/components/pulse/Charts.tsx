import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Totals, TrendPoint } from "@/lib/pulse-stats";

const SENTIMENT_COLORS = {
  Positive: "var(--color-positive)",
  Neutral: "var(--color-neutral)",
  Negative: "var(--color-negative)",
} as const;

const axisProps = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  color: "var(--color-foreground)",
  fontSize: "0.8rem",
};

function toData(totals: Totals) {
  return [
    { name: "Positive", value: totals.positive },
    { name: "Neutral", value: totals.neutral },
    { name: "Negative", value: totals.negative },
  ];
}

export function SentimentPie({ totals }: { totals: Totals }) {
  const data = toData(totals);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]}
              stroke="var(--color-card)"
            />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: "0.8rem" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function SentimentBar({ totals }: { totals: Totals }) {
  const data = toData(totals);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="name" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis allowDecimals={false} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: "0.8rem" }} />
        <Line type="monotone" dataKey="positive" stroke="var(--color-positive)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="neutral" stroke="var(--color-neutral)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="negative" stroke="var(--color-negative)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
