import { Platform } from "react-native";

/**
 * 芽纪 Visual System v4 — 「纸上叙事」
 * 一眼差异：全幅孕周舞台 / 无设置页分组 / 真实衬线数字 / 底栏选中胶囊
 */

export const colors = {
  /** 画布：亚麻纸 */
  bg: "#F3EEE6",
  /** 内容面 */
  surface: "#FFFCF8",
  surfaceElevated: "#FFFFFF",
  bgDeep: "#E8E0D4",

  text: "#1A1612",
  textSecondary: "#5A4E44",
  textMuted: "#8F8276",
  separator: "rgba(26, 22, 18, 0.07)",
  fill: "rgba(46, 107, 88, 0.08)",
  fillStrong: "rgba(46, 107, 88, 0.14)",

  brand: "#2E6B58",
  brandSoft: "#DCEBE4",
  brandDark: "#1F4F41",
  brandDeep: "#163D32",
  brandGlow: "rgba(46, 107, 88, 0.18)",

  link: "#2E6B58",
  danger: "#B45454",
  dangerSoft: "rgba(180, 84, 84, 0.10)",

  accent: "#C4784A",
  accentSoft: "rgba(196, 120, 74, 0.14)",
  accentGlow: "rgba(196, 120, 74, 0.22)",

  rose: "#C9A0AE",
  roseSoft: "rgba(201, 160, 174, 0.22)",
  lemon: "#D4C07A",
  lemonSoft: "rgba(212, 192, 122, 0.28)",
  sky: "#8AADBE",
  skySoft: "rgba(138, 173, 190, 0.22)",

  warning: "#B8834A",
  warningSoft: "rgba(184, 131, 74, 0.14)",
  success: "#2E6B58",

  skeleton: "rgba(143, 130, 118, 0.14)",
  border: "rgba(26, 22, 18, 0.08)",
  /** 孕周舞台底：晨雾金绿渐变起点 */
  warmCard: "#E8F0EA",
  warmCardAlt: "#EDE6DC",
  /** why 区块底 */
  whyWash: "rgba(46, 107, 88, 0.06)",
} as const;

export const metricPalette = {
  heart: { bg: "#F8E4DE", fg: "#B45A48", glow: "rgba(180, 90, 72, 0.12)" },
  ruler: { bg: "#DCEBE4", fg: "#1F4F41", glow: "rgba(31, 79, 65, 0.10)" },
  weight: { bg: "#F2E6D4", fg: "#9A6A30", glow: "rgba(154, 106, 48, 0.10)" },
  pressure: { bg: "#DEE8F0", fg: "#3E6E8A", glow: "rgba(62, 110, 138, 0.10)" },
  baby: { bg: "#F0E2EA", fg: "#8A4E6E", glow: "rgba(138, 78, 110, 0.10)" },
  default: { bg: "#E8E2DA", fg: "#6A5C52", glow: "rgba(106, 92, 82, 0.08)" },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 32,
  xxl: 48,
  screen: 22,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const shadows = {
  sm: Platform.select({
    ios: { shadowColor: "#1A1612", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8 },
    android: { elevation: 1 },
    web: { boxShadow: "0 1px 8px rgba(26,22,18,0.05)" },
    default: {},
  }) as Record<string, unknown>,
  md: Platform.select({
    ios: { shadowColor: "#1A1612", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 24 },
    android: { elevation: 3 },
    web: { boxShadow: "0 6px 24px rgba(26,22,18,0.08)" },
    default: {},
  }) as Record<string, unknown>,
  lg: Platform.select({
    ios: { shadowColor: "#1A1612", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 36 },
    android: { elevation: 6 },
    web: { boxShadow: "0 12px 36px rgba(26,22,18,0.12)" },
    default: {},
  }) as Record<string, unknown>,
};

/** 中文标题：衬线 */
export const fontFamily = Platform.select({
  ios: "System",
  android: "serif",
  web: '"Noto Serif SC", "Cormorant Garamond", Georgia, "PingFang SC", serif',
  default: undefined,
});

export const fontFamilySans = Platform.select({
  ios: "System",
  android: "sans-serif",
  web: '"DM Sans", "PingFang SC", "Noto Sans SC", "Helvetica Neue", sans-serif',
  default: undefined,
});

/** Hero 数字 */
export const fontFamilyDisplay = Platform.select({
  ios: "System",
  android: "serif",
  web: '"Cormorant Garamond", "Noto Serif SC", Georgia, serif',
  default: undefined,
});

export const WARM_COPY = {
  loginTagline: "把每一次看诊，收成家里能翻开的故事",
  loginBrand: "家庭孕育档案",
  meGreeting: (name: string) => (name ? `你好，${name}` : "你好"),
  meSoft: "这份档案，只属于你们一家",
  meAiLine: "芽纪帮读报告、提醒下一步，全部由你确认后才入档",
  healthLead: "数字慢慢连成线",
  emptyNext: "看完医生后，下一步会出现在这里",
  emptyArchive: "还没有故事",
  emptyArchiveHint: "看完医生后，「收下报告」开始记录",
  healthEmpty: "还没有记录。归档报告后会出现在这里。",
  nowCompanion: "此刻先看清下一件要紧事",
  nowBringIn: "把纸质报告收进家里",
  collectAction: "收下报告",
  nowExtra: "痕迹与携带",
  aiAssistHint: "AI 帮读 · 需你确认",
  confirmSuccess: "已收进档案",
  confirmSuccessHint: "下一步已更新。解读只供理解，请以医生意见为准",
  whyLabel: "为什么常会安排",
} as const;

export const typography = {
  brand: {
    fontFamily,
    fontSize: 34,
    fontWeight: "700" as const,
    letterSpacing: 2,
    color: colors.text,
  },
  largeTitle: {
    fontFamily,
    fontSize: 30,
    fontWeight: "700" as const,
    letterSpacing: 0.2,
    lineHeight: 38,
    color: colors.text,
  },
  heroNumber: {
    fontFamily: fontFamilyDisplay,
    fontSize: 108,
    fontWeight: "300" as const,
    letterSpacing: -5,
    color: colors.text,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  metric: {
    fontFamily: fontFamilySans,
    fontSize: 28,
    fontWeight: "600" as const,
    color: colors.text,
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"] as ("tabular-nums")[],
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "700" as const,
    letterSpacing: 0,
    lineHeight: 32,
    color: colors.text,
  },
  editorial: {
    fontFamily,
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: 0.4,
    color: colors.text,
  },
  headline: {
    fontFamily: fontFamilySans,
    fontSize: 17,
    fontWeight: "600" as const,
    letterSpacing: -0.1,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamilySans,
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "400" as const,
    color: colors.text,
    lineHeight: 24,
  },
  callout: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.textMuted,
    lineHeight: 20,
  },
  caption: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textMuted,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  footnote: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "400" as const,
    color: colors.textMuted,
    lineHeight: 16,
  },
  overline: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 1.6,
    color: colors.textMuted,
    textTransform: "uppercase" as const,
  },
};

export const touchMin = 44;

export const DISCLAIMERS = {
  report: "AI 整理结果仅供记录，请以原始报告和医生意见为准。",
  stageSummary: "小结仅汇总您的档案记录，不构成医学结论，请以医生意见为准。",
  calendar: "参考日程，以医生安排为准",
  recording: "录音仅存入您自己的档案；请遵守就诊场所相关规定。",
} as const;

/** 下一步 why 默认边界句 */
export const WHY_BOUNDARY = "常见安排的档案说明，具体以医生安排为准。";
