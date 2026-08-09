import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  DISCLAIMERS,
  fontFamily,
  fontFamilySans,
  radii,
  shadows,
  spacing,
  touchMin,
  typography,
  WARM_COPY,
} from "@/constants/theme";
import { BrandLockup, WarmGlow } from "@/components/YajiMark";

export function Screen({
  children,
  style,
  glow = false,
  glowVariant = "default",
  safeTop = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: boolean;
  glowVariant?: "default" | "peach" | "mint";
  safeTop?: boolean;
}) {
  return (
    <View style={styles.screen}>
      {glow ? <WarmGlow variant={glowVariant} /> : null}
      <SafeAreaView
        style={[styles.screenInner, style]}
        edges={safeTop ? ["top", "left", "right"] : ["left", "right"]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return <BrandLockup subtitle={subtitle} />;
}

export function LargeTitle({ children }: { children: React.ReactNode }) {
  return <Text style={typography.largeTitle}>{children}</Text>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={typography.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={[typography.subtitle, { marginTop: spacing.sm }]}>{children}</Text>;
}

export function Body({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <Text style={[typography.body, muted && { color: colors.textMuted }]}>{children}</Text>
  );
}

export function Caption({ children }: { children: React.ReactNode }) {
  return <Text style={typography.caption}>{children}</Text>;
}

export function Card({
  children,
  onPress,
  style,
  inset = false,
  elevated = false,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  inset?: boolean;
  elevated?: boolean;
}) {
  const base = inset ? styles.group : styles.card;
  const elevStyle = elevated ? shadows.sm : undefined;
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [base, elevStyle, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, elevStyle, style]}>{children}</View>;
}

export function Group({ children, footer }: { children: React.ReactNode; footer?: string }) {
  return (
    <View style={styles.groupWrap}>
      <View style={[styles.group, shadows.sm]}>{children}</View>
      {footer ? <Text style={styles.groupFooter}>{footer}</Text> : null}
    </View>
  );
}

export function Row({
  title,
  subtitle,
  detail,
  onPress,
  trailing,
  showSeparator = true,
}: {
  title: string;
  subtitle?: string;
  detail?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  showSeparator?: boolean;
}) {
  const content = (
    <View style={[styles.row, showSeparator && styles.rowBorder]}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      {trailing}
      {onPress && !trailing ? <Text style={styles.chevron}>›</Text> : null}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  compact,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        compact && styles.btnCompact,
        variant === "primary" && styles.btnPrimary,
        variant === "secondary" && styles.btnSecondary,
        variant === "danger" && styles.btnDanger,
        variant === "ghost" && styles.btnGhost,
        (disabled || pressed) && { opacity: disabled ? 0.4 : 0.78 },
      ]}
    >
      <Text
        style={[
          styles.btnText,
          compact && styles.btnTextCompact,
          variant === "secondary" && { color: colors.brand },
          variant === "ghost" && { color: colors.link },
          variant === "danger" && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.link}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function CollapsibleSection({
  title,
  summary,
  hint,
  defaultOpen = false,
  children,
  open: openProp,
  onOpenChange,
}: {
  title: string;
  summary?: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internal, setInternal] = React.useState(defaultOpen);
  const open = openProp ?? internal;
  const setOpen = (next: boolean) => {
    if (openProp === undefined) setInternal(next);
    onOpenChange?.(next);
  };
  const peek = summary ?? hint;

  return (
    <View style={[styles.collapseWrap, shadows.sm]}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={({ pressed }) => [styles.collapseHead, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.collapseTitle}>{title}</Text>
        <View style={styles.collapseRight}>
          {!open && peek ? (
            <Text style={styles.collapseSummary} numberOfLines={1}>
              {peek}
            </Text>
          ) : null}
          <Text style={styles.collapseChevron}>{open ? "收起" : "展开"}</Text>
        </View>
      </Pressable>
      {open ? <View style={styles.collapseBody}>{children}</View> : null}
    </View>
  );
}

export function StateBlock({
  kind,
  onRetry,
}: {
  kind: "loading" | "empty" | "error" | "forbidden";
  onRetry?: () => void;
}) {
  if (kind === "loading") {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator color={colors.brand} size="small" />
        <Text style={[typography.callout, { marginTop: spacing.sm }]}>正在加载…</Text>
      </View>
    );
  }
  const copy = {
    empty: {
      title: WARM_COPY.emptyArchive,
      desc: WARM_COPY.emptyArchiveHint,
      action: undefined,
    },
    error: {
      title: "加载失败",
      desc: "请稍后重试，已填写内容不会丢失。",
      action: "重试",
    },
    forbidden: {
      title: "暂无权限",
      desc: "当前角色无法查看或修改此内容。",
      action: undefined,
    },
  }[kind];
  return (
    <View style={styles.stateBox}>
      <Text style={styles.stateTitle}>{copy.title}</Text>
      <Text style={[typography.callout, { marginTop: spacing.xs }]}>{copy.desc}</Text>
      {copy.action && onRetry ? (
        <View style={{ marginTop: spacing.lg }}>
          <Button label={copy.action} onPress={onRetry} variant="secondary" />
        </View>
      ) : null}
    </View>
  );
}

export function Disclaimer({
  kind = "report",
}: {
  kind?: keyof typeof DISCLAIMERS;
}) {
  return <Text style={styles.disclaimerText}>{DISCLAIMERS[kind]}</Text>;
}

export function LowConfidenceBadge() {
  return (
    <View style={styles.lowBadge}>
      <Text style={styles.lowBadgeText}>待核对</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: "hidden",
  },
  screenInner: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  groupWrap: { marginBottom: spacing.xl },
  group: {
    backgroundColor: "transparent",
    borderRadius: 0,
    overflow: "visible",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  groupFooter: {
    ...typography.footnote,
    marginTop: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  row: {
    minHeight: 54,
    paddingHorizontal: 2,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  rowMain: { flex: 1, paddingRight: spacing.sm },
  rowTitle: {
    fontFamily: fontFamilySans,
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  rowSub: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  rowDetail: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    color: colors.textMuted,
    marginRight: 6,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: "300",
    marginLeft: 4,
  },
  pressed: { opacity: 0.6 },
  btn: {
    minHeight: 52,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  btnCompact: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  btnPrimary: { backgroundColor: colors.brandDeep },
  btnSecondary: { backgroundColor: colors.brandSoft },
  btnDanger: { backgroundColor: colors.dangerSoft },
  btnGhost: { backgroundColor: "transparent", minHeight: 40 },
  btnText: {
    fontFamily: fontFamilySans,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  btnTextCompact: {
    fontSize: 14,
  },
  field: { marginBottom: spacing.lg },
  fieldLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  input: {
    minHeight: 52,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: 16,
    fontFamily: fontFamilySans,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { ...typography.footnote, marginTop: spacing.xs, marginLeft: 4 },
  chip: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.fill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: { backgroundColor: colors.brandDeep },
  chipText: {
    fontFamily: fontFamilySans,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextActive: { color: "#FFFFFF" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.3,
    color: colors.text,
  },
  collapseWrap: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  collapseHead: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  collapseTitle: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  collapseRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  collapseSummary: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    maxWidth: 160,
  },
  collapseChevron: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
    letterSpacing: 0.5,
  },
  collapseBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    paddingTop: spacing.md,
  },
  link: {
    fontFamily: fontFamilySans,
    color: colors.link,
    fontSize: 14,
    fontWeight: "600",
  },
  stateBox: {
    marginTop: spacing.xxl,
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  stateTitle: {
    ...typography.title,
    fontSize: 20,
    textAlign: "center",
  },
  disclaimerText: {
    ...typography.footnote,
    marginVertical: spacing.lg,
    textAlign: "center",
  },
  lowBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  lowBadgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: fontFamilySans,
    letterSpacing: 0.3,
  },
});
