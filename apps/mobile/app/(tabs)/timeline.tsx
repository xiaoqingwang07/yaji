import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Chip, Screen, StateBlock } from "@/components/ui";
import { colors, fontFamilySans, radii, spacing } from "@/constants/theme";
import { formatEventTypeLabel, formatListDateTime } from "@/src/fixtures/labels";
import type { TimelineEvent } from "@/src/fixtures/types";
import { go } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

type SubjectFilter = "ALL" | "MOTHER" | "BABY" | "FETUS";

function isFetalEvent(event: TimelineEvent) {
  return Boolean(event.aboutFetus) || Boolean(event.metrics?.some((metric) => /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT|羊水|胎盘|胎动/.test(metric.label)));
}

export default function TimelineScreen() {
  const { state } = usePrototype();
  const [subject, setSubject] = useState<SubjectFilter>("ALL");
  const filters: Array<[SubjectFilter, string]> = state.scenario === "PREGNANCY"
    ? [["ALL", "全部"], ["MOTHER", "妈妈"], ["FETUS", "胎儿"]]
    : [["ALL", "全部"], ["MOTHER", "妈妈"], ["BABY", "宝宝"]];

  const records = useMemo(
    () => state.events
      .filter((event) => {
        if (subject === "ALL") return true;
        if (subject === "FETUS") return isFetalEvent(event);
        if (subject === "MOTHER") return event.subject === "MOTHER" && !isFetalEvent(event);
        return event.subject === subject;
      })
      .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1)),
    [state.events, subject],
  );

  const reportCount = state.events.filter((event) => event.reportId).length;
  const monitorCount = state.events.filter((event) => event.source === "HEALTH_RECORD").length;
  const isEmpty = state.uiState === "empty" || records.length === 0;

  if (state.uiState === "loading") return <Screen safeTop><StateBlock kind="loading" /></Screen>;
  if (state.uiState === "error") return <Screen safeTop><StateBlock kind="error" onRetry={() => router.replace("/(tabs)/timeline")} /></Screen>;
  if (state.uiState === "forbidden") return <Screen safeTop><StateBlock kind="forbidden" /></Screen>;

  return (
    <Screen style={{ paddingHorizontal: 0 }} safeTop>
      <FlatList
        data={isEmpty ? [] : records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.title}>完整档案</Text>
                <Text style={styles.lead}>每一份报告，都能回到原件、解读和当时的记录。</Text>
              </View>
              <Pressable onPress={() => go("/add-menu")} style={styles.addButton}>
                <Text style={styles.addButtonText}>＋</Text>
              </Pressable>
            </View>

            {!isEmpty ? (
              <Pressable onPress={() => go("/summary/stage")} style={styles.summaryPanel}>
                <View style={styles.summaryCopy}>
                  <Text style={styles.summaryKicker}>系统整理</Text>
                  <Text style={styles.summaryTitle}>{reportCount} 份报告 · {monitorCount} 条健康记录</Text>
                  <Text style={styles.summaryHint}>查看阶段小结，把分散记录串成一条事实时间线。</Text>
                </View>
                <Text style={styles.summaryAction}>阶段小结 ›</Text>
              </Pressable>
            ) : null}

            {!isEmpty ? (
              <View style={styles.filters}>
                {filters.map(([key, label]) => <Chip key={key} label={label} active={subject === key} onPress={() => setSubject(key)} />)}
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <StateBlock kind="empty" />
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable onPress={() => router.push(`/event/${item.id}`)} style={({ pressed }) => [styles.record, pressed && styles.pressed]}>
            <View style={styles.rail}>
              <View style={[styles.dot, item.reportId && styles.dotReport]} />
              {index < records.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.recordBody}>
              <View style={styles.recordMeta}>
                <Text style={styles.type}>{formatEventTypeLabel(item)}</Text>
                <Text style={styles.date}>{formatListDateTime(item.occurredAt)}</Text>
              </View>
              <Text style={styles.recordTitle}>{item.title}</Text>
              {item.contextLabel ? <Text style={styles.context}>{item.contextLabel}{item.institution ? ` · ${item.institution}` : ""}</Text> : null}
              {item.metrics?.length ? (
                <Text style={styles.metrics} numberOfLines={1}>
                  {item.metrics.slice(0, 3).map((metric) => `${metric.label} ${metric.value}${metric.unit ? ` ${metric.unit}` : ""}`).join(" · ")}
                </Text>
              ) : null}
              {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 126 },
  header: { paddingHorizontal: spacing.screen, paddingBottom: spacing.md },
  topRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { fontFamily: fontFamilySans, fontSize: 26, fontWeight: "700", color: colors.text },
  lead: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 20, color: colors.textMuted, marginTop: 6, maxWidth: 280 },
  addButton: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandDeep },
  addButtonText: { fontFamily: fontFamilySans, fontSize: 28, lineHeight: 32, fontWeight: "300", color: "#FFFFFF" },
  summaryPanel: { backgroundColor: colors.warmCard, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xl },
  summaryCopy: { paddingRight: 6 },
  summaryKicker: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "700", color: colors.brandDark },
  summaryTitle: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 8 },
  summaryHint: { fontFamily: fontFamilySans, fontSize: 13, lineHeight: 20, color: colors.textSecondary, marginTop: 7 },
  summaryAction: { alignSelf: "flex-start", fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark, marginTop: 14 },
  filters: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.lg, marginBottom: 2 },
  emptyWrap: { paddingHorizontal: spacing.screen, paddingTop: spacing.xl },
  record: { flexDirection: "row", paddingHorizontal: spacing.screen, minHeight: 102 },
  pressed: { opacity: 0.68 },
  rail: { width: 22, alignItems: "center", paddingTop: 18 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brand },
  dotReport: { backgroundColor: colors.accent },
  line: { flex: 1, width: 1, backgroundColor: colors.fillStrong, marginTop: 7 },
  recordBody: { flex: 1, paddingTop: 14, paddingBottom: 17, paddingLeft: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  recordMeta: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "center" },
  type: { fontFamily: fontFamilySans, fontSize: 11, fontWeight: "700", color: colors.brandDark },
  date: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted },
  recordTitle: { fontFamily: fontFamilySans, fontSize: 16, fontWeight: "700", lineHeight: 23, color: colors.text, marginTop: 7 },
  context: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  metrics: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginTop: 8 },
  notes: { fontFamily: fontFamilySans, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 6 },
});
