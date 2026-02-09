"use client";

import { useState } from "react";
import type { Machine } from "@/lib/types";
import { MachineCard } from "@/components/dashboard/machine-card";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { RemoteTactScreen } from "@/components/dialogs/remote-tact-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LayoutGrid, List, Thermometer, Gauge, Zap, Clock, Factory } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface OperatingStatusProps {
  machines: Machine[];
}

export function OperatingStatus({ machines }: OperatingStatusProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [remoteMachine, setRemoteMachine] = useState<Machine | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const { t } = useLanguage();

  const groups = ["all", ...new Set(machines.map((m) => m.group))];
  const filteredMachines =
    activeGroup === "all" ? machines : machines.filter((m) => m.group === activeGroup);

  return (
    <div className="p-6 space-y-6">
      {/* Status Overview */}
      <StatusOverview machines={machines} />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Tabs value={activeGroup} onValueChange={setActiveGroup}>
          <TabsList className="bg-secondary">
            {groups.map((group) => (
              <TabsTrigger key={group} value={group} className="capitalize">
                {group === "all" ? t("operatingStatus.allStatus") : group}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            title={t("operatingStatus.gridView")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            title={t("operatingStatus.listView")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Machine Grid/List */}
      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-3"
        )}
      >
        {filteredMachines.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onClick={setSelectedMachine}
            onViewDetails={setSelectedMachine}
            onRemoteAccess={setRemoteMachine}
          />
        ))}
      </div>

      {/* Machine Detail Dialog */}
      <Dialog open={!!selectedMachine} onOpenChange={() => setSelectedMachine(null)}>
        <DialogContent className="max-w-3xl bg-card border border-border shadow-lg">
          {selectedMachine && (
            <>
              <DialogHeader className="pb-4 border-b border-border">
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                  <Factory className="w-6 h-6 text-primary" />
                  Machine Details - {selectedMachine.name}
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "ml-auto",
                      selectedMachine.status === "running" ? "border-status-running text-status-running" :
                      selectedMachine.status === "error" ? "border-status-error text-status-error" :
                      "border-status-warning text-status-warning"
                    )}
                  >
                    {selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1)}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Top Section - Machine Info */}
                <div className="flex gap-6">
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Machine ID:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-24 text-center font-mono" 
                          value={selectedMachine.id} 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Lot No:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-24 text-center font-mono" 
                          value="nissei" 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Production Code:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-32 text-center font-mono" 
                          value="112233445566" 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Error Code:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                          value="0" 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Status:</span>
                        <input 
                          className={cn(
                            "text-sm border border-border rounded px-2 py-1 w-24 text-center font-mono",
                            selectedMachine.status === "running" ? "bg-status-running/20 text-status-running" :
                            selectedMachine.status === "error" ? "bg-status-error/20 text-status-error" :
                            "bg-status-warning/20 text-status-warning"
                          )}
                          value={selectedMachine.status.charAt(0).toUpperCase() + selectedMachine.status.slice(1)} 
                          readOnly 
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cycle Time:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                          value={selectedMachine.parameters.cycleTime.toFixed(2)} 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">CheckId:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                          value="4" 
                          readOnly 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Schedule Time:</span>
                        <input 
                          className="text-sm bg-background border border-border rounded px-2 py-1 w-32 text-center font-mono text-xs" 
                          value="8/28/2015 08:15:11" 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Machine Icon */}
                  <div className="flex flex-col items-center justify-center bg-secondary/50 rounded-lg p-4 min-w-[120px]">
                    <Factory className="w-16 h-16 text-primary mb-2" />
                    <div className="text-xs text-center">
                      <div className="font-medium">{selectedMachine.name}</div>
                      <div className="text-muted-foreground">{selectedMachine.model}</div>
                    </div>
                  </div>
                </div>

                {/* Production Stats */}
                <div className="grid grid-cols-3 gap-8 py-4 border-t border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Output Count:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                        value={(selectedMachine.production?.today || 400).toString()} 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Target Count:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                        value="324" 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Output Rate:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-20 text-center font-mono" 
                        value="81.00%" 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">NG Count:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-16 text-center font-mono" 
                        value="1" 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">NG Rate:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-20 text-center font-mono" 
                        value="0.25%" 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Time Stop:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-20 text-center font-mono" 
                        value="2h 54m" 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Runtime:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-24 text-center font-mono" 
                        value="1d 7h 37m" 
                        readOnly 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Operation Rate:</span>
                      <input 
                        className="text-sm bg-background border border-border rounded px-2 py-1 w-20 text-center font-mono" 
                        value="16.57%" 
                        readOnly 
                      />
                    </div>
                  </div>

                </div>
                {/* Pie Charts */}
                <div className="col-span-4 grid grid-cols-3 gap-4">
                  {/* Output Rate Chart */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Output Rate</div>
                    <ChartContainer config={{}} className="h-20 w-20 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Output", value: 81, fill: "#3b82f6" },
                              { name: "Remaining", value: 19, fill: "#e5e7eb" }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={15}
                            outerRadius={35}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="text-xs font-medium mt-1">81.00%</div>
                  </div>

                  {/* NG Rate Chart */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">NG Rate</div>
                    <ChartContainer config={{}} className="h-20 w-20 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "NG", value: 0.25, fill: "#ef4444" },
                              { name: "Good", value: 99.75, fill: "#e5e7eb" }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={15}
                            outerRadius={35}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="text-xs font-medium mt-1">0.25%</div>
                  </div>

                  {/* Operation Rate Chart */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">Operation Rate</div>
                    <ChartContainer config={{}} className="h-20 w-20 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Operating", value: 16.57, fill: "#22c55e" },
                              { name: "Idle", value: 83.43, fill: "#e5e7eb" }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={15}
                            outerRadius={35}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                          >
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                    <div className="text-xs font-medium mt-1">16.57%</div>
                  </div>
                </div>

                {/* Additional Info Row */}
                <div className="flex justify-between mx-14 gap-4 text-xs border-t border-border pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Output Rate</span>
                    <span className="font-mono">81.00%</span>
                  </div>
                  <div className="flex items-center gap-2 text-status-error">
                    <span className="text-muted-foreground">NG Rate</span>
                    <span className="font-mono">0.25%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Operation Rate</span>
                    <span className="font-mono">16.57%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Remote TACT Screen */}
      <RemoteTactScreen
        machine={remoteMachine}
        open={!!remoteMachine}
        onOpenChange={() => setRemoteMachine(null)}
      />
    </div>
  );
}
