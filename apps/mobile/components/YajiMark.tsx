import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fontFamily, fontFamilySans, spacing } from "@/constants/theme";

/**
 * 芽纪叶芽标识：双叶 + 茎 — 精致几何，品牌有态度
 * 呼吸动效服务于「此刻」页面的生命感
 */
export function SproutMark({
  size = 44,
  breathe = false,
}: {
  size?: number;
  breathe?: boolean;
}) {
  const pulse = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    if (!breathe) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, pulse]);

  const leafW = size * 0.38;
  const leafH = size * 0.54;
  return (
    <View style={[styles.mark, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 1.1,
            height: size * 1.1,
            borderRadius: size,
            backgroundColor: colors.brandGlow,
            opacity: breathe ? pulse : 0,
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: leafW,
            height: leafH,
            borderTopLeftRadius: leafW * 0.9,
            borderTopRightRadius: leafW * 0.3,
            borderBottomRightRadius: leafW * 0.9,
            borderBottomLeftRadius: leafW * 0.3,
            backgroundColor: colors.brand,
            left: size * 0.16,
            top: size * 0.14,
            transform: [{ rotate: "-25deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: leafW * 0.88,
            height: leafH * 0.88,
            borderTopLeftRadius: leafW * 0.3,
            borderTopRightRadius: leafW * 0.9,
            borderBottomRightRadius: leafW * 0.3,
            borderBottomLeftRadius: leafW * 0.9,
            backgroundColor: colors.accent,
            right: size * 0.16,
            top: size * 0.18,
            transform: [{ rotate: "25deg" }],
            opacity: 0.88,
          },
        ]}
      />
      <View
        style={[
          styles.stem,
          {
            width: size * 0.06,
            height: size * 0.3,
            borderRadius: size * 0.03,
            backgroundColor: colors.brandDark,
            bottom: size * 0.08,
            left: size * 0.47,
          },
        ]}
      />
    </View>
  );
}

export function AiAssistChip({ label = "芽纪帮读" }: { label?: string }) {
  return (
    <View style={styles.aiChip}>
      <SproutMark size={16} />
      <Text style={styles.aiChipText}>{label}</Text>
    </View>
  );
}

export function BrandLockup({
  subtitle,
  compact,
  style,
}: {
  subtitle?: string;
  compact?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.lockup, compact && styles.lockupCompact, style]}>
      <SproutMark size={compact ? 32 : 48} />
      <View style={styles.lockupText}>
        <Text style={[styles.wordmark, compact && styles.wordmarkCompact]}>芽纪</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function WarmGlow({ variant = "default" }: { variant?: "default" | "peach" | "mint" }) {
  const a =
    variant === "peach"
      ? colors.accentGlow
      : variant === "mint"
        ? colors.brandGlow
        : "rgba(232, 160, 138, 0.2)";
  const b =
    variant === "peach"
      ? colors.roseSoft
      : variant === "mint"
        ? colors.skySoft
        : "rgba(90, 158, 136, 0.15)";

  return (
    <View pointerEvents="none" style={styles.glowLayer}>
      <View style={[styles.blob, styles.blobTL, { backgroundColor: a }]} />
      <View style={[styles.blob, styles.blobTR, { backgroundColor: b }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  glow: {
    position: "absolute",
  },
  leaf: {
    position: "absolute",
  },
  stem: {
    position: "absolute",
  },
  aiChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(90, 158, 136, 0.12)",
  },
  aiChipText: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandDark,
    letterSpacing: 0.3,
  },
  lockup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: spacing.xl,
  },
  lockupCompact: {
    marginBottom: spacing.md,
    gap: 10,
  },
  lockupText: { flex: 1, gap: 3 },
  wordmark: {
    fontFamily,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
    color: colors.text,
  },
  wordmarkCompact: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  glowLayer: {
    ...(StyleSheet.absoluteFill as object),
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 260,
    opacity: 0.85,
  },
  blobTL: {
    top: -100,
    left: -80,
  },
  blobTR: {
    top: -60,
    right: -110,
  },
});
