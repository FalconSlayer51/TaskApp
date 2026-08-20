import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { DashboardSkeleton } from "@/components/PageSkeleton";
import { QueryError } from "@/components/QueryError";
import { EmptyState } from "@/components/EmptyState";
import { useAnalytics } from "@/features/dashboard/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  todo: { label: "Todo", color: "var(--chart-3)" },
  in_progress: { label: "In progress", color: "var(--chart-2)" },
  done: { label: "Done", color: "var(--chart-1)" },
} satisfies ChartConfig;

const priorityConfig = {
  count: { label: "Tasks", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function DashboardPage() {
  const query = useAnalytics();
  const navigate = useNavigate();
  const data = query.data;

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError) {
    return <QueryError message={getApiErrorMessage(query.error)} onRetry={() => query.refetch()} />;
  }
  if (!data || data.total === 0) {
    return (
      <EmptyState
        headline="Nothing to measure yet"
        description="Create a few tasks and this dashboard will fill in with completion, overdue, and priority."
        actionLabel="Create task"
        onAction={() => navigate("/tasks")}
      />
    );
  }

  const statusData = data.byStatus.map((row) => ({
    name: statusConfig[row.status].label,
    value: row.count,
    fill: `var(--color-${row.status})`,
    key: row.status,
  }));

  const priorityData = data.byPriority.map((row) => ({
    priority: row.priority,
    count: row.count,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="hidden md:block">
        <h2 className="text-2xl tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          A snapshot of everything you own.
          {query.isFetching ? " Updating…" : ""}
        </p>
      </div>
      {query.isFetching ? (
        <p className="text-sm text-muted-foreground md:hidden">Updating…</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 md:gap-4">
        <Kpi label="Total" value={data.total} />
        <Kpi label="Completed" value={data.completed} hint={`${data.completionPercentage}% done`} />
        <Kpi label="In progress" value={data.inProgress} />
        <Kpi label="Pending" value={data.pending} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusConfig} className="aspect-auto h-56 md:h-72">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={56} strokeWidth={4}>
                  {statusData.map((entry) => (
                    <Cell key={entry.key} fill={`var(--color-${entry.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priorityConfig} className="aspect-auto h-56 md:h-72">
              <BarChart data={priorityData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="priority" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl">{data.overdue}</p>
            <p className="text-sm text-muted-foreground">Open tasks past their due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Due this week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl">{data.dueThisWeek}</p>
            <p className="text-sm text-muted-foreground">Coming up in the next 7 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-heading text-3xl">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
