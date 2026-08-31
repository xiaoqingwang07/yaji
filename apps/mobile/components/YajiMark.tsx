import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fontFamily, fontFamilySans, spacing } from "@/constants/theme";

/** 简洁的双叶标识，只承担品牌识别，不抢占健康信息的注意力。 */
export function SproutMark({ size = 40 }: { size?: number; breathe?: boolean }) {
  const leafW = size * 0.36;
  const leafH = size * 0.5;
  return (
    <View style={[styles.mark, { width: size, height: size }]}>
      <View
        style={[
          styles.leaf,
          {
            width: leafW,
            height: leafH,
            borderTopLeftRadius: leafW,
            borderTopRightRadius: leafW * 0.25,
            borderBottomRightRadius: leafW,
            borderBottomLeftRadius: leafW * 0.25,
            backgroundColor: colors.brand,
            left: size * 0.17,
            top: size * 0.16,
            transform: [{ rotate: "-28deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: leafW * 0.84,
            height: leafH * 0.84,
            borderTopLeftRadius: leafW * 0.25,
            borderTopRightRadius: leafW,
            borderBottomRightRadius: leafW * 0.25,
            borderBottomLeftRadius: leafW,
            backgroundColor: colors.accent,
            right: size * 0.18,
            top: size * 0.2,
            transform: [{ rotate: "28deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            width: Math.max(2, size * 0.055),
            height: size * 0.27,
            borderRadius: size,
            backgroundColor: colors.brandDeep,
            bottom: size * 0.09,
            left: size * 0.47,
          },
        ]}
      />
    </View>
  );
}

export function AiAssistChip({ label = "芽纪解读" }: { label?: string }) {
  return (
    <View style={styles.aiChip}>
      <SproutMark size={15} />
      <Text style={styles.aiChipText}>{label}</Text>
    </View>
  );
}

export function BrandLockup({ subtitle, compact, style }: { subtitle?: string; compact?: boolean; style?: ViewStyle }) {
  return (
    <View style={[styles.lockup, compact && styles.lockupCompact, style]}>
      <SproutMark size={compact ? 30 : 42} />
      <View style={styles.lockupText}>
        <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>芽纪</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

/** 保留 Screen 的兼容入口；新版不使用装饰性光斑背景。 */
export function WarmGlow(_: { variant?: "default" | "peach" | "mint" }) {
  return null;
}

const styles = StyleSheet.create({
  mark: { alignItems: "center", justifyContent: "center" },
  leaf: { position: "absolute" },
  stem: { position: "absolute" },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
  },
  aiChipText: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "700", color: colors.brandDark },
  lockup: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: spacing.xl },
  lockupCompact: { marginBottom: spacing.md, gap: 8 },
  lockupText: { flex: 1, gap: 2 },
  wordmark: { fontFamily, fontSize: 27, fontWeight: "700", color: colors.text },
  wordmarkCompact: { fontSize: 19 },
  subtitle: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
});
