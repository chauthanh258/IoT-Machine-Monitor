"use client";

import type { Machine, MachineStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

interface StatusOverviewProps {
  machines: Machine[];
}

const statusKeys: Record<MachineStatus, string> = {
  running: "status.running",
  manual: "status.running",
  alarmed: "status.warning",
  finished: "status.idle",
  error: "status.error",
  warning: "status.warning",
  offline: "status.offline",
};

const statusColors: Record<MachineStatus, string> = {
  running: "bg-status-running",
  manual: "bg-primary",
  alarmed: "bg-status-warning",
  finished: "bg-status-idle",
  error: "bg-status-error",
  warning: "bg-status-warning",
  offline: "bg-status-offline",
};

export function StatusOverview({ machines }: StatusOverviewProps) {
  const { t } = useLanguage();

  const statusCounts = machines.reduce(
    (acc, machine) => {
      acc[machine.status] = (acc[machine.status] || 0) + 1;
      return acc;
    },
    {} as Record<MachineStatus, number>
  );

  const totalMachines = machines.length;
  const runningMachines = statusCounts.running || 0;
  const errorMachines = (statusCounts.error || 0) + (statusCounts.alarmed || 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {/* Summary Cards */}
      <Card className="col-span-2 md:col-span-1 border-border">
        <CardContent className="p-4">
          <div className="text-3xl font-bold text-foreground">{totalMachines}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("operatingStatus.totalMachines")}</div>
        </CardContent>
      </Card>

      {/* <Card className="border-border">
        <CardContent className="p-4">
          <div className="text-3xl font-bold text-status-running">{runningMachines}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("operatingStatus.runningMachines")}</div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="text-3xl font-bold text-status-error">{errorMachines}</div>
          <div className="text-xs text-muted-foreground mt-1">{t("operatingStatus.errorMachines")}</div>
        </CardContent>
      </Card> */}

      {/* Status Breakdown */}
      {(["running", "error", "warning", "offline"] as MachineStatus[]).map((status) => (
        <Card key={status} className="border-border hidden lg:block">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", statusColors[status])} />
              <span className="text-lg font-semibold text-foreground">{statusCounts[status] || 0}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{t(statusKeys[status])}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
