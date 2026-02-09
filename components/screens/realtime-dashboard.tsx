"use client";

import React from "react"

import { useState, useEffect } from "react";
import type { Machine } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  Thermometer,
  Gauge,
  Timer,
  Zap,
  Droplets,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface RealtimeDashboardProps {
  machines: Machine[];
}

// Gauge component
function GaugeCard({
  title,
  value,
  unit,
  min,
  max,
  thresholds,
  icon: Icon,
}: {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  thresholds?: { warning: number; error: number };
  icon: React.ComponentType<{ className?: string }>;
}) {
  const percentage = Math.min(((value - min) / (max - min)) * 100, 100);
  const isWarning = thresholds && value > thresholds.warning;
  const isError = thresholds && value > thresholds.error;

  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", isError ? "text-status-error" : isWarning ? "text-status-warning" : "text-primary")} />
            <span className="text-sm text-muted-foreground">{title}</span>
          </div>
          {(isWarning || isError) && (
            <AlertTriangle className={cn("w-4 h-4", isError ? "text-status-error" : "text-status-warning")} />
          )}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span className={cn("text-2xl font-bold font-mono", isError ? "text-status-error" : isWarning ? "text-status-warning" : "text-foreground")}>
            {value.toFixed(1)}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <Progress
          value={percentage}
          className={cn(
            "h-2",
            isError ? "[&>div]:bg-status-error" : isWarning ? "[&>div]:bg-status-warning" : "[&>div]:bg-primary"
          )}
        />
        <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Mini chart component
function MiniChart({ data, color, height = 60 }: { data: { time: number; value: number }[]; color: string; height?: number }) {
  return (
    <ChartContainer
      config={{ value: { label: "Value", color } }}
      className={`w-full`}
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function RealtimeDashboard({ machines }: RealtimeDashboardProps) {
  const [selectedMachine, setSelectedMachine] = useState<string>(machines[0]?.id || "");
  const [liveData, setLiveData] = useState<{
    pressureHistory: { time: number; value: number }[];
    tempHistory: { time: number; value: number }[];
    cycleHistory: { time: number; value: number }[];
    energyHistory: { time: number; value: number }[];
  }>({
    pressureHistory: [],
    tempHistory: [],
    cycleHistory: [],
    energyHistory: [],
  });
  const { t } = useLanguage();

  const machine = machines.find((m) => m.id === selectedMachine);

  // Simulate real-time data updates
  useEffect(() => {
    if (!machine) return;

    const initHistory = (baseValue: number, variance: number) =>
      Array.from({ length: 30 }, (_, i) => ({
        time: i,
        value: baseValue + (Math.random() - 0.5) * variance,
      }));

    setLiveData({
      pressureHistory: initHistory(machine.parameters.specificInjectionPressure, 100),
      tempHistory: initHistory(machine.parameters.barrelTemp3.actual, 10),
      cycleHistory: initHistory(machine.parameters.cycleTime, 5),
      energyHistory: initHistory(machine.parameters.totalEnergyMeanValue, 5),
    });

    const interval = setInterval(() => {
      setLiveData((prev) => {
        const addPoint = (history: { time: number; value: number }[], baseValue: number, variance: number) => {
          const last = history[history.length - 1];
          return [
            ...history.slice(1),
            { time: last.time + 1, value: baseValue + (Math.random() - 0.5) * variance },
          ];
        };

        return {
          pressureHistory: addPoint(prev.pressureHistory, machine.parameters.specificInjectionPressure, 100),
          tempHistory: addPoint(prev.tempHistory, machine.parameters.barrelTemp3.actual, 10),
          cycleHistory: addPoint(prev.cycleHistory, machine.parameters.cycleTime, 5),
          energyHistory: addPoint(prev.energyHistory, machine.parameters.totalEnergyMeanValue, 5),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [machine]);

  if (!machine) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Machine Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <Badge variant="outline" className="text-xs">
            {machine.model}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              machine.status === "running"
                ? "text-status-running border-status-running"
                : machine.status === "error"
                  ? "text-status-error border-status-error"
                  : "text-status-warning border-status-warning"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5",
                machine.status === "running" ? "bg-status-running animate-pulse" : machine.status === "error" ? "bg-status-error" : "bg-status-warning"
              )}
            />
            {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-status-running animate-pulse" />
          {t("realtime.live")} - {t("realtime.lastUpdate")}
        </div>
      </div>

      {/* Key Metrics with Mini Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Injection Pressure</span>
              </div>
              <TrendingUp className="w-4 h-4 text-status-running" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {machine.parameters.specificInjectionPressure.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground">bar</span>
            </div>
            <MiniChart data={liveData.pressureHistory} color="#3b82f6" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-status-error" />
                <span className="text-sm text-muted-foreground">Barrel Temperature</span>
              </div>
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                Zone 3
              </Badge>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {machine.parameters.barrelTemp3.actual.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">°C</span>
              <span className="text-xs text-muted-foreground ml-1">/ {machine.parameters.barrelTemp3.set}</span>
            </div>
            <MiniChart data={liveData.tempHistory} color="#ef4444" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-status-running" />
                <span className="text-sm text-muted-foreground">Cycle Time</span>
              </div>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {machine.parameters.cycleTime.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">s</span>
            </div>
            <MiniChart data={liveData.cycleHistory} color="#22c55e" />
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-status-warning" />
                <span className="text-sm text-muted-foreground">Energy Consumption</span>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {machine.parameters.totalEnergyMeanValue.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">kWh</span>
            </div>
            <MiniChart data={liveData.energyHistory} color="#eab308" />
          </CardContent>
        </Card>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <GaugeCard
          title="Holding Pressure"
          value={machine.parameters.holdingPressurePeak}
          unit="bar"
          min={0}
          max={600}
          icon={Gauge}
        />
        <GaugeCard
          title="Clamping Force"
          value={machine.parameters.clampingForce}
          unit="kN"
          min={0}
          max={5000}
          icon={Activity}
        />
        <GaugeCard
          title="Oil Temperature"
          value={machine.parameters.oilTemp}
          unit="°C"
          min={20}
          max={60}
          thresholds={{ warning: 45, error: 55 }}
          icon={Thermometer}
        />
        <GaugeCard
          title="Screw Position"
          value={machine.parameters.screwPosition}
          unit="mm"
          min={0}
          max={100}
          icon={Activity}
        />
        <GaugeCard
          title="Torque Peak"
          value={machine.parameters.torquePeakValue}
          unit="%"
          min={0}
          max={100}
          thresholds={{ warning: 80, error: 95 }}
          icon={Gauge}
        />
        <GaugeCard
          title="Material Cushion"
          value={machine.parameters.materialCushion}
          unit="mm"
          min={0}
          max={30}
          icon={Droplets}
        />
      </div>

      {/* Temperature Overview */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-foreground">
            <Thermometer className="w-4 h-4 text-status-error" />
            Temperature Zones Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { name: "Barrel 1", data: machine.parameters.barrelTemp1 },
              { name: "Barrel 2", data: machine.parameters.barrelTemp2 },
              { name: "Barrel 3", data: machine.parameters.barrelTemp3 },
              { name: "Barrel 4", data: machine.parameters.barrelTemp4 },
              { name: "Barrel 5", data: machine.parameters.barrelTemp5 },
              { name: "Nozzle", data: machine.parameters.nozzleTemp },
              { name: "Mold 1", data: machine.parameters.moldTemp1 },
              { name: "Mold 2", data: machine.parameters.moldTemp2 },
            ].map((zone) => {
              const deviation = zone.data.actual - zone.data.set;
              const isWarning = Math.abs(deviation) > zone.data.set * 0.02;
              const isError = Math.abs(deviation) > zone.data.set * 0.05;
              return (
                <div
                  key={zone.name}
                  className={cn(
                    "p-3 rounded-lg border",
                    isError ? "border-status-error bg-status-error/10" : isWarning ? "border-status-warning bg-status-warning/10" : "border-border bg-secondary"
                  )}
                >
                  <div className="text-xs text-muted-foreground mb-1">{zone.name}</div>
                  <div className={cn("text-lg font-mono font-bold", isError ? "text-status-error" : isWarning ? "text-status-warning" : "text-foreground")}>
                    {zone.data.actual.toFixed(1)}°
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Set: {zone.data.set}°C
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Production & Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <Timer className="w-4 h-4 text-status-running" />
              Cycle Time Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Injection", value: machine.parameters.injectionTime, max: 3, color: "#3b82f6" },
                { name: "Plasticizing", value: machine.parameters.plasticisingTime, max: 15, color: "#8b5cf6" },
                { name: "Cooling", value: machine.parameters.coolingTime, max: 30, color: "#06b6d4" },
                { name: "Mold Closing", value: machine.parameters.moldClosingTime, max: 5, color: "#22c55e" },
                { name: "Mold Opening", value: machine.parameters.moldOpeningTime, max: 5, color: "#eab308" },
              ].map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-mono text-foreground">{item.value.toFixed(2)}s</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((item.value / item.max) * 100, 100)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-foreground">
              <Droplets className="w-4 h-4 text-primary" />
              Water/Manifold Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Circuit 1 Flow", value: machine.parameters.manifoldFlow1, unit: "l/min" },
                { name: "Circuit 2 Flow", value: machine.parameters.manifoldFlow2, unit: "l/min" },
                { name: "Circuit 1 Temp", value: machine.parameters.manifoldTemp1, unit: "°C" },
                { name: "Circuit 2 Temp", value: machine.parameters.manifoldTemp2, unit: "°C" },
                { name: "Circuit 1 Pressure", value: machine.parameters.manifoldPressure1, unit: "bar" },
                { name: "Circuit 2 Pressure", value: machine.parameters.manifoldPressure2, unit: "bar" },
              ].map((item) => (
                <div key={item.name} className="bg-secondary rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">{item.name}</div>
                  <div className="text-lg font-mono font-bold text-foreground">
                    {item.value.toFixed(1)}
                    <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
