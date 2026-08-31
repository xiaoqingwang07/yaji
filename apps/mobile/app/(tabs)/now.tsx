import { useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MetricStrip } from "@/components/MetricVisual";
import { Screen } from "@/components/ui";
import { SproutMark } from "@/components/YajiMark";
import { colors, DISCLAIMERS, fontFamilySans, radii, spacing, typography, WARM_COPY } from "@/constants/theme";
import type { NextActionCta, NextActionItem } from "@/src/fixtures/types";
import { go } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import { getNodeLabel } from "@/src/utils/stage";

function todayLabel() {
  const d = new Date();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}月${d.getDate()}日 · 周${weekdays[d.getDay()]}`;
}

function resolvePrimaryCta(item: NextActionItem): NextActionCta {
  if (item.primaryCta) return item.primaryCta;
  if (item.isReferenceSchedule || item.source === "CALENDAR") return "REMINDER";
  if (item.linkedEventId) return "DETAIL";
  return "COMPLETE";
}

function actionLabel(cta: NextActionCta) {
  return { DETAIL: "查看", BRING: "看清单", REMINDER: "设提醒", COMPLETE: "完成" }[cta];
}

function sourceLabel(item: NextActionItem) {
  if (item.isReferenceSchedule || item.source === "CALENDAR") return "参考日程";
  if (item.source === "REPORT") return "来自报告";
  if (item.source === "DOCTOR_NOTE") return "医生叮嘱";
  return "我的提醒";
}

export default function NowScreen() {
  const { state, completeNextAction, canWrite } = usePrototype();
  const node = getNodeLabel(state);
  const pending = useMemo(
    () =>
      state.nextActions
        .filter((item) => item.status === "PENDING")
        .sort((a, b) => Number(Boolean(a.isReferenceSchedule)) - Number(Boolean(b.isReferenceSchedule))),
    [state.nextActions],
  );
  const focus = pending[0];
  const upcoming = pending.slice(1, 3);
  const reportCount = state.events.filter((event) => event.reportId).length;

  const metricItems = [
    state.motherHealth.find((point) => point.label.includes("胎心")),
    state.motherHealth.find((point) => point.label === "体重"),
    state.motherHealth.find((point) => point.label === "血压"),
  ]
    .filter((point): point is NonNullable<typeof point> => Boolean(point))
    .map((point) => ({ label: point.label, value: point.value, unit: point.unit }));

  const runAction = (item: NextActionItem) => {
    const cta = resolvePrimaryCta(item);
    if (!canWrite && cta !== "DETAIL") return;
    if (cta === "DETAIL") {
      go(item.linkedEventId ? `/event/${item.linkedEventId}` : "/(tabs)/timeline");
      return;
    }
    if (cta === "BRING") {
      go("/(tabs)/timeline");
      return;
    }
    if (cta === "REMINDER") {
      go(`/reminder/new?title=${encodeURIComponent(item.title)}`);
      return;
    }
    Alert.alert("标记完成？", `确认「${item.title}」已经完成了吗？`, [
      { text: "暂不", style: "cancel" },
      { text: "已完成", onPress: () => completeNextAction(item.id) },
    ]);
  };

  return (
    <Screen safeTop>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brand}>芽纪</Text>
            <Text style={styles.date}>{todayLabel()}</Text>
          </View>
          <SproutMark size={30} />
        </View>

        <View style={styles.stage}>
          <Text style={styles.eyebrow}>当前阶段</Text>
          <View style={styles.stageRow}>
            <Text style={styles.stageNumber}>{node.heroNumber}</Text>
            <View style={styles.stageMeta}>
              <Text style={styles.stageUnit}>{node.heroUnit}</Text>
              {node.heroAside ? <Text style={styles.stageAside}>{node.heroAside}</Text> : null}
            </View>
          </View>
          <Text style={styles.stageTitle}>{node.stageLine}</Text>
          <Text style={styles.stageSub}>{node.subtitle}</Text>
          {typeof node.progress === "number" ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(node.progress * 100)}%` }]} />
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>现在最重要</Text>
          <Text style={styles.sectionHint}>基于已确认档案</Text>
        </View>

        {focus ? (
          <View style={styles.focusPanel}>
            <View style={styles.focusMeta}>
              <Text style={styles.focusSource}>{sourceLabel(focus)}</Text>
              {focus.dueLabel ? <Text style={styles.focusDate}>{focus.dueLabel}</Text> : null}
            </View>
            <Text style={styles.focusTitle}>{focus.title}</Text>
            {focus.detail ? <Text style={styles.focusDetail}>{focus.detail}</Text> : null}
            {focus.why ? <Text style={styles.focusWhy}>{focus.why}</Text> : null}
            <View style={styles.focusFooter}>
              <Text style={styles.reference}>{focus.isReferenceSchedule ? DISCLAIMERS.calendar : "档案事实提示"}</Text>
              <Pressable onPress={() => runAction(focus)} style={styles.focusAction}>
                <Text style={styles.focusActionText}>{actionLabel(resolvePrimaryCta(focus))}</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emptyFocus}>
            <Text style={styles.emptyTitle}>先收下第一份记录</Text>
            <Text style={styles.emptyText}>{WARM_COPY.emptyNext}</Text>
          </View>
        )}

        {canWrite ? (
          <Pressable onPress={() => go("/add-menu")} style={styles.reportEntry}>
            <View style={styles.reportEntryMark}><Text style={styles.reportEntryMarkText}>＋</Text></View>
            <View style={styles.reportEntryText}>
              <Text style={styles.reportEntryTitle}>{WARM_COPY.collectAction}</Text>
              <Text style={styles.reportEntrySub}>{WARM_COPY.nowBringIn}</Text>
            </View>
            <Text style={styles.entryArrow}>›</Text>
          </Pressable>
        ) : null}

        {upcoming.length > 0 ? (
          <View style={styles.upcoming}>
            <Text style={styles.sectionTitle}>接下来</Text>
            {upcoming.map((item) => (
              <Pressable key={item.id} onPress={() => runAction(item)} style={styles.upcomingRow}>
                <View style={[styles.actionDot, item.source === "REPORT" && styles.actionDotReport]} />
                <View style={styles.upcomingText}>
                  <Text style={styles.upcomingTitle}>{item.title}</Text>
                  <Text style={styles.upcomingMeta}>{[item.dueLabel, sourceLabel(item)].filter(Boolean).join(" · ")}</Text>
                </View>
                <Text style={styles.entryArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>档案变化</Text>
          <Pressable onPress={() => go("/(tabs)/timeline")}><Text style={styles.textLink}>查看全部</Text></Pressable>
        </View>
        {metricItems.length > 0 ? <MetricStrip items={metricItems} onPressItem={() => go("/(tabs)/health")} /> : null}
        <Pressable onPress={() => go("/(tabs)/timeline")} style={styles.archiveSummary}>
          <View>
            <Text style={styles.archiveCount}>{state.events.length} 条已整理记录</Text>
            <Text style={styles.archiveSub}>{reportCount ? `${reportCount} 份报告可回看原件、解读与来源` : "报告、叮嘱和居家记录会在同一条时间线里"}</Text>
          </View>
          <Text style={styles.entryArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 4, paddingBottom: 128 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xl },
  brand: { fontFamily: fontFamilySans, fontSize: 25, fontWeight: "700", color: colors.text },
  date: { fontFamily: fontFamilySans, fontSize: 13, color: colors.textMuted, marginTop: 4 },
  stage: { backgroundColor: colors.warmCard, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.xl },
  eyebrow: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "700", color: colors.brandDark, marginBottom: 10 },
  stageRow: { flexDirection: "row", alignItems: "flex-end" },
  stageNumber: { ...typography.heroNumber, lineHeight: 68 },
  stageMeta: { marginLeft: 8, marginBottom: 10 },
  stageUnit: { fontFamily: fontFamilySans, fontSize: 19, fontWeight: "700", color: colors.text },
  stageAside: { fontFamily: fontFamilySans, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  stageTitle: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", color: colors.brandDeep, marginTop: 12 },
  stageSub: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 6 },
  progressTrack: { height: 4, borderRadius: 4, overflow: "hidden", backgroundColor: colors.fillStrong, marginTop: 18 },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: colors.brand },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 },
  sectionTitle: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", color: colors.text },
  sectionHint: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted },
  focusPanel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, padding: spacing.lg, marginBottom: spacing.md },
  focusMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  focusSource: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "700", color: colors.brandDark, backgroundColor: colors.brandSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.sm },
  focusDate: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, flexShrink: 1, marginLeft: 8, textAlign: "right" },
  focusTitle: { fontFamily: fontFamilySans, fontSize: 20, fontWeight: "700", lineHeight: 28, color: colors.text },
  focusDetail: { fontFamily: fontFamilySans, fontSize: 14, lineHeight: 21, color: colors.textSecondary, marginTop: 8 },
  focusWhy: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 20, color: colors.textMuted, marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  focusFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16 },
  reference: { flex: 1, fontFamily: fontFamilySans, fontSize: 11, lineHeight: 16, color: colors.textMuted },
  focusAction: { minHeight: 40, justifyContent: "center", paddingHorizontal: 14, borderRadius: radii.md, backgroundColor: colors.brandDeep },
  focusActionText: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  emptyFocus: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator, paddingVertical: spacing.lg, marginBottom: spacing.md },
  emptyTitle: { fontFamily: fontFamilySans, fontSize: 17, fontWeight: "700", color: colors.text },
  emptyText: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 20, color: colors.textMuted, marginTop: 5 },
  reportEntry: { minHeight: 72, flexDirection: "row", alignItems: "center", backgroundColor: colors.brandDeep, borderRadius: radii.lg, paddingHorizontal: 14, marginBottom: spacing.xl },
  reportEntryMark: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.16)" },
  reportEntryMarkText: { color: "#FFFFFF", fontSize: 24, fontWeight: "300", lineHeight: 28 },
  reportEntryText: { flex: 1, marginLeft: 12 },
  reportEntryTitle: { fontFamily: fontFamilySans, fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  reportEntrySub: { fontFamily: fontFamilySans, fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 4 },
  entryArrow: { fontFamily: fontFamilySans, fontSize: 24, fontWeight: "300", color: colors.textMuted },
  upcoming: { marginBottom: spacing.xl },
  upcomingRow: { minHeight: 64, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  actionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand, marginRight: 12 },
  actionDotReport: { backgroundColor: colors.accent },
  upcomingText: { flex: 1, paddingVertical: 12 },
  upcomingTitle: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "600", color: colors.text },
  upcomingMeta: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  textLink: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark },
  archiveSummary: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.separator, marginTop: 2 },
  archiveCount: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700", color: colors.text },
  archiveSub: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4, maxWidth: 280 },
});
