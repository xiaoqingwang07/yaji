import { Platform } from "react-native";

/**
 * 芽纪 Visual System v5 — 私人健康档案
 * 视觉目标：清透、克制、有秩序。信息先于装饰，重点内容一眼可见。
 */
export const colors = {
  bg: "#F6F8F7",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  bgDeep: "#E8F0EC",

  text: "#17221D",
  textSecondary: "#46554D",
  textMuted: "#748178",
  separator: "rgba(23, 34, 29, 0.10)",
  fill: "rgba(40, 115, 95, 0.08)",
  fillStrong: "rgba(40, 115, 95, 0.16)",

  brand: "#28735F",
  brandSoft: "#E1F0EA",
  brandDark: "#1E5D4D",
  brandDeep: "#143E34",
  brandGlow: "rgba(40, 115, 95, 0.14)",

  link: "#1E5D4D",
  danger: "#B84E4E",
  dangerSoft: "rgba(184, 78, 78, 0.10)",

  accent: "#D7665B",
  accentSoft: "rgba(215, 102, 91, 0.12)",
  accentGlow: "rgba(215, 102, 91, 0.16)",

  rose: "#C97E94",
  roseSoft: "rgba(201, 126, 148, 0.14)",
  lemon: "#B9943E",
  lemonSoft: "rgba(185, 148, 62, 0.14)",
  sky: "#5E8CA8",
  skySoft: "rgba(94, 140, 168, 0.14)",

  warning: "#A6782B",
  warningSoft: "rgba(166, 120, 43, 0.13)",
  success: "#28735F",

  skeleton: "rgba(116, 129, 120, 0.16)",
  border: "rgba(23, 34, 29, 0.10)",
  warmCard: "#EEF5F1",
  warmCardAlt: "#FAF0EE",
  whyWash: "#F1F6F3",
} as const;

export const metricPalette = {
  heart: { bg: "#FBE8E5", fg: "#B85047", glow: "rgba(184, 80, 71, 0.10)" },
  ruler: { bg: "#E1F0EA", fg: "#1E5D4D", glow: "rgba(30, 93, 77, 0.10)" },
  weight: { bg: "#F8F0D9", fg: "#967327", glow: "rgba(150, 115, 39, 0.10)" },
  pressure: { bg: "#E6F0F5", fg: "#3F718F", glow: "rgba(63, 113, 143, 0.10)" },
  baby: { bg: "#F7E8ED", fg: "#9A5369", glow: "rgba(154, 83, 105, 0.10)" },
  default: { bg: "#EEF1EF", fg: "#53645B", glow: "rgba(83, 100, 91, 0.08)" },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
  screen: 20,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 8,
  xl: 12,
  pill: 999,
} as const;

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: "#17221D", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
    android: { elevation: 1 },
    web: { boxShadow: "0 1px 6px rgba(23,34,29,0.04)" },
    default: {},
  }) as Record<string, unknown>,
  md: Platform.select({
    ios: { shadowColor: "#17221D", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 12 },
    android: { elevation: 2 },
    web: { boxShadow: "0 3px 12px rgba(23,34,29,0.06)" },
    default: {},
  }) as Record<string, unknown>,
  lg: Platform.select({
    ios: { shadowColor: "#17221D", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 18 },
    android: { elevation: 3 },
    web: { boxShadow: "0 6px 18px rgba(23,34,29,0.08)" },
    default: {},
  }) as Record<string, unknown>,
};

export const fontFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  web: '"PingFang SC", "Noto Sans SC", "Helvetica Neue", sans-serif',
  default: undefined,
});

export const fontFamilySans = fontFamily;
export const fontFamilyDisplay = fontFamily;

export const WARM_COPY = {
  loginTagline: "把每一次看诊，收进一份完整档案",
  loginBrand: "家庭孕育档案",
  meGreeting: (name: string) => (name ? `你好，${name}` : "你好"),
  meSoft: "这份档案，只属于你们一家",
  meAiLine: "报告解读、趋势和下一步，都由你确认后入档",
  healthLead: "同一份档案，看清每一次变化",
  emptyNext: "收下一份报告后，芽纪会帮你接上下一步。",
  emptyArchive: "还没有档案记录",
  emptyArchiveHint: "从收下第一份报告开始。",
  healthEmpty: "归档报告或记下一条数据后，这里会形成趋势。",
  nowCompanion: "属于你们一家的孕育档案",
  nowBringIn: "上传报告，获得解读并归档",
  collectAction: "解读一份报告",
  nowExtra: "档案变化",
  aiAssistHint: "AI 整理 · 由你确认后入档",
  confirmSuccess: "这份报告已归入档案",
  confirmSuccessHint: "解读、趋势和下一步已同步更新。",
  whyLabel: "为什么会出现在这里",
} as const;

export const typography = {
  brand: { fontFamily, fontSize: 30, fontWeight: "700" as const, letterSpacing: 0, color: colors.text },
  largeTitle: { fontFamily, fontSize: 28, fontWeight: "700" as const, letterSpacing: 0, lineHeight: 36, color: colors.text },
  heroNumber: {
    fontFamily: fontFamilyDisplay,
    fontSize: 64,
    fontWeight: "700" as const,
    letterSpacing: 0,
    color: colors.text,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  metric: { fontFamily: fontFamilySans, fontSize: 28, fontWeight: "700" as const, color: colors.text, letterSpacing: 0, fontVariant: ["tabular-nums"] as ("tabular-nums")[] },
  title: { fontFamily, fontSize: 22, fontWeight: "700" as const, letterSpacing: 0, lineHeight: 30, color: colors.text },
  editorial: { fontFamily, fontSize: 19, fontWeight: "700" as const, letterSpacing: 0, color: colors.text },
  headline: { fontFamily: fontFamilySans, fontSize: 17, fontWeight: "700" as const, letterSpacing: 0, color: colors.text },
  subtitle: { fontFamily: fontFamilySans, fontSize: 16, fontWeight: "600" as const, color: colors.text },
  body: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "400" as const, color: colors.text, lineHeight: 23 },
  callout: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "400" as const, color: colors.textMuted, lineHeight: 20 },
  caption: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "500" as const, color: colors.textMuted, lineHeight: 17, letterSpacing: 0 },
  footnote: { fontFamily: fontFamilySans, fontSize: 11, fontWeight: "400" as const, color: colors.textMuted, lineHeight: 16 },
  overline: { fontFamily: fontFamilySans, fontSize: 11, fontWeight: "700" as const, letterSpacing: 0, color: colors.textMuted },
};

export const touchMin = 44;

export const DISCLAIMERS = {
  report: "AI 整理结果仅供记录，请以原始报告和医生意见为准。",
  stageSummary: "小结仅汇总您的档案记录，不构成医学结论，请以医生意见为准。",
  calendar: "参考日程，以医生安排为准",
  recording: "录音仅存入您自己的档案；请遵守就诊场所相关规定。",
} as const;

export const WHY_BOUNDARY = "标准日程与档案事实仅供参考，以医生实际安排为准。";
