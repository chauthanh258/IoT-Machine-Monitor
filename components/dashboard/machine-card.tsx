"use client";

import { cn } from "@/lib/utils";
import type { Machine, MachineStatus } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Cog, ExternalLink, BarChart2, AlertCircle, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface MachineCardProps {
  machine: Machine;
  onClick?: (machine: Machine) => void;
  onViewDetails?: (machine: Machine) => void;
  onViewProduction?: (machine: Machine) => void;
  onRemoteAccess?: (machine: Machine) => void;
  compact?: boolean;
}

const statusConfig: Record<MachineStatus, { color: string; bg: string; labelKey: string; pulse?: boolean }> = {
  running: { color: "text-status-running", bg: "bg-status-running", labelKey: "status.running", pulse: true },
  manual: { color: "text-primary", bg: "bg-primary", labelKey: "status.running" },
  alarmed: { color: "text-status-warning", bg: "bg-status-warning", labelKey: "status.warning", pulse: true },
  finished: { color: "text-status-idle", bg: "bg-status-idle", labelKey: "status.idle" },
  error: { color: "text-status-error", bg: "bg-status-error", labelKey: "status.error", pulse: true },
  warning: { color: "text-status-warning", bg: "bg-status-warning", labelKey: "status.warning" },
  offline: { color: "text-status-offline", bg: "bg-status-offline", labelKey: "status.offline" },
};

export function MachineCard({
  machine,
  onClick,
  onViewDetails,
  onViewProduction,
  onRemoteAccess,
  compact = false,
}: MachineCardProps) {
  const { t } = useLanguage();
  const status = statusConfig[machine.status];

  if (compact) {
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => onClick?.(machine)}
            className={cn(
              "relative w-16 h-16 rounded-lg border border-border bg-card hover:bg-accent transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer",
              machine.status === "error" && "border-status-error",
              machine.status === "warning" && "border-status-warning"
            )}
          >
            <div className={cn("w-8 h-8 rounded-md flex items-center justify-center", status.bg, status.bg.replace("bg-", "bg-opacity-20"))}>
              <Cog className={cn("w-5 h-5", status.color)} />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-full text-center px-1">
              {machine.id}
            </span>
            <div className={cn("absolute top-1 right-1 w-2 h-2 rounded-full", status.bg, status.pulse && "animate-pulse")} />
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => onViewDetails?.(machine)}>
            <AlertCircle className="w-4 h-4 mr-2" />
            {t("operatingStatus.viewDetails")}
          </ContextMenuItem>
          {/* <ContextMenuItem onClick={() => onViewProduction?.(machine)}>
            <BarChart2 className="w-4 h-4 mr-2" />
            {t("production.title")}
          </ContextMenuItem> */}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onRemoteAccess?.(machine)}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Remote TACT Screen
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          className={cn(
            "cursor-pointer hover:bg-accent/50 transition-colors border-border",
            machine.status === "error" && "border-status-error",
            machine.status === "warning" && "border-status-warning"
          )}
          onClick={() => onClick?.(machine)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", status.bg, "bg-opacity-20")}>
                  <Cog className={cn("w-6 h-6", status.color)} />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{machine.name}</h3>
                  <p className="text-xs text-muted-foreground">{machine.model}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("text-xs", status.color, "border-current")}>
                <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", status.bg, status.pulse && "animate-pulse")} />
                {t(status.labelKey)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t("operatingStatus.cycleTime")}:</span>
                <span className="font-mono text-foreground">{machine.parameters.cycleTime.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t("operatingStatus.shotCount")}:</span>
                <span className="font-mono text-foreground">{machine.parameters.shotCounter.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("operatingStatus.today")}</span>
                <span className="font-mono text-foreground">{machine.parameters.productionNumber} pcs</span>
              </div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", status.bg)}
                  style={{ width: `${Math.min((machine.parameters.productionNumber / 1000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => onViewDetails?.(machine)}>
          <AlertCircle className="w-4 h-4 mr-2" />
          {t("operatingStatus.viewDetails")}
        </ContextMenuItem>
        {/* <ContextMenuItem onClick={() => onViewProduction?.(machine)}>
          <BarChart2 className="w-4 h-4 mr-2" />
          {t("production.title")}
        </ContextMenuItem> */}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onRemoteAccess?.(machine)}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Remote TACT Screen
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
