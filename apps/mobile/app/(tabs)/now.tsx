import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Caption, CollapsibleSection, Screen } from "@/components/ui";
import { MetricStrip } from "@/components/MetricVisual";
import { SproutMark } from "@/components/YajiMark";
import {
  colors,
  fontFamily,
  fontFamilyDisplay,
  fontFamilySans,
  radii,
  spacing,
  typography,
  WHY_BOUNDARY,
  WARM_COPY,
} from "@/constants/theme";
import { go } from "@/src/nav";
import type { NextActionCta, NextActionItem } from "@/src/fixtures/types";
import { usePrototype } from "@/src/state/PrototypeContext";
import { getNodeLabel } from "@/src/utils/stage";

function todayLabel() {
  const d = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}`;
}

const PRIMARY_VISIBLE = 3;

function resolvePrimaryCta(item: NextActionItem): NextActionCta {
  if (item.primaryCta) return item.primaryCta;
  if (item.isReferenceSchedule || item.source === "CALENDAR") return "REMINDER";
  if (item.linkedEventId) return "DETAIL";
  return "COMPLETE";
}

function buildNextSubtitle(item: NextActionItem): string {
  const titleHasOpenLoop = /未闭环/.test(item.title);
  const isRef = Boolean(item.isReferenceSchedule);
  const statusBit = isRef
    ? "参考日程"
    : item.source === "REPORT" && !titleHasOpenLoop
      ? "未闭环"
      : item.dueLabel?.includes("已预约") || item.detail?.includes("已预约")
        ? "已预约"
        : null;
  const due = item.dueLabel?.replace(/\s*·\s*已预约/, "") || item.dueLabel;
  return [due, statusBit]
    .filter(Boolean)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .join(" · ");
}

function ctaLabel(cta: NextActionCta): string {
  switch (cta) {
    case "DETAIL":
      return "详情";
    case "BRING":
      return "携带清单";
    case "REMINDER":
      return "设提醒";
    case "COMPLETE":
      return "完成";
  }
}

export default function NowScreen() {
  const { state, completeNextAction, toggleBringItem, canWrite } = usePrototype();
  const [showMoreNext, setShowMoreNext] = useState(false);
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [extraOpen, setExtraOpen] = useState(false);
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(22)).current;
  const node = getNodeLabel(state);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 780,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 780,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroFade, heroSlide]);

  const pending = state.nextActions.filter((n) => n.status === "PENDING");
  const ordered = [...pending].sort((a, b) => {
    const rank = (x: typeof a) => (x.isReferenceSchedule ? 1 : 0);
    return rank(a) - rank(b);
  });
  const visible = showMoreNext ? ordered : ordered.slice(0, PRIMARY_VISIBLE);
  const hiddenCount = Math.max(0, ordered.length - PRIMARY_VISIBLE);

  const weight = state.motherHealth.find((p) => p.label === "体重");
  const bp = state.motherHealth.find((p) => p.label === "血压");
  const fh = state.motherHealth.find((p) => p.label.includes("胎心"));
  const metricItems = [
    { label: "胎心", value: fh?.value, unit: fh?.unit },
    { label: "体重", value: weight?.value, unit: weight?.unit },
    { label: "血压", value: bp?.value, unit: bp?.unit },
  ].filter((m) => m.value);

  const askComplete = (id: string, title: string) => {
    Alert.alert("标记完成？", `确认「${title}」已经做完了吗？`, [
      { text: "再等等", style: "cancel" },
      { text: "已完成", onPress: () => completeNextAction(id) },
    ]);
  };

  const runPrimaryCta = (item: NextActionItem, cta: NextActionCta) => {
    if (!canWrite && cta !== "DETAIL") return;
    switch (cta) {
      case "DETAIL":
        if (item.linkedEventId) go(`/event/${item.linkedEventId}`);
        else go("/(tabs)/timeline");
        break;
      case "BRING":
        setExtraOpen(true);
        break;
      case "REMINDER":
        go(
          `/reminder/new?title=${encodeURIComponent(item.title)}${
            item.detail ? `&notes=${encodeURIComponent(item.detail)}` : ""
          }`,
        );
        break;
      case "COMPLETE":
        askComplete(item.id, item.title);
        break;
    }
  };

  const toggleWhy = (id: string) =>
    setExpandedWhy((prev) => ({ ...prev, [id]: !prev[id] }));

  const moreBits: string[] = [];
  if (metricItems.length) moreBits.push(`${metricItems.length} 项指标`);
  if (state.bringList.length) moreBits.push(`${state.bringList.length} 件携带`);
  if (state.lastVisit) moreBits.push("最近就诊");
  const moreSummary = moreBits.join(" · ");
  const hasMore = moreBits.length > 0;

  return (
    <Screen glow glowVariant="mint" safeTop>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶栏 */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.dateLabel}>{todayLabel()}</Text>
            <Text style={styles.companion}>{WARM_COPY.nowCompanion}</Text>
          </View>
          <SproutMark size={34} breathe />
        </View>

        {/* 全幅孕周舞台 —— 非卡片堆叠 */}
        <Animated.View
          style={[
            styles.heroStage,
            { opacity: heroFade, transform: [{ translateY: heroSlide }] },
          ]}
        >
          <View style={styles.heroWash} />
          <Text style={styles.heroKicker}>当前节点</Text>
          <View style={styles.heroNumberRow}>
            <Text style={styles.heroNumber}>{node.heroNumber}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroUnit}>{node.heroUnit}</Text>
              {node.heroAside ? (
                <Text style={styles.heroAside}>{node.heroAside}</Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.stageLine}>{node.stageLine}</Text>
          {node.subtitle ? <Text style={styles.heroSub}>{node.subtitle}</Text> : null}
          {typeof node.progress === "number" ? (
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(node.progress * 100)}%` },
                ]}
              />
            </View>
          ) : null}
        </Animated.View>

        {/* 下一步 · 单列叙事 */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>下一步</Text>
          <Text style={styles.sectionHint}>每件事都说明事由</Text>
        </View>

        {ordered.length === 0 ? (
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyTitle}>这一刻很安静</Text>
            <Text style={styles.emptyHint}>{WARM_COPY.emptyNext}</Text>
          </View>
        ) : (
          <View style={styles.storyRail}>
            {visible.map((item, index) => {
              const cta = resolvePrimaryCta(item);
              const subtitle = buildNextSubtitle(item);
              const showCompleteLink = canWrite && cta !== "COMPLETE";
              const isExpanded = Boolean(expandedWhy[item.id]);
              const isLast = index === visible.length - 1 && hiddenCount === 0;

              return (
                <View key={item.id} style={styles.storyItem}>
                  <View style={styles.railCol}>
                    <View
                      style={[
                        styles.railDot,
                        item.source === "REPORT" && styles.railDotAccent,
                      ]}
                    />
                    {!isLast ? <View style={styles.railLine} /> : null}
                  </View>

                  <View style={styles.storyBody}>
                    <View style={styles.actionTop}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.actionTitle}>{item.title}</Text>
                        {subtitle ? (
                          <Text style={styles.actionDue}>{subtitle}</Text>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => runPrimaryCta(item, cta)}
                        hitSlop={8}
                        style={[
                          styles.actionCta,
                          cta === "COMPLETE" && styles.actionCtaDone,
                        ]}
                      >
                        <Text
                          style={[
                            styles.actionCtaText,
                            cta === "COMPLETE" && styles.actionCtaTextDone,
                          ]}
                        >
                          {ctaLabel(cta)}
                        </Text>
                      </Pressable>
                    </View>

                    {/* why：默认 1 行可见，不点详情也能感知事由 */}
                    {item.why ? (
                      <Pressable
                        onPress={() => toggleWhy(item.id)}
                        style={styles.whyBlock}
                        accessibilityRole="button"
                        accessibilityState={{ expanded: isExpanded }}
                      >
                        <Text style={styles.whyLabel}>{WARM_COPY.whyLabel}</Text>
                        <Text
                          style={styles.whyText}
                          numberOfLines={isExpanded ? undefined : 1}
                        >
                          {item.why}
                        </Text>
                        {isExpanded ? (
                          <Text style={styles.whyNote}>
                            {item.whyNote || WHY_BOUNDARY}
                          </Text>
                        ) : (
                          <Text style={styles.whyToggle}>展开全文</Text>
                        )}
                      </Pressable>
                    ) : null}

                    {showCompleteLink ? (
                      <Pressable
                        onPress={() => askComplete(item.id, item.title)}
                        hitSlop={6}
                        style={styles.completeArea}
                      >
                        <Text style={styles.completeLink}>标记完成</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {hiddenCount > 0 ? (
              <Pressable
                onPress={() => setShowMoreNext((v) => !v)}
                style={styles.moreRow}
              >
                <Text style={styles.moreText}>
                  {showMoreNext ? "收起" : `另 ${hiddenCount} 条`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <Text style={styles.disclaimer}>
          以上为常见安排的档案说明，以医生实际安排为准。参考日程另标「参考日程」。
        </Text>

        {canWrite ? (
          <Pressable
            onPress={() => go("/add-menu")}
            style={({ pressed }) => [
              styles.collectEntry,
              pressed && { opacity: 0.78 },
            ]}
          >
            <View style={styles.collectMark}>
              <Text style={styles.collectMarkText}>收</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.collectText}>{WARM_COPY.collectAction}</Text>
              <Text style={styles.collectHint}>{WARM_COPY.nowBringIn}</Text>
            </View>
            <Text style={styles.collectArrow}>→</Text>
          </Pressable>
        ) : null}

        {hasMore ? (
          <CollapsibleSection
            title={WARM_COPY.nowExtra}
            summary={moreSummary}
            open={extraOpen}
            onOpenChange={setExtraOpen}
          >
            {metricItems.length > 0 ? (
              <View style={styles.block}>
                <Caption>成长痕迹</Caption>
                <MetricStrip
                  items={metricItems}
                  onPressItem={() => go("/(tabs)/health")}
                />
              </View>
            ) : null}

            {state.bringList.length > 0 ? (
              <View style={styles.block}>
                <Caption>下次带上</Caption>
                {state.bringList.slice(0, 3).map((b) => (
                  <Pressable
                    key={b.id}
                    style={styles.bringRow}
                    onPress={canWrite ? () => toggleBringItem(b.id) : undefined}
                  >
                    <View
                      style={[
                        styles.bringCheck,
                        b.checked && styles.bringCheckDone,
                      ]}
                    >
                      {b.checked ? (
                        <Text style={styles.bringCheckMark}>✓</Text>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.bringTitle,
                        b.checked && styles.bringTitleDone,
                      ]}
                    >
                      {b.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {state.lastVisit ? (
              <Pressable
                onPress={() => go("/(tabs)/timeline")}
                style={styles.visitCard}
              >
                <Text style={styles.visitLabel}>最近就诊</Text>
                <Text style={styles.visitTitle}>{state.lastVisit.title}</Text>
                <Text style={styles.visitDate}>{state.lastVisit.date}</Text>
              </Pressable>
            ) : null}
          </CollapsibleSection>
        ) : null}

        {!canWrite ? (
          <Text style={styles.viewOnly}>当前为仅查看。</Text>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 128, paddingTop: 4 },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  dateLabel: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.6,
  },
  companion: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 5,
    lineHeight: 18,
  },

  /* 全幅舞台：打破「白卡片堆」 */
  heroStage: {
    marginHorizontal: -spacing.screen,
    paddingHorizontal: spacing.screen + 6,
    paddingTop: 28,
    paddingBottom: 32,
    marginBottom: spacing.xl,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  heroWash: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.warmCard,
  },
  heroKicker: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.brandDark,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroNumberRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  heroNumber: {
    ...typography.heroNumber,
    lineHeight: 112,
  },
  heroMeta: { marginBottom: 26 },
  heroUnit: {
    fontFamily: fontFamilyDisplay,
    fontSize: 24,
    fontWeight: "300",
    color: colors.textSecondary,
    letterSpacing: -0.4,
  },
  heroAside: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  stageLine: {
    fontFamily,
    fontSize: 20,
    fontWeight: "600",
    color: colors.brandDark,
    letterSpacing: 0.4,
    marginTop: 10,
  },
  heroSub: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 21,
  },
  progressTrack: {
    marginTop: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(46, 107, 88, 0.14)",
    overflow: "hidden",
    maxWidth: 220,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand,
    borderRadius: 2,
  },

  sectionHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 2,
  },
  sectionTitle: { ...typography.editorial },
  sectionHint: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },

  emptyBlock: {
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.separator,
  },
  emptyTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  emptyHint: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },

  /* 叙事轨道 */
  storyRail: { marginBottom: 4 },
  storyItem: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 96,
  },
  railCol: {
    width: 22,
    alignItems: "center",
    paddingTop: 8,
  },
  railDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.brandSoft,
  },
  railDotAccent: {
    backgroundColor: colors.accent,
    borderColor: colors.accentSoft,
  },
  railLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: colors.fillStrong,
    marginTop: 6,
    marginBottom: 2,
  },
  storyBody: {
    flex: 1,
    paddingBottom: 22,
    paddingLeft: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    marginBottom: 4,
  },
  actionTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  actionTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  actionDue: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  actionCta: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.sm,
    backgroundColor: colors.fill,
    marginTop: 2,
  },
  actionCtaDone: { backgroundColor: colors.brandSoft },
  actionCtaText: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  actionCtaTextDone: {
    color: colors.brandDark,
    fontWeight: "700",
  },

  whyBlock: {
    marginTop: 12,
    backgroundColor: colors.whyWash,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
  },
  whyLabel: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.brandDark,
    marginBottom: 5,
  },
  whyText: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  whyNote: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  whyToggle: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
    marginTop: 6,
  },

  completeArea: { marginTop: 10, alignSelf: "flex-start" },
  completeLink: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  moreRow: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingLeft: 28,
  },
  moreText: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: "700",
    color: colors.brand,
  },

  disclaimer: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: spacing.xl,
    textAlign: "center",
    lineHeight: 16,
  },

  collectEntry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.lg,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collectMark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  collectMarkText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  collectText: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  collectHint: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  collectArrow: {
    fontSize: 18,
    color: colors.brand,
    fontWeight: "300",
  },

  block: { marginBottom: spacing.md, gap: 8 },
  bringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  bringCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  bringCheckDone: {
    borderColor: colors.brand,
    backgroundColor: colors.brandSoft,
  },
  bringCheckMark: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
  },
  bringTitle: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  bringTitleDone: {
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
  visitCard: {
    backgroundColor: colors.warmCardAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 3,
  },
  visitLabel: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  visitTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  visitDate: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
  },
  viewOnly: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
