"use client";

import { useState } from "react";
import type { Machine } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RotateCcw, Power, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

export function RemoteTactScreen({ machine, open, onOpenChange }: { machine: any; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [controlMode, setControlMode] = useState("Auto");

  if (!machine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl bg-card border border-border shadow-lg">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-3">
            <Factory className="w-6 h-6 text-primary" />
            Remote TACT Screen - {machine?.name || 'Machine'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="Operation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="Operation">Operation</TabsTrigger>
            <TabsTrigger value="Parameters">Parameters</TabsTrigger>
            <TabsTrigger value="Alarm History">Alarm History</TabsTrigger>
            <TabsTrigger value="Maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="Operation" className="space-y-6 mt-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-12 gap-6">
              {/* Control Mode Section */}
              <Card className="col-span-12">
                <CardHeader>
                  <CardTitle className="text-lg">Control Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {["Auto", "Semi-Auto", "Manual"].map((mode) => (
                      <Button
                        key={mode}
                        onClick={() => setControlMode(mode)}
                        variant={controlMode === mode ? "default" : "outline"}
                        className="h-12 text-sm font-medium"
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Parameters Section */}
              <Card className="col-span-8">
                <CardHeader>
                  <CardTitle className="text-lg">Machine Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Injection Setpoint</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="100" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="mm" readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Holding Setpoint</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="100" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="mm" readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Suck Back Setpoint</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="100" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="mm" readOnly />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Cooling Setpoint</label>
                        <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="200" readOnly />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Back Pressure</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="10" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="kgf/cm²" readOnly />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Cushion Setpoint</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="300" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="mm" readOnly />
                        </div>
                      </div>
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Current Position</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono" value="0.00 mm" readOnly />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Cycle Time</label>
                        <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="0.00" readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Planned End Time</label>
                        <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono" value="2015/06/28-08:15:11" readOnly />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Semi-Auto Confirmation</label>
                        <div className="flex bg-card border border-border rounded-md p-2">
                          <span className="text-sm px-3 py-1 bg-muted rounded">OFF</span>
                          <div className="bg-primary text-primary-foreground px-2 py-1 ml-2 rounded text-sm">▶</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Cure Timer</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="00.0" readOnly />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Unit</label>
                          <input className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm" value="s" readOnly />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Cure Position</label>
                        <div className="flex border border-border rounded-md overflow-hidden">
                          <button className="flex-1 px-3 py-2 bg-muted text-sm hover:bg-secondary">OFF</button>
                          <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm">ON</button>
                          <button className="flex-1 px-3 py-2 bg-muted text-sm hover:bg-secondary">OFF</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gauges Section */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="text-lg">Gauges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Position Gauge</div>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="w-full h-full rounded-full border-4 border-border relative">
                        <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-status-error origin-bottom -translate-x-1/2 -translate-y-full rotate-[45deg]" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-card border border-border px-3 py-1 rounded text-sm font-mono">
                          100 mm
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">0 - 300 mm</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">Pressure Gauge</div>
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="w-full h-full rounded-full border-4 border-border relative">
                        <div className="absolute top-1/2 left-1/2 w-1 h-12 bg-status-running origin-bottom -translate-x-1/2 -translate-y-full rotate-[90deg]" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-card border border-border px-3 py-1 rounded text-sm font-mono">
                          300 mm
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">0 - 500 mm</div>
                  </div>
                </CardContent>
              </Card>

              {/* Counters Section */}
              <Card className="col-span-12">
                <CardHeader>
                  <CardTitle className="text-lg">Production Counters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Data Summary</h4>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Shots</span>
                          <span className="font-mono text-status-warning">100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Error Shots</span>
                          <span className="font-mono text-status-error">00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">OK/Lot Count</span>
                          <span className="font-mono text-status-running">400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NG/Lot Count</span>
                          <span className="font-mono text-status-warning">320</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {["Reset cycle count", "Reset OK count", "Reset NG count", "Reset Margin Timer"].map((label, i) => (
                        <Button key={i} variant="outline" className="h-10 text-sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="Parameters" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Machine Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Parameters configuration panel will be implemented here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Alarm History" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alarm History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Alarm history and logs will be displayed here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="Maintenance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Maintenance schedules and procedures will be shown here.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}