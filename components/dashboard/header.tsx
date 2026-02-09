"use client";

import { Bell, Search, RefreshCw, Globe, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useLanguage, languages, type Language } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";

interface HeaderProps {
  title: string;
  subtitle?: string;
  alertCount?: number;
}

export function Header({ title, subtitle, alertCount = 0 }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getThemeIcon = () => {
    if (theme === "system") return <Monitor className="w-4 h-4" />;
    if (resolvedTheme === "light") return <Sun className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  const getCurrentLanguageFlag = () => {
    const current = languages.find((l) => l.code === language);
    return current?.flag || "";
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("header.search")}
            className="w-64 pl-9 bg-secondary border-border"
          />
        </div>

        {/* Time Display */}
        <div className="text-right hidden lg:block">
          <div className="text-sm font-mono text-foreground">
            {currentTime.toLocaleTimeString(language === "vi" ? "vi-VN" : language === "ja" ? "ja-JP" : "en-US")}
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTime.toLocaleDateString(language === "vi" ? "vi-VN" : language === "ja" ? "ja-JP" : "en-US")}
          </div>
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="text-muted-foreground hover:text-foreground"
          title={t("common.refresh")}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>

        {/* Theme Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border min-w-[140px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {language === "vi" ? "Giao diện" : language === "ja" ? "テーマ" : "Theme"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={theme === "light" ? "bg-accent" : ""}
            >
              <Sun className="w-4 h-4 mr-2" />
              {t("theme.light")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={theme === "dark" ? "bg-accent" : ""}
            >
              <Moon className="w-4 h-4 mr-2" />
              {t("theme.dark")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={theme === "system" ? "bg-accent" : ""}
            >
              <Monitor className="w-4 h-4 mr-2" />
              {t("theme.system")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground text-base">
              <span className="text-lg">{getCurrentLanguageFlag()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border min-w-[160px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {language === "vi" ? "Ngon ngu" : language === "ja" ? "言語" : "Language"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code as Language)}
                className={language === lang.code ? "bg-accent" : ""}
              >
                <span className="mr-2 text-lg">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
            >
              {alertCount > 9 ? "9+" : alertCount}
            </Badge>
          )}
        </Button>

        {/* Connection Status */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-2 h-2 rounded-full bg-status-running animate-pulse" />
          <span className="text-xs text-muted-foreground">{t("header.connected")}</span>
        </div>
      </div>
    </header>
  );
}
