import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Body, Screen } from "@/components/ui";
import { MetricStrip, parseMetricNumber, recentPair, resolveMetricKind, Sparkline, sparklineValues, trendPhrase } from "@/components/MetricVisual";
import { colors, fontFamilySans, metricPalette, radii, spacing } from "@/constants/theme";
import { formatDate } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";

const FETAL_LABEL = /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT|羊水|胎盘|宫高|胎动|胎方位|小脑/;

export default function HealthScreen() {
  const { state } = usePrototype();
  const [segment, setSegment] = useState<"MOTHER" | "BABY">(state.scenario === "PLANNING" ? "MOTHER" : "BABY");
  const [detailLabel, setDetailLabel] = useState<string | null>(null);
  const segments = state.scenario === "PREGNANCY"
    ? [["MOTHER", "妈妈"], ["BABY", "胎儿"]] as const
    : state.scenario === "BORN"
      ? [["MOTHER", "妈妈"], ["BABY", "宝宝"]] as const
      : [["MOTHER", "妈妈"]] as const;

  const { motherPoints, fetalPoints } = useMemo(() => ({
    fetalPoints: state.motherHealth.filter((point) => FETAL_LABEL.test(point.label)),
    motherPoints: state.motherHealth.filter((point) => !FETAL_LABEL.test(point.label)),
  }), [state.motherHealth]);

  const pool = useMemo(() => {
    if (segment === "MOTHER") return motherPoints;
    return state.scenario === "PREGNANCY" ? fetalPoints : state.babyHealth;
  }, [segment, state.scenario, state.babyHealth, motherPoints, fetalPoints]);

  const sortedPool = useMemo(() => [...pool].sort((a, b) => (a.recordedAt < b.recordedAt ? 1 : -1)), [pool]);
  const seriesByLabel = useMemo(() => {
    const series = new Map<string, number[]>();
    [...pool].sort((a, b) => (a.recordedAt > b.recordedAt ? 1 : -1)).forEach((point) => {
      const value = parseMetricNumber(point.value);
      if (value == null) return;
      series.set(point.label, [...(series.get(point.label) || []), value]);
    });
    return series;
  }, [pool]);
  const latestByLabel = useMemo(() => {
    const records = new Map<string, (typeof pool)[0]>();
    sortedPool.forEach((point) => { if (!records.has(point.label)) records.set(point.label, point); });
    return [...records.values()];
  }, [sortedPool]);
  const history = detailLabel ? [...pool].filter((point) => point.label === detailLabel).sort((a, b) => (a.recordedAt > b.recordedAt ? 1 : -1)) : [];
  const detailSeries = detailLabel ? seriesByLabel.get(detailLabel) || [] : [];
  const palette = detailLabel ? metricPalette[resolveMetricKind(detailLabel)] : metricPalette.default;
  const reportSourceCount = pool.filter((point) => /报告|超声|体检/.test(point.source)).length;

  return (
    <Screen safeTop>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!detailLabel ? (
          <>
            <Text style={styles.title}>健康趋势</Text>
            <Text style={styles.lead}>同一份档案，换一种方式看清每一次变化。</Text>

            {segments.length > 1 ? (
              <View style={styles.segmented}>
                {segments.map(([key, label]) => (
                  <Pressable key={key} onPress={() => { setSegment(key); setDetailLabel(null); }} style={[styles.segment, segment === key && styles.segmentActive]}>
                    <Text style={[styles.segmentText, segment === key && styles.segmentTextActive]}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {latestByLabel.length ? (
              <>
                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>最近记录</Text>
                  <Text style={styles.sectionHint}>点开查看完整来源</Text>
                </View>
                <MetricStrip
                  items={latestByLabel.map((point) => ({ label: point.label, value: point.value, unit: point.unit, series: seriesByLabel.get(point.label) }))}
                  onPressItem={setDetailLabel}
                />

                <View style={styles.provenance}>
                  <Text style={styles.provenanceTitle}>趋势只来自已确认记录</Text>
                  <Text style={styles.provenanceText}>{reportSourceCount ? `${reportSourceCount} 条来自报告，其余为居家或手动记录。` : "归档报告后，可以在这里与居家记录一起对照。"}</Text>
                </View>

                <View style={styles.sectionHead}>
                  <Text style={styles.sectionTitle}>全部指标</Text>
                  <Text style={styles.sectionHint}>{latestByLabel.length} 项</Text>
                </View>
                <View style={styles.metricList}>
                  {latestByLabel.map((point, index) => {
                    const values = seriesByLabel.get(point.label) || [];
                    return (
                      <Pressable key={point.label} onPress={() => setDetailLabel(point.label)} style={[styles.metricRow, index > 0 && styles.metricDivider]}>
                        <View style={styles.metricCopy}>
                          <Text style={styles.metricLabel}>{point.label}</Text>
                          <Text style={styles.metricMeta}>{formatDate(point.recordedAt)} · {point.source}</Text>
                        </View>
                        <View style={styles.metricValueWrap}>
                          <Text style={styles.metricValue}>{point.value}{point.unit ? <Text style={styles.metricUnit}> {point.unit}</Text> : null}</Text>
                          <Text style={styles.metricTrend}>{values.length > 1 ? trendPhrase(values) : "首条记录"}</Text>
                        </View>
                        <Text style={styles.arrow}>›</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : <Body muted>{"归档报告或记下一条数据后，这里会形成趋势。"}</Body>}
          </>
        ) : (
          <>
            <Pressable onPress={() => setDetailLabel(null)} style={styles.back}>
              <Text style={styles.backText}>‹ 所有指标</Text>
            </Pressable>
            <Text style={styles.title}>{detailLabel}</Text>
            <Text style={styles.lead}>仅对照你的档案记录，不构成医学结论。</Text>
            {detailSeries.length >= 2 ? (
              <View style={[styles.chartPanel, { backgroundColor: palette.bg }]}>
                <Text style={[styles.chartTrend, { color: palette.fg }]}>{trendPhrase(detailSeries)}</Text>
                <Sparkline values={sparklineValues(detailSeries)} color={palette.fg} width={280} height={74} />
                {(() => {
                  const pair = recentPair(detailSeries);
                  const previous = history.at(-2);
                  const latest = history.at(-1);
                  if (!pair || !previous || !latest) return null;
                  return <Text style={[styles.chartNumbers, { color: palette.fg }]}>{previous.value}{previous.unit ? ` ${previous.unit}` : ""} → {latest.value}{latest.unit ? ` ${latest.unit}` : ""}</Text>;
                })()}
              </View>
            ) : <View style={styles.oneRecord}><Text style={styles.oneRecordTitle}>还没有可对照的趋势</Text><Text style={styles.oneRecordText}>再有一条同指标记录，就会在这里连成线。</Text></View>}

            <Text style={styles.sectionTitle}>记录来源</Text>
            <View style={styles.historyList}>
              {[...history].reverse().map((point, index) => (
                <View key={point.id} style={[styles.historyRow, index > 0 && styles.metricDivider]}>
                  <View><Text style={styles.historyDate}>{formatDate(point.recordedAt)}</Text><Text style={styles.historySource}>{point.source}</Text></View>
                  <Text style={styles.historyValue}>{point.value}{point.unit ? ` ${point.unit}` : ""}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: 4, paddingBottom: 128 },
  title: { fontFamily: fontFamilySans, fontSize: 26, fontWeight: "700", color: colors.text },
  lead: { fontFamily: fontFamilySans, fontSize: 14, lineHeight: 21, color: colors.textMuted, marginTop: 7, maxWidth: 320 },
  segmented: { flexDirection: "row", alignSelf: "flex-start", borderRadius: radii.md, backgroundColor: colors.fill, padding: 3, marginTop: spacing.xl, marginBottom: spacing.xl },
  segment: { minWidth: 76, minHeight: 36, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 6 },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "600", color: colors.textMuted },
  segmentTextActive: { color: colors.brandDeep },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, marginTop: spacing.xl },
  sectionTitle: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", color: colors.text },
  sectionHint: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted },
  provenance: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator, paddingVertical: 14, marginTop: 2 },
  provenanceTitle: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "700", color: colors.text },
  provenanceText: { fontFamily: fontFamilySans, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
  metricList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator },
  metricRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10 },
  metricDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  metricCopy: { flex: 1 },
  metricLabel: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700", color: colors.text },
  metricMeta: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  metricValueWrap: { alignItems: "flex-end" },
  metricValue: { fontFamily: fontFamilySans, fontSize: 16, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
  metricUnit: { fontSize: 12, fontWeight: "400", color: colors.textMuted },
  metricTrend: { fontFamily: fontFamilySans, fontSize: 11, color: colors.textMuted, marginTop: 3 },
  arrow: { fontFamily: fontFamilySans, fontSize: 22, fontWeight: "300", color: colors.textMuted },
  back: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", marginBottom: spacing.lg },
  backText: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "700", color: colors.brandDark },
  chartPanel: { borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.xl, marginBottom: spacing.xl },
  chartTrend: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700" },
  chartNumbers: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", marginTop: 12, fontVariant: ["tabular-nums"] },
  oneRecord: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator, paddingVertical: spacing.lg, marginVertical: spacing.xl },
  oneRecordTitle: { fontFamily: fontFamilySans, fontSize: 16, fontWeight: "700", color: colors.text },
  oneRecordText: { fontFamily: fontFamilySans, fontSize: 13, color: colors.textMuted, marginTop: 5 },
  historyList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator, marginTop: 12 },
  historyRow: { minHeight: 62, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  historyDate: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "600", color: colors.text },
  historySource: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  historyValue: { fontFamily: fontFamilySans, fontSize: 17, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
});
