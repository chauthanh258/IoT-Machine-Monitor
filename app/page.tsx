"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { OperatingStatus } from "@/components/screens/operating-status";
import { FactoryMap } from "@/components/screens/factory-map";
import { ProductionResults } from "@/components/screens/production-results";
import { ErrorHistory } from "@/components/screens/error-history";
import { MonitorData } from "@/components/screens/monitor-data";
import { RealtimeDashboard } from "@/components/screens/realtime-dashboard";
import { machines, errorEvents, productionData } from "@/lib/mock-data";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

function DashboardContent() {
  const [activeScreen, setActiveScreen] = useState("status");
  const { t } = useLanguage();

  const unresolvedErrors = useMemo(
    () => errorEvents.filter((e) => !e.resolved).length,
    []
  );

  const getScreenConfig = (screen: string) => {
    const configs: Record<string, { titleKey: string; subtitleKey: string }> = {
      status: { titleKey: "operatingStatus.title", subtitleKey: "operatingStatus.subtitle" },
      factory: { titleKey: "factoryMap.title", subtitleKey: "factoryMap.subtitle" },
      production: { titleKey: "production.title", subtitleKey: "production.subtitle" },
      errors: { titleKey: "errors.title", subtitleKey: "errors.subtitle" },
      monitor: { titleKey: "monitor.title", subtitleKey: "monitor.subtitle" },
      realtime: { titleKey: "realtime.title", subtitleKey: "realtime.subtitle" },
      notifications: { titleKey: "nav.notifications", subtitleKey: "" },
      export: { titleKey: "nav.exportData", subtitleKey: "" },
      settings: { titleKey: "nav.settings", subtitleKey: "" },
    };
    const config = configs[screen] || configs.status;
    return {
      title: t(config.titleKey),
      subtitle: config.subtitleKey ? t(config.subtitleKey) : undefined,
    };
  };

  const currentScreen = getScreenConfig(activeScreen);

  const renderScreen = () => {
    switch (activeScreen) {
      case "status":
        return <OperatingStatus machines={machines} />;
      case "factory":
        return <FactoryMap machines={machines} />;
      case "production":
        return <ProductionResults productionData={productionData} machines={machines} />;
      case "errors":
        return <ErrorHistory errorEvents={errorEvents} machines={machines} />;
      case "monitor":
        return <MonitorData machines={machines} />;
      case "realtime":
        return <RealtimeDashboard machines={machines} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">{currentScreen.title}</h2>
              <p className="text-muted-foreground">{t("common.underDevelopment")}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeScreen={activeScreen}
        onScreenChange={setActiveScreen}
        alertCount={unresolvedErrors}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={currentScreen.title}
          subtitle={currentScreen.subtitle}
          alertCount={unresolvedErrors}
        />
        <main className="flex-1 overflow-auto">{renderScreen()}</main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <DashboardContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
