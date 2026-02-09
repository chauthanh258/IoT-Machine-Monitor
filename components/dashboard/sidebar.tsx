"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Factory,
  BarChart3,
  AlertTriangle,
  Activity,
  Gauge,
  Settings,
  Bell,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

interface SidebarProps {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
  alertCount?: number;
}

const navItemKeys = [
  { id: "status", labelKey: "nav.operatingStatus", subKey: "nav.operatingStatusSub", icon: LayoutDashboard },
  // { id: "factory", labelKey: "nav.factoryMap", subKey: "nav.factoryMapSub", icon: Factory },
  { id: "production", labelKey: "nav.productionResults", subKey: "nav.productionResultsSub", icon: BarChart3 },
  { id: "errors", labelKey: "nav.eventHistory", subKey: "nav.eventHistorySub", icon: AlertTriangle, badge: true },
  { id: "monitor", labelKey: "nav.monitorData", subKey: "nav.monitorDataSub", icon: Activity },
  { id: "realtime", labelKey: "nav.realtimeData", subKey: "nav.realtimeDataSub", icon: Gauge },
];

const bottomItemKeys = [
  { id: "notifications", labelKey: "nav.notifications", icon: Bell },
  { id: "export", labelKey: "nav.exportData", icon: Download },
  { id: "settings", labelKey: "nav.settings", icon: Settings },
];

export function Sidebar({ activeScreen, onScreenChange, alertCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useLanguage();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Factory className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground text-sm">IoT Monitor</span>
            <span className="text-xs text-muted-foreground">v3.2.1</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <div className={cn("text-xs font-medium text-muted-foreground mb-2", collapsed ? "px-2" : "px-3")}>
          {!collapsed && t("nav.monitoring")}
        </div>
        {navItemKeys.map((item) => (
          <Button
            key={item.id}
            variant={activeScreen === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10 text-sidebar-foreground",
              activeScreen === item.id && "bg-sidebar-accent text-sidebar-accent-foreground",
              collapsed && "justify-center px-2"
            )}
            onClick={() => onScreenChange(item.id)}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <div className="flex flex-col items-start flex-1 overflow-hidden">
                <span className="text-sm truncate">{t(item.labelKey)}</span>
                <span className="text-[10px] text-muted-foreground truncate">{t(item.subKey)}</span>
              </div>
            )}
            {!collapsed && item.badge && alertCount > 0 && (
              <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0">
                {alertCount}
              </Badge>
            )}
          </Button>
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="py-4 px-2 border-t border-sidebar-border space-y-1">
        {bottomItemKeys.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-9 text-muted-foreground hover:text-sidebar-foreground",
              collapsed && "justify-center px-2"
            )}
            onClick={() => onScreenChange(item.id)}
          >
            <item.icon className="w-4 h-4" />
            {!collapsed && <span className="text-sm">{t(item.labelKey)}</span>}
          </Button>
        ))}
      </div>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
