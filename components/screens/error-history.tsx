"use client";

import { useState, useMemo } from "react";
import type { ErrorEvent, Machine } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface ErrorHistoryProps {
  errorEvents: ErrorEvent[];
  machines: Machine[];
}

const SEVERITY_CONFIG = {
  warning: { icon: AlertTriangle, color: "#eab308", bg: "bg-status-warning/20", text: "text-status-warning" },
  error: { icon: AlertCircle, color: "#ef4444", bg: "bg-status-error/20", text: "text-status-error" },
  critical: { icon: AlertOctagon, color: "#dc2626", bg: "bg-red-600/20", text: "text-red-500" },
};

const TYPE_COLORS: Record<string, string> = {
  pressure: "#3b82f6",
  temperature: "#ef4444",
  mechanical: "#8b5cf6",
  electrical: "#f97316",
  communication: "#6b7280",
};

export function ErrorHistory({ errorEvents, machines }: ErrorHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMachine, setFilterMachine] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<ErrorEvent | null>(null);
  const { t } = useLanguage();

  // Filter events
  const filteredEvents = useMemo(() => {
    return errorEvents.filter((event) => {
      if (filterSeverity !== "all" && event.severity !== filterSeverity) return false;
      if (filterType !== "all" && event.type !== filterType) return false;
      if (filterMachine !== "all" && event.machineId !== filterMachine) return false;
      if (searchQuery && !event.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [errorEvents, filterSeverity, filterType, filterMachine, searchQuery]);

  // Aggregate by type for pie chart
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const event of filteredEvents) {
      counts[event.type] = (counts[event.type] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: TYPE_COLORS[name],
    }));
  }, [filteredEvents]);

  // Aggregate by severity for bar chart
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { warning: 0, error: 0, critical: 0 };
    for (const event of filteredEvents) {
      counts[event.severity] = (counts[event.severity] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_CONFIG[name as keyof typeof SEVERITY_CONFIG].color,
    }));
  }, [filteredEvents]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const resolved = filteredEvents.filter((e) => e.resolved).length;
    const critical = filteredEvents.filter((e) => e.severity === "critical").length;
    const today = filteredEvents.filter(
      (e) => new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length;
    return { total, resolved, unresolved: total - resolved, critical, today };
  }, [filteredEvents]);

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-status-running">{stats.resolved}</div>
            <div className="text-xs text-muted-foreground">Resolved</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-status-warning">{stats.unresolved}</div>
            <div className="text-xs text-muted-foreground">Unresolved</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-status-error">{stats.critical}</div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.today}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error Type Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Error Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                Object.entries(TYPE_COLORS).map(([key, color]) => [key, { label: key, color }])
              )}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {typeData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground capitalize">{item.name}</span>
                  <span className="font-mono text-foreground">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={Object.fromEntries(
                severityData.map((item) => [item.name, { label: item.name, color: item.color }])
              )}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityData} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary border-border"
              />
            </div>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-36 bg-secondary border-border">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pressure">Pressure</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMachine} onValueChange={setFilterMachine}>
              <SelectTrigger className="w-40 bg-secondary border-border">
                <SelectValue placeholder="Machine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Machines</SelectItem>
                {machines.slice(0, 12).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="gap-2 ml-auto bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground w-12">Status</TableHead>
                  <TableHead className="text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-muted-foreground">Machine</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Severity</TableHead>
                  <TableHead className="text-muted-foreground">Message</TableHead>
                  <TableHead className="text-muted-foreground w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.slice(0, 20).map((event) => {
                  const severityConfig = SEVERITY_CONFIG[event.severity];
                  const SeverityIcon = severityConfig.icon;
                  return (
                    <TableRow key={event.id} className="border-border">
                      <TableCell>
                        {event.resolved ? (
                          <CheckCircle className="w-4 h-4 text-status-running" />
                        ) : (
                          <XCircle className="w-4 h-4 text-status-error" />
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{event.machineName}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize text-xs"
                          style={{ color: TYPE_COLORS[event.type], borderColor: TYPE_COLORS[event.type] }}
                        >
                          {event.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={cn("flex items-center gap-1.5 text-xs", severityConfig.text)}>
                          <SeverityIcon className="w-3.5 h-3.5" />
                          <span className="capitalize">{event.severity}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-xs truncate">
                        {event.message}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          className="h-7 px-2"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-foreground">
                  {(() => {
                    const config = SEVERITY_CONFIG[selectedEvent.severity];
                    const Icon = config.icon;
                    return (
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.bg)}>
                        <Icon className={cn("w-5 h-5", config.text)} />
                      </div>
                    );
                  })()}
                  <div>
                    <div>Event Details</div>
                    <div className="text-xs font-normal text-muted-foreground">{selectedEvent.id}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs">Timestamp</div>
                    <div className="font-mono text-foreground">
                      {new Date(selectedEvent.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Machine</div>
                    <div className="text-foreground">{selectedEvent.machineName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Type</div>
                    <Badge
                      variant="outline"
                      className="capitalize mt-1"
                      style={{ color: TYPE_COLORS[selectedEvent.type], borderColor: TYPE_COLORS[selectedEvent.type] }}
                    >
                      {selectedEvent.type}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Status</div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {selectedEvent.resolved ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-status-running" />
                          <span className="text-status-running">Resolved</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-status-error" />
                          <span className="text-status-error">Unresolved</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs mb-1">Message</div>
                  <div className="bg-secondary rounded-lg p-3 text-sm text-foreground">
                    {selectedEvent.message}
                  </div>
                </div>

                {selectedEvent.parameter && (
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Related Parameter</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-foreground">{selectedEvent.parameter}</span>
                      {selectedEvent.value && (
                        <span className="font-mono text-foreground">{selectedEvent.value.toFixed(1)}</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1">
                    View Waveform
                  </Button>
                  {!selectedEvent.resolved && <Button className="flex-1">Mark Resolved</Button>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
