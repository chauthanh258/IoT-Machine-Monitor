"use client";

import { useState, useRef, useEffect } from "react";
import type { Machine, MachineStatus } from "@/lib/types";
import { MachineCard } from "@/components/dashboard/machine-card";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, Maximize2, Server, Tablet, Monitor, Cog } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface FactoryMapProps {
  machines: Machine[];
}

const statusColors: Record<MachineStatus, string> = {
  running: "#22c55e",
  manual: "#3b82f6",
  alarmed: "#eab308",
  finished: "#6366f1",
  error: "#ef4444",
  warning: "#f97316",
  offline: "#6b7280",
};

export function FactoryMap({ machines }: FactoryMapProps) {
  const [zoom, setZoom] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [hoveredMachine, setHoveredMachine] = useState<Machine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  // Calculate grid dimensions
  const cols = 6;
  const rows = Math.ceil(machines.length / cols);
  const mapWidth = cols * 150 + 160;
  const mapHeight = rows * 120 + 160;

  return (
    <div className="p-6 space-y-6">
      {/* Status Overview */}
      <StatusOverview machines={machines} />

      {/* Map Container */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-foreground">{t("factoryMap.subtitle")}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Slider
              value={[zoom * 100]}
              min={50}
              max={200}
              step={10}
              className="w-32"
              onValueChange={([v]) => setZoom(v / 100)}
            />
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={containerRef}
            className="relative overflow-auto bg-background/50"
            style={{ height: "500px" }}
          >
            <div
              className="relative transition-transform duration-200"
              style={{
                width: mapWidth * zoom,
                height: mapHeight * zoom,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {/* Grid Background */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={mapWidth}
                height={mapHeight}
              >
                {/* Grid lines */}
                {Array.from({ length: Math.floor(mapWidth / 50) + 1 }).map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={i * 50}
                    y1={0}
                    x2={i * 50}
                    y2={mapHeight}
                    stroke="currentColor"
                    strokeOpacity={0.05}
                  />
                ))}
                {Array.from({ length: Math.floor(mapHeight / 50) + 1 }).map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1={0}
                    y1={i * 50}
                    x2={mapWidth}
                    y2={i * 50}
                    stroke="currentColor"
                    strokeOpacity={0.05}
                  />
                ))}

                {/* Connection lines to server */}
                {machines.map((machine) => (
                  <line
                    key={`line-${machine.id}`}
                    x1={machine.position.x + 32}
                    y1={machine.position.y + 32}
                    x2={mapWidth - 60}
                    y2={mapHeight / 2}
                    stroke={statusColors[machine.status]}
                    strokeOpacity={hoveredMachine?.id === machine.id ? 0.8 : 0.15}
                    strokeWidth={hoveredMachine?.id === machine.id ? 2 : 1}
                    strokeDasharray={machine.status === "offline" ? "4,4" : "none"}
                  />
                ))}
              </svg>

              {/* Server Icon */}
              <div
                className="absolute flex flex-col items-center gap-2"
                style={{ right: 20, top: mapHeight / 2 - 60 }}
              >
                <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary flex items-center justify-center">
                  <Server className="w-8 h-8 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{t("factoryMap.server")}</span>
                <div className="flex gap-2 mt-2">
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                    <Monitor className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center">
                    <Tablet className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Machine Icons */}
              {machines.map((machine) => (
                <button
                  key={machine.id}
                  className={cn(
                    "absolute flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                    "hover:scale-110 hover:z-10",
                    selectedMachine?.id === machine.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-muted-foreground"
                  )}
                  style={{
                    left: machine.position.x,
                    top: machine.position.y,
                    width: 64,
                    height: 64,
                  }}
                  onClick={() => setSelectedMachine(machine)}
                  onMouseEnter={() => setHoveredMachine(machine)}
                  onMouseLeave={() => setHoveredMachine(null)}
                >
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${statusColors[machine.status]}20` }}
                  >
                    <Cog
                      className="w-5 h-5"
                      style={{ color: statusColors[machine.status] }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                    {machine.id}
                  </span>
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card",
                      machine.status === "running" && "animate-pulse"
                    )}
                    style={{ backgroundColor: statusColors[machine.status] }}
                  />
                </button>
              ))}

              {/* Tooltip */}
              {hoveredMachine && (
                <div
                  className="absolute z-20 bg-popover border border-border rounded-lg p-3 shadow-lg pointer-events-none"
                  style={{
                    left: hoveredMachine.position.x + 70,
                    top: hoveredMachine.position.y,
                  }}
                >
                  <div className="font-medium text-foreground">{hoveredMachine.name}</div>
                  <div className="text-xs text-muted-foreground">{hoveredMachine.model}</div>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                        style={{
                          color: statusColors[hoveredMachine.status],
                          borderColor: statusColors[hoveredMachine.status],
                        }}
                      >
                        {hoveredMachine.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Cycle:</span>
                      <span className="font-mono text-foreground">
                        {hoveredMachine.parameters.cycleTime.toFixed(1)}s
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Production:</span>
                      <span className="font-mono text-foreground">
                        {hoveredMachine.parameters.productionNumber} pcs
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-muted-foreground font-medium">{t("factoryMap.legend")}:</span>
            {(Object.entries(statusColors) as [MachineStatus, string][]).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="capitalize text-muted-foreground">{t(`status.${status === "alarmed" ? "warning" : status === "manual" || status === "finished" ? "running" : status}`)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Machine Detail Dialog */}
      <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
        <DialogContent className="max-w-md bg-card border-border">
          {selectedMachine && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-foreground">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${statusColors[selectedMachine.status]}20` }}
                  >
                    <Cog
                      className="w-6 h-6"
                      style={{ color: statusColors[selectedMachine.status] }}
                    />
                  </div>
                  <div>
                    <div>{selectedMachine.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {selectedMachine.model}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Cycle Time</div>
                    <div className="text-xl font-mono text-foreground">
                      {selectedMachine.parameters.cycleTime.toFixed(1)}
                      <span className="text-sm text-muted-foreground ml-1">s</span>
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Production</div>
                    <div className="text-xl font-mono text-foreground">
                      {selectedMachine.parameters.productionNumber.toLocaleString()}
                      <span className="text-sm text-muted-foreground ml-1">pcs</span>
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Injection Pressure</div>
                    <div className="text-xl font-mono text-foreground">
                      {selectedMachine.parameters.specificInjectionPressure.toFixed(0)}
                      <span className="text-sm text-muted-foreground ml-1">bar</span>
                    </div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="text-xs text-muted-foreground">Clamping Force</div>
                    <div className="text-xl font-mono text-foreground">
                      {selectedMachine.parameters.clampingForce.toFixed(0)}
                      <span className="text-sm text-muted-foreground ml-1">kN</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" variant="secondary">
                    {t("operatingStatus.viewDetails")}
                  </Button>
                  <Button className="flex-1">Remote Access</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
