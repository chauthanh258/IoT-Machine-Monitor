"use client";

import { useState, useMemo } from "react";
import type { ProductionData, Machine } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Target, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ProductionResultsProps {
  productionData: ProductionData[];
  machines: Machine[];
}

// Define colors as hex values for Recharts
const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#22c55e",
  warning: "#eab308",
  error: "#ef4444",
  muted: "#6b7280",
};

export function ProductionResults({ productionData, machines }: ProductionResultsProps) {
  const [viewMode, setViewMode] = useState<"day" | "lot" | "machine">("day");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const { t } = useLanguage();

  // Get unique dates
  const dates = useMemo(
    () => [...new Set(productionData.map((d) => d.date))].sort().reverse(),
    [productionData]
  );

  // Aggregate data by view mode
  const aggregatedData = useMemo(() => {
    const filtered =
      selectedDate === "all"
        ? productionData
        : productionData.filter((d) => d.date === selectedDate);

    if (viewMode === "day") {
      const byDate: Record<string, { date: string; planned: number; actual: number; rejects: number }> = {};
      for (const item of filtered) {
        if (!byDate[item.date]) {
          byDate[item.date] = { date: item.date, planned: 0, actual: 0, rejects: 0 };
        }
        byDate[item.date].planned += item.planned;
        byDate[item.date].actual += item.actual;
        byDate[item.date].rejects += item.rejects;
      }
      return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    }

    if (viewMode === "machine") {
      const byMachine: Record<string, { name: string; planned: number; actual: number; rejects: number; runRate: number }> = {};
      for (const item of filtered) {
        if (!byMachine[item.machineId]) {
          byMachine[item.machineId] = { name: item.machineName, planned: 0, actual: 0, rejects: 0, runRate: 0 };
        }
        byMachine[item.machineId].planned += item.planned;
        byMachine[item.machineId].actual += item.actual;
        byMachine[item.machineId].rejects += item.rejects;
      }
      for (const key of Object.keys(byMachine)) {
        byMachine[key].runRate = Math.round((byMachine[key].actual / byMachine[key].planned) * 100);
      }
      return Object.values(byMachine).sort((a, b) => b.actual - a.actual);
    }

    // By lot
    return filtered.map((item) => ({
      lot: item.lot,
      machine: item.machineName,
      planned: item.planned,
      actual: item.actual,
      rejects: item.rejects,
      runRate: item.runRate,
    }));
  }, [productionData, viewMode, selectedDate]);

  // Summary statistics
  const totals = useMemo(() => {
    const filtered =
      selectedDate === "all"
        ? productionData
        : productionData.filter((d) => d.date === selectedDate);
    const planned = filtered.reduce((sum, d) => sum + d.planned, 0);
    const actual = filtered.reduce((sum, d) => sum + d.actual, 0);
    const rejects = filtered.reduce((sum, d) => sum + d.rejects, 0);
    return {
      planned,
      actual,
      rejects,
      runRate: planned > 0 ? Math.round((actual / planned) * 100) : 0,
      rejectRate: actual > 0 ? ((rejects / actual) * 100).toFixed(1) : "0",
    };
  }, [productionData, selectedDate]);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totals.planned.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Planned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-running/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-status-running" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totals.actual.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Actual</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  totals.runRate >= 95 ? "bg-status-running/20" : totals.runRate >= 85 ? "bg-status-warning/20" : "bg-status-error/20"
                )}
              >
                {totals.runRate >= 95 ? (
                  <TrendingUp className="w-5 h-5 text-status-running" />
                ) : (
                  <TrendingDown className={cn("w-5 h-5", totals.runRate >= 85 ? "text-status-warning" : "text-status-error")} />
                )}
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totals.runRate}%</div>
                <div className="text-xs text-muted-foreground">Run Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-error/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-status-error" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{totals.rejects.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Rejects ({totals.rejectRate}%)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
          <TabsList className="bg-secondary">
            <TabsTrigger value="day">By Day</TabsTrigger>
            <TabsTrigger value="machine">By Machine</TabsTrigger>
            <TabsTrigger value="lot">By Lot</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-40 bg-secondary border-border">
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Production vs Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                planned: { label: "Planned", color: CHART_COLORS.muted },
                actual: { label: "Actual", color: CHART_COLORS.primary },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={viewMode === "lot" ? aggregatedData.slice(0, 10) : aggregatedData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey={viewMode === "day" ? "date" : viewMode === "machine" ? "name" : "lot"}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(value) => (typeof value === "string" && value.length > 8 ? value.slice(0, 8) : value)}
                  />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="planned" fill={CHART_COLORS.muted} name="Planned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" fill={CHART_COLORS.primary} name="Actual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Run Rate Chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Run Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                runRate: { label: "Run Rate %", color: CHART_COLORS.secondary },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === "day" ? (
                  <LineChart
                    data={aggregatedData.map((d) => ({
                      ...d,
                      runRate: d.planned > 0 ? Math.round((d.actual / d.planned) * 100) : 0,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    />
                    <YAxis domain={[0, 120]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="runRate"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.secondary }}
                      name="Run Rate %"
                    />
                  </LineChart>
                ) : (
                  <BarChart
                    data={(viewMode === "lot" ? aggregatedData.slice(0, 10) : aggregatedData) as { runRate?: number }[]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey={viewMode === "machine" ? "name" : "lot"}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                      tickFormatter={(value) => (typeof value === "string" && value.length > 8 ? value.slice(0, 8) : value)}
                    />
                    <YAxis domain={[0, 120]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="runRate" name="Run Rate %" radius={[4, 4, 0, 0]}>
                      {(aggregatedData as { runRate?: number }[]).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            (entry.runRate ?? 0) >= 95
                              ? CHART_COLORS.secondary
                              : (entry.runRate ?? 0) >= 85
                                ? CHART_COLORS.warning
                                : CHART_COLORS.error
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">Production Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">
                    {viewMode === "day" ? "Date" : viewMode === "machine" ? "Machine" : "Lot"}
                  </TableHead>
                  {viewMode === "lot" && <TableHead className="text-muted-foreground">Machine</TableHead>}
                  <TableHead className="text-right text-muted-foreground">Planned</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actual</TableHead>
                  <TableHead className="text-right text-muted-foreground">Rejects</TableHead>
                  <TableHead className="text-right text-muted-foreground">Run Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(aggregatedData as Record<string, unknown>[]).slice(0, 15).map((row, i) => {
                  const runRate = 'runRate' in row 
                    ? (row.runRate as number)
                    : row.planned 
                      ? Math.round(((row.actual as number) / (row.planned as number)) * 100)
                      : 0;
                  return (
                    <TableRow key={i} className="border-border">
                      <TableCell className="font-mono text-foreground">
                        {(row.date || row.name || row.lot) as string}
                      </TableCell>
                      {viewMode === "lot" && <TableCell className="text-muted-foreground">{row.machine as string}</TableCell>}
                      <TableCell className="text-right font-mono text-foreground">
                        {(row.planned as number).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-foreground">
                        {(row.actual as number).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-status-error">
                        {(row.rejects as number).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono",
                            runRate >= 95
                              ? "text-status-running border-status-running"
                              : runRate >= 85
                                ? "text-status-warning border-status-warning"
                                : "text-status-error border-status-error"
                          )}
                        >
                          {runRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
