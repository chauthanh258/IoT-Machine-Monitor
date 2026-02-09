"use client";

import { useState, useMemo, useEffect } from "react";
import type { Machine, WaveformData } from "@/lib/types";
import { generateWaveformData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Download, ZoomIn, ZoomOut, Play, Pause, RefreshCw, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface MonitorDataProps {
  machines: Machine[];
}

const PARAMETERS = [
  { id: "injectionPressure", name: "Injection Pressure", unit: "bar", color: "#3b82f6" },
  { id: "holdingPressure", name: "Holding Pressure", unit: "bar", color: "#8b5cf6" },
  { id: "hydraulicPressure", name: "Hydraulic Pressure", unit: "bar", color: "#06b6d4" },
  { id: "barrelTemp1", name: "Barrel Temp Zone 1", unit: "°C", color: "#ef4444" },
  { id: "barrelTemp2", name: "Barrel Temp Zone 2", unit: "°C", color: "#f97316" },
  { id: "nozzleTemp", name: "Nozzle Temperature", unit: "°C", color: "#eab308" },
  { id: "screwPosition", name: "Screw Position", unit: "mm", color: "#22c55e" },
  { id: "torque", name: "Torque", unit: "Nm", color: "#a855f7" },
];

export function MonitorData({ machines }: MonitorDataProps) {
  const [selectedMachine, setSelectedMachine] = useState<string>(machines[0]?.id || "");
  const [selectedParams, setSelectedParams] = useState<string[]>(["injectionPressure", "holdingPressure"]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [waveformData, setWaveformData] = useState<Map<string, WaveformData>>(new Map());
  const { t } = useLanguage();

  // Generate initial waveform data
  useEffect(() => {
    const data = new Map<string, WaveformData>();
    for (const param of selectedParams) {
      const paramConfig = PARAMETERS.find((p) => p.id === param);
      if (paramConfig) {
        data.set(param, generateWaveformData(selectedMachine, paramConfig.name, paramConfig.unit, 60));
      }
    }
    setWaveformData(data);
  }, [selectedMachine, selectedParams]);

  // Simulate real-time updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setWaveformData((prev) => {
        const newData = new Map(prev);
        for (const [key, waveform] of newData) {
          const lastPoint = waveform.data[waveform.data.length - 1];
          const baseValue = waveform.data.reduce((sum, p) => sum + p.value, 0) / waveform.data.length;
          const newPoint = {
            time: lastPoint.time + 0.5,
            value: baseValue + Math.sin(lastPoint.time * 0.5) * baseValue * 0.05 + (Math.random() - 0.5) * baseValue * 0.1,
          };
          const newWaveform = {
            ...waveform,
            data: [...waveform.data.slice(1), newPoint],
          };
          newData.set(key, newWaveform);
        }
        return newData;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Combine data for chart
  const chartData = useMemo(() => {
    const firstWaveform = Array.from(waveformData.values())[0];
    if (!firstWaveform) return [];

    return firstWaveform.data.map((point, index) => {
      const dataPoint: Record<string, number> = { time: point.time };
      for (const [key, waveform] of waveformData) {
        dataPoint[key] = waveform.data[index]?.value || 0;
      }
      return dataPoint;
    });
  }, [waveformData]);

  const machine = machines.find((m) => m.id === selectedMachine);

  const addParameter = (paramId: string) => {
    if (!selectedParams.includes(paramId) && selectedParams.length < 4) {
      setSelectedParams([...selectedParams, paramId]);
    }
  };

  const removeParameter = (paramId: string) => {
    setSelectedParams(selectedParams.filter((p) => p !== paramId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Controls */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger className="w-48 bg-secondary border-border">
                <SelectValue placeholder="Select machine" />
              </SelectTrigger>
              <SelectContent>
                {machines.slice(0, 12).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("monitor.parameters")}:</span>
              {selectedParams.map((paramId) => {
                const param = PARAMETERS.find((p) => p.id === paramId);
                return (
                  <Badge
                    key={paramId}
                    variant="outline"
                    className="gap-1 pr-1"
                    style={{ color: param?.color, borderColor: param?.color }}
                  >
                    {param?.name}
                    <button onClick={() => removeParameter(paramId)} className="ml-1 hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              {selectedParams.length < 4 && (
                <Select onValueChange={addParameter}>
                  <SelectTrigger className="w-8 h-7 p-0 bg-secondary border-border">
                    <Plus className="w-4 h-4" />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAMETERS.filter((p) => !selectedParams.includes(p.id)).map((param) => (
                      <SelectItem key={param.id} value={param.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: param.color }} />
                          {param.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={isPlaying ? "secondary" : "outline"}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="gap-1"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>

              <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}>
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waveform Chart */}
      <Card className="border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-foreground">{t("monitor.waveform")}</CardTitle>
          {machine && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {machine.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {machine.model}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={Object.fromEntries(
              selectedParams.map((paramId) => {
                const param = PARAMETERS.find((p) => p.id === paramId)!;
                return [paramId, { label: param.name, color: param.color }];
              })
            )}
            className="h-[350px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(value) => `${value.toFixed(0)}s`}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  domain={['auto', 'auto']}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {selectedParams.map((paramId) => {
                  const param = PARAMETERS.find((p) => p.id === paramId)!;
                  return (
                    <Line
                      key={paramId}
                      type="monotone"
                      dataKey={paramId}
                      stroke={param.color}
                      strokeWidth={2}
                      dot={false}
                      name={param.name}
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-foreground">{t("monitor.actualValue")} vs {t("monitor.setValue")}</CardTitle>
        </CardHeader>
        <CardContent>
          {machine && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Parameter</TableHead>
<TableHead className="text-right text-muted-foreground">{t("monitor.actualValue")}</TableHead>
                <TableHead className="text-right text-muted-foreground">{t("monitor.setValue")}</TableHead>
                    <TableHead className="text-right text-muted-foreground">Unit</TableHead>
                    <TableHead className="text-right text-muted-foreground">Deviation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { name: "Barrel Temp Zone 1", actual: machine.parameters.barrelTemp1.actual, set: machine.parameters.barrelTemp1.set, unit: "°C" },
                    { name: "Barrel Temp Zone 2", actual: machine.parameters.barrelTemp2.actual, set: machine.parameters.barrelTemp2.set, unit: "°C" },
                    { name: "Barrel Temp Zone 3", actual: machine.parameters.barrelTemp3.actual, set: machine.parameters.barrelTemp3.set, unit: "°C" },
                    { name: "Barrel Temp Zone 4", actual: machine.parameters.barrelTemp4.actual, set: machine.parameters.barrelTemp4.set, unit: "°C" },
                    { name: "Barrel Temp Zone 5", actual: machine.parameters.barrelTemp5.actual, set: machine.parameters.barrelTemp5.set, unit: "°C" },
                    { name: "Nozzle Temp", actual: machine.parameters.nozzleTemp.actual, set: machine.parameters.nozzleTemp.set, unit: "°C" },
                    { name: "Mold Temp Zone 1", actual: machine.parameters.moldTemp1.actual, set: machine.parameters.moldTemp1.set, unit: "°C" },
                    { name: "Mold Temp Zone 2", actual: machine.parameters.moldTemp2.actual, set: machine.parameters.moldTemp2.set, unit: "°C" },
                  ].map((row) => {
                    const deviation = row.actual - row.set;
                    const deviationPercent = ((deviation / row.set) * 100).toFixed(1);
                    const isWarning = Math.abs(deviation) > row.set * 0.02;
                    const isError = Math.abs(deviation) > row.set * 0.05;
                    return (
                      <TableRow key={row.name} className="border-border">
                        <TableCell className="text-foreground">{row.name}</TableCell>
                        <TableCell className="text-right font-mono text-foreground">{row.actual.toFixed(1)}</TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">{row.set}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{row.unit}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "font-mono",
                              isError ? "text-status-error" : isWarning ? "text-status-warning" : "text-status-running"
                            )}
                          >
                            {deviation >= 0 ? "+" : ""}{deviation.toFixed(1)} ({deviationPercent}%)
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
