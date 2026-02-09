"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "vi" | "en" | "ja";

export const languages: { code: Language; name: string; flag: string }[] = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
];

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Navigation
    "nav.monitoring": "GIÁM SÁT",
    "nav.operatingStatus": "Trạng thái hoạt động",
    "nav.operatingStatusSub": "Tổng quan máy",
    "nav.factoryMap": "Sơ đồ nhà máy",
    "nav.factoryMapSub": "Bố trí mặt bằng",
    "nav.productionResults": "Kết quả sản xuất",
    "nav.productionResultsSub": "Quản lý sản lượng",
    "nav.eventHistory": "Lịch sử sự kiện",
    "nav.eventHistorySub": "Theo dõi lỗi",
    "nav.monitorData": "Dữ liệu giám sát",
    "nav.monitorDataSub": "Phân tích sóng",
    "nav.realtimeData": "Dữ liệu thời gian thực",
    "nav.realtimeDataSub": "Bảng điều khiển trực tiếp",
    "nav.notifications": "Thông báo",
    "nav.exportData": "Xuất dữ liệu",
    "nav.settings": "Cài đặt",

    // Header
    "header.search": "Tìm kiếm máy...",
    "header.connected": "Đã kết nối",
    "header.disconnected": "Ngắt kết nối",

    // Status
    "status.running": "Đang chạy",
    "status.idle": "Chờ",
    "status.warning": "Cảnh báo",
    "status.error": "Lỗi",
    "status.offline": "Ngoại tuyến",
    "status.maintenance": "Bảo trì",

    // Operating Status Screen
    "operatingStatus.title": "Trạng thái hoạt động",
    "operatingStatus.subtitle": "Tổng quan máy",
    "operatingStatus.totalMachines": "Tổng số máy",
    "operatingStatus.runningMachines": "Đang chạy",
    "operatingStatus.idleMachines": "Chờ",
    "operatingStatus.errorMachines": "Lỗi",
    "operatingStatus.gridView": "Dạng lưới",
    "operatingStatus.listView": "Dạng danh sách",
    "operatingStatus.allStatus": "Tất cả trạng thái",
    "operatingStatus.viewDetails": "Xem chi tiết",
    "operatingStatus.efficiency": "Hiệu suất",
    "operatingStatus.cycleTime": "Thời gian chu kỳ",
    "operatingStatus.shotCount": "Số lần phun",
    "operatingStatus.today": "Hôm nay",
    "operatingStatus.temperature": "Nhiệt độ",
    "operatingStatus.pressure": "Áp suất",
    "operatingStatus.currentMold": "Khuôn hiện tại",
    "operatingStatus.currentMaterial": "Vật liệu hiện tại",

    // Factory Map
    "factoryMap.title": "Sơ đồ nhà máy",
    "factoryMap.subtitle": "Bố trí mặt bằng",
    "factoryMap.zoomIn": "Phóng to",
    "factoryMap.zoomOut": "Thu nhỏ",
    "factoryMap.resetView": "Đặt lại",
    "factoryMap.server": "Máy chủ",
    "factoryMap.legend": "Chú thích",

    // Production Results
    "production.title": "Kết quả sản xuất",
    "production.subtitle": "Quản lý sản lượng",
    "production.planned": "Kế hoạch",
    "production.actual": "Thực tế",
    "production.defects": "Phế phẩm",
    "production.rate": "Tỷ lệ",
    "production.daily": "Hàng ngày",
    "production.weekly": "Hàng tuần",
    "production.monthly": "Hàng tháng",
    "production.machine": "Máy",
    "production.lot": "Lô",
    "production.date": "Ngày",
    "production.outputChart": "Biểu đồ sản lượng",
    "production.defectRate": "Tỷ lệ phế phẩm",
    "production.summary": "Tóm tắt",

    // Error History
    "errors.title": "Lịch sử sự kiện",
    "errors.subtitle": "Theo dõi lỗi",
    "errors.all": "Tất cả",
    "errors.critical": "Nghiêm trọng",
    "errors.warning": "Cảnh báo",
    "errors.info": "Thông tin",
    "errors.resolved": "Đã giải quyết",
    "errors.unresolved": "Chưa giải quyết",
    "errors.errorCode": "Mã lỗi",
    "errors.description": "Mô tả",
    "errors.time": "Thời gian",
    "errors.duration": "Thời lượng",
    "errors.action": "Hành động",
    "errors.viewDetails": "Xem chi tiết",
    "errors.markResolved": "Đánh dấu đã giải quyết",
    "errors.distribution": "Phân bố lỗi",
    "errors.timeline": "Dòng thời gian",

    // Monitor Data
    "monitor.title": "Dữ liệu giám sát",
    "monitor.subtitle": "Phân tích sóng",
    "monitor.waveform": "Dạng sóng",
    "monitor.parameters": "Thông số",
    "monitor.injection": "Phun",
    "monitor.holding": "Giữ áp",
    "monitor.cooling": "Làm mát",
    "monitor.ejection": "Đẩy ra",
    "monitor.setValue": "Giá trị đặt",
    "monitor.actualValue": "Giá trị thực",
    "monitor.deviation": "Độ lệch",
    "monitor.selectMachine": "Chọn máy",
    "monitor.selectParameter": "Chọn thông số",

    // Real-time Dashboard
    "realtime.title": "Dữ liệu thời gian thực",
    "realtime.subtitle": "Bảng điều khiển trực tiếp",
    "realtime.live": "TRỰC TIẾP",
    "realtime.lastUpdate": "Cập nhật lần cuối",
    "realtime.barrelTemp": "Nhiệt độ xi lanh",
    "realtime.moldTemp": "Nhiệt độ khuôn",
    "realtime.injectionPressure": "Áp suất phun",
    "realtime.clampingForce": "Lực kẹp",
    "realtime.screwPosition": "Vị trí trục vít",
    "realtime.screwSpeed": "Tốc độ trục vít",
    "realtime.zones": "Các vùng",

    // Common
    "common.close": "Đóng",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.filter": "Lọc",
    "common.export": "Xuất",
    "common.refresh": "Làm mới",
    "common.loading": "Đang tải...",
    "common.noData": "Không có dữ liệu",
    "common.underDevelopment": "Màn hình này đang được phát triển.",

    // Theme
    "theme.light": "Sáng",
    "theme.dark": "Tối",
    "theme.system": "Hệ thống",
  },

  en: {
    // Navigation
    "nav.monitoring": "MONITORING",
    "nav.operatingStatus": "Operating Status",
    "nav.operatingStatusSub": "Machine Overview",
    "nav.factoryMap": "Factory Map",
    "nav.factoryMapSub": "Layout View",
    "nav.productionResults": "Production Results",
    "nav.productionResultsSub": "Output Management",
    "nav.eventHistory": "Event History",
    "nav.eventHistorySub": "Error Tracking",
    "nav.monitorData": "Monitor Data",
    "nav.monitorDataSub": "Waveform Analysis",
    "nav.realtimeData": "Real-Time Data",
    "nav.realtimeDataSub": "Live Dashboard",
    "nav.notifications": "Notifications",
    "nav.exportData": "Export Data",
    "nav.settings": "Settings",

    // Header
    "header.search": "Search machines...",
    "header.connected": "Connected",
    "header.disconnected": "Disconnected",

    // Status
    "status.running": "Running",
    "status.idle": "Idle",
    "status.warning": "Warning",
    "status.error": "Error",
    "status.offline": "Offline",
    "status.maintenance": "Maintenance",

    // Operating Status Screen
    "operatingStatus.title": "Operating Status",
    "operatingStatus.subtitle": "Machine Overview",
    "operatingStatus.totalMachines": "Total Machines",
    "operatingStatus.runningMachines": "Running",
    "operatingStatus.idleMachines": "Idle",
    "operatingStatus.errorMachines": "Error",
    "operatingStatus.gridView": "Grid View",
    "operatingStatus.listView": "List View",
    "operatingStatus.allStatus": "All Status",
    "operatingStatus.viewDetails": "View Details",
    "operatingStatus.efficiency": "Efficiency",
    "operatingStatus.cycleTime": "Cycle Time",
    "operatingStatus.shotCount": "Shot Count",
    "operatingStatus.today": "Today",
    "operatingStatus.temperature": "Temperature",
    "operatingStatus.pressure": "Pressure",
    "operatingStatus.currentMold": "Current Mold",
    "operatingStatus.currentMaterial": "Current Material",

    // Factory Map
    "factoryMap.title": "Factory Map",
    "factoryMap.subtitle": "Layout View",
    "factoryMap.zoomIn": "Zoom In",
    "factoryMap.zoomOut": "Zoom Out",
    "factoryMap.resetView": "Reset",
    "factoryMap.server": "Server",
    "factoryMap.legend": "Legend",

    // Production Results
    "production.title": "Production Results",
    "production.subtitle": "Output Management",
    "production.planned": "Planned",
    "production.actual": "Actual",
    "production.defects": "Defects",
    "production.rate": "Rate",
    "production.daily": "Daily",
    "production.weekly": "Weekly",
    "production.monthly": "Monthly",
    "production.machine": "Machine",
    "production.lot": "Lot",
    "production.date": "Date",
    "production.outputChart": "Output Chart",
    "production.defectRate": "Defect Rate",
    "production.summary": "Summary",

    // Error History
    "errors.title": "Event History",
    "errors.subtitle": "Error Tracking",
    "errors.all": "All",
    "errors.critical": "Critical",
    "errors.warning": "Warning",
    "errors.info": "Info",
    "errors.resolved": "Resolved",
    "errors.unresolved": "Unresolved",
    "errors.errorCode": "Error Code",
    "errors.description": "Description",
    "errors.time": "Time",
    "errors.duration": "Duration",
    "errors.action": "Action",
    "errors.viewDetails": "View Details",
    "errors.markResolved": "Mark Resolved",
    "errors.distribution": "Error Distribution",
    "errors.timeline": "Timeline",

    // Monitor Data
    "monitor.title": "Monitor Data",
    "monitor.subtitle": "Waveform Analysis",
    "monitor.waveform": "Waveform",
    "monitor.parameters": "Parameters",
    "monitor.injection": "Injection",
    "monitor.holding": "Holding",
    "monitor.cooling": "Cooling",
    "monitor.ejection": "Ejection",
    "monitor.setValue": "Set Value",
    "monitor.actualValue": "Actual Value",
    "monitor.deviation": "Deviation",
    "monitor.selectMachine": "Select Machine",
    "monitor.selectParameter": "Select Parameter",

    // Real-time Dashboard
    "realtime.title": "Real-Time Data",
    "realtime.subtitle": "Live Dashboard",
    "realtime.live": "LIVE",
    "realtime.lastUpdate": "Last Update",
    "realtime.barrelTemp": "Barrel Temperature",
    "realtime.moldTemp": "Mold Temperature",
    "realtime.injectionPressure": "Injection Pressure",
    "realtime.clampingForce": "Clamping Force",
    "realtime.screwPosition": "Screw Position",
    "realtime.screwSpeed": "Screw Speed",
    "realtime.zones": "Zones",

    // Common
    "common.close": "Close",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.refresh": "Refresh",
    "common.loading": "Loading...",
    "common.noData": "No data",
    "common.underDevelopment": "This screen is under development.",

    // Theme
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
  },

  ja: {
    // Navigation
    "nav.monitoring": "モニタリング",
    "nav.operatingStatus": "稼働状況",
    "nav.operatingStatusSub": "総合画面",
    "nav.factoryMap": "工場マップ",
    "nav.factoryMapSub": "工場レイアウト",
    "nav.productionResults": "生産実績",
    "nav.productionResultsSub": "生産数管理",
    "nav.eventHistory": "イベント履歴",
    "nav.eventHistorySub": "異常発生履歴",
    "nav.monitorData": "モニタデータ",
    "nav.monitorDataSub": "波形分析",
    "nav.realtimeData": "リアルタイムデータ",
    "nav.realtimeDataSub": "リアルデータ",
    "nav.notifications": "通知",
    "nav.exportData": "データ出力",
    "nav.settings": "設定",

    // Header
    "header.search": "機械を検索...",
    "header.connected": "接続済み",
    "header.disconnected": "切断",

    // Status
    "status.running": "稼働中",
    "status.idle": "待機中",
    "status.warning": "警告",
    "status.error": "エラー",
    "status.offline": "オフライン",
    "status.maintenance": "メンテナンス",

    // Operating Status Screen
    "operatingStatus.title": "稼働状況",
    "operatingStatus.subtitle": "総合画面",
    "operatingStatus.totalMachines": "総機械数",
    "operatingStatus.runningMachines": "稼働中",
    "operatingStatus.idleMachines": "待機中",
    "operatingStatus.errorMachines": "エラー",
    "operatingStatus.gridView": "グリッド表示",
    "operatingStatus.listView": "リスト表示",
    "operatingStatus.allStatus": "すべてのステータス",
    "operatingStatus.viewDetails": "詳細を見る",
    "operatingStatus.efficiency": "効率",
    "operatingStatus.cycleTime": "サイクルタイム",
    "operatingStatus.shotCount": "ショット数",
    "operatingStatus.today": "今日",
    "operatingStatus.temperature": "温度",
    "operatingStatus.pressure": "圧力",
    "operatingStatus.currentMold": "現在の金型",
    "operatingStatus.currentMaterial": "現在の材料",

    // Factory Map
    "factoryMap.title": "工場マップ",
    "factoryMap.subtitle": "工場レイアウト",
    "factoryMap.zoomIn": "拡大",
    "factoryMap.zoomOut": "縮小",
    "factoryMap.resetView": "リセット",
    "factoryMap.server": "サーバー",
    "factoryMap.legend": "凡例",

    // Production Results
    "production.title": "生産実績",
    "production.subtitle": "生産数管理",
    "production.planned": "計画",
    "production.actual": "実績",
    "production.defects": "不良品",
    "production.rate": "達成率",
    "production.daily": "日次",
    "production.weekly": "週次",
    "production.monthly": "月次",
    "production.machine": "機械",
    "production.lot": "ロット",
    "production.date": "日付",
    "production.outputChart": "生産数チャート",
    "production.defectRate": "不良率",
    "production.summary": "サマリー",

    // Error History
    "errors.title": "イベント履歴",
    "errors.subtitle": "異常発生履歴",
    "errors.all": "すべて",
    "errors.critical": "重大",
    "errors.warning": "警告",
    "errors.info": "情報",
    "errors.resolved": "解決済み",
    "errors.unresolved": "未解決",
    "errors.errorCode": "エラーコード",
    "errors.description": "説明",
    "errors.time": "時間",
    "errors.duration": "継続時間",
    "errors.action": "アクション",
    "errors.viewDetails": "詳細を見る",
    "errors.markResolved": "解決済みにする",
    "errors.distribution": "エラー分布",
    "errors.timeline": "タイムライン",

    // Monitor Data
    "monitor.title": "モニタデータ",
    "monitor.subtitle": "波形分析",
    "monitor.waveform": "波形",
    "monitor.parameters": "パラメータ",
    "monitor.injection": "射出",
    "monitor.holding": "保圧",
    "monitor.cooling": "冷却",
    "monitor.ejection": "突出し",
    "monitor.setValue": "設定値",
    "monitor.actualValue": "実測値",
    "monitor.deviation": "偏差",
    "monitor.selectMachine": "機械を選択",
    "monitor.selectParameter": "パラメータを選択",

    // Real-time Dashboard
    "realtime.title": "リアルタイムデータ",
    "realtime.subtitle": "リアルデータ",
    "realtime.live": "ライブ",
    "realtime.lastUpdate": "最終更新",
    "realtime.barrelTemp": "バレル温度",
    "realtime.moldTemp": "金型温度",
    "realtime.injectionPressure": "射出圧力",
    "realtime.clampingForce": "型締力",
    "realtime.screwPosition": "スクリュー位置",
    "realtime.screwSpeed": "スクリュー回転数",
    "realtime.zones": "ゾーン",

    // Common
    "common.close": "閉じる",
    "common.save": "保存",
    "common.cancel": "キャンセル",
    "common.filter": "フィルター",
    "common.export": "出力",
    "common.refresh": "更新",
    "common.loading": "読み込み中...",
    "common.noData": "データなし",
    "common.underDevelopment": "この画面は開発中です。",

    // Theme
    "theme.light": "ライト",
    "theme.dark": "ダーク",
    "theme.system": "システム",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("vi");

  const t = useCallback(
    (key: string): string => {
      const langTranslations = translations[language] || translations.en;
      const enTranslations = translations.en;
      return langTranslations[key] || enTranslations[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
