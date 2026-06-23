import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMissionControlHistory } from "@/hooks/useMissionControlHistory";

export default function HealthTrendChart() {
  const { data: history = [] } = useMissionControlHistory(10);

  const chartData = history.map((h, i) => ({
    idx: i + 1,
    score: h.health_score ?? 0,
    when: h.completed_at ? new Date(h.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
  }));

  const last = chartData[chartData.length - 1]?.score ?? null;
  const prev = chartData[chartData.length - 2]?.score ?? null;
  const delta = last != null && prev != null ? last - prev : null;
  const Trend = delta == null ? Minus : delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor = delta == null ? "text-muted-foreground" : delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-muted-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
          <span>Org Health Trend (last {chartData.length} scans)</span>
          {delta != null && (
            <span className={`flex items-center gap-1 text-xs ${trendColor}`}>
              <Trend className="w-3 h-3" /> {delta > 0 ? "+" : ""}{delta} pts
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <div className="h-32 flex items-center justify-center text-sm text-muted-foreground">
            Run at least 2 scans to see a trend.
          </div>
        ) : (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                <XAxis dataKey="when" tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.4} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.4} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number) => [`${v}/100`, "Health"]}
                />
                <ReferenceLine y={80} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" opacity={0.3} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
