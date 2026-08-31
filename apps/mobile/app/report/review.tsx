import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Body, Button, Disclaimer, LowConfidenceBadge, Screen } from "@/components/ui";
import { MetricStrip, resolveMetricKind } from "@/components/MetricVisual";
import { AiAssistChip, SproutMark } from "@/components/YajiMark";
import { colors, fontFamilySans, radii, spacing } from "@/constants/theme";
import { CATEGORY_LABELS } from "@/src/fixtures/labels";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import { resolveSuggestions } from "@/src/utils/suggestions";

const THRESHOLD = 0.85;

function cleanMetricLabel(label: string) {
  return label.replace(/\s*(BPD|HC|AC|FL|CRL)/g, "").trim();
}

export default function ReportReviewScreen() {
  const {
    state,
    updateReportField,
    confirmReport,
    canWrite,
    acceptSuggestion,
    acceptAllSuggestions,
    setReportBringFlag,
  } = usePrototype();
  const report = state.report;
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const successScale = useRef(new Animated.Value(0.94)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const readingItems = useMemo(() => {
    if (!report) return [];
    if (report.plainReadingItems?.length) return report.plainReadingItems.slice(0, 3);
    return report.plainReading ? [{ id: "legacy", text: report.plainReading, citation: "报告原文" }] : [];
  }, [report]);

  useEffect(() => {
    if (report?.status !== "CONFIRMED") return;
    Animated.parallel([
      Animated.timing(successOpacity, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(successScale, { toValue: 1, friction: 9, tension: 90, useNativeDriver: true }),
    ]).start();
  }, [report?.status, successOpacity, successScale]);

  if (!report) {
    return (
      <Screen>
        <View style={styles.emptyCenter}>
          <Body muted>没有待确认的报告。</Body>
          <Button label="关闭" variant="ghost" onPress={() => goReplace("/(tabs)/now")} />
        </View>
      </Screen>
    );
  }

  if (report.status === "CONFIRMED") {
    return (
      <Screen>
        <Animated.View style={[styles.successBox, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
          <SproutMark size={58} />
          <Text style={styles.successTitle}>这份报告已归入档案</Text>
          <Text style={styles.successHint}>解读、趋势和下一步已经同步到你们的档案。</Text>
          <Button label="回到此刻" onPress={() => goReplace("/(tabs)/now")} />
        </Animated.View>
      </Screen>
    );
  }

  const measurementFields = report.fields.filter((field) => field.fieldType === "MEASUREMENT");
  const visualFields = report.fields.filter(
    (field) => field.fieldType === "MEASUREMENT" || resolveMetricKind(field.label) !== "default",
  );
  const syncAllOn = measurementFields.length > 0 && measurementFields.every((field) => field.syncToHealth);
  const lowCount = report.fields.filter((field) => field.confidence < THRESHOLD).length;
  const suggestions = resolveSuggestions(report.suggestedNext, state);
  const pendingSuggestions = suggestions.filter((item) => !item.accepted).length;

  const relatedHistory = measurementFields
    .slice(0, 3)
    .map((field) => {
      const history = state.events
        .flatMap((event) => event.metrics || [])
        // Similar everyday labels can refer to different measurements across records.
        .filter((metric) => metric.label === field.label);
      return { field, count: history.length, previous: history.at(-1) };
    })
    .filter((item) => item.count > 0);

  const setSyncAll = (value: boolean) => {
    measurementFields.forEach((field) => updateReportField(field.id, { syncToHealth: value }));
  };

  return (
    <Screen>
      <View style={styles.root}>
        <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.kicker}>报告解读</Text>
              <Text style={styles.headerHint}>确认后才会写入正式档案</Text>
            </View>
            <Text style={styles.status}>待确认</Text>
          </View>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportMeta}>
            {[report.institution || "医院待补", report.reportDate || "日期待补", CATEGORY_LABELS[report.category] || report.category].join(" · ")}
          </Text>

          <View style={styles.explanationPanel}>
            <AiAssistChip label="芽纪解读" />
            <Text style={styles.explanationTitle}>这份报告告诉你什么</Text>
            {readingItems.length ? (
              <View style={styles.readingList}>
                {readingItems.map((item, index) => (
                  <View key={item.id} style={[styles.readingItem, index > 0 && styles.readingDivider]}>
                    <Text style={styles.readingText}>{item.text}</Text>
                    <Text style={styles.citation}>{item.citation}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.readingText}>不确定，请核对原报告。</Text>
            )}
          </View>

          {visualFields.length ? (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>关键数值</Text>
                <Text style={styles.sectionHint}>可同步为趋势</Text>
              </View>
              <MetricStrip items={visualFields.slice(0, 4).map((field) => ({ label: field.label, value: field.value, unit: field.unit }))} />
            </View>
          ) : null}

          {relatedHistory.length ? (
            <View style={styles.connectionPanel}>
              <Text style={styles.connectionTitle}>它会怎样接上你的档案</Text>
              {relatedHistory.map(({ field, count, previous }) => (
                <View key={field.id} style={styles.connectionRow}>
                  <Text style={styles.connectionLabel}>{cleanMetricLabel(field.label)}</Text>
                  <Text style={styles.connectionText}>
                    已有 {count} 次记录{previous ? ` · 上次 ${previous.value}${previous.unit ? ` ${previous.unit}` : ""}` : ""}
                  </Text>
                </View>
              ))}
              <Text style={styles.connectionNote}>确认后，选择同步的数值会进入同一条健康趋势，可随时回到原始报告。</Text>
            </View>
          ) : null}

          {measurementFields.length ? (
            <View style={styles.syncRow}>
              <View style={styles.syncCopy}>
                <Text style={styles.syncTitle}>记入健康趋势</Text>
                <Text style={styles.syncHint}>你确认后才会同步，可随时查看来源报告</Text>
              </View>
              <Switch value={syncAllOn} onValueChange={setSyncAll} trackColor={{ true: colors.brand, false: colors.fillStrong }} />
            </View>
          ) : null}

          {suggestions.length ? (
            <View style={styles.section}>
              <View style={styles.sectionHead}>
                <View>
                  <Text style={styles.sectionTitle}>帮你记住的下一步</Text>
                  <Text style={styles.sectionHint}>采纳并归档后才会生效</Text>
                </View>
                {canWrite && pendingSuggestions ? (
                  <Pressable onPress={() => acceptAllSuggestions()}><Text style={styles.link}>全部采纳</Text></Pressable>
                ) : null}
              </View>
              <View style={styles.suggestionList}>
                {suggestions.map((item, index) => (
                  <View key={item.id} style={[styles.suggestionRow, index > 0 && styles.suggestionDivider]}>
                    <View style={styles.suggestionCopy}>
                      <Text style={styles.suggestionTitle}>{item.title}</Text>
                      {item.detail ? <Text style={styles.suggestionDetail}>{item.detail}</Text> : null}
                    </View>
                    <Pressable
                      disabled={!canWrite || item.accepted}
                      onPress={() => acceptSuggestion(item.id)}
                      style={[styles.acceptButton, item.accepted && styles.acceptButtonDone]}
                    >
                      <Text style={[styles.acceptText, item.accepted && styles.acceptTextDone]}>{item.accepted ? "已采纳" : "采纳"}</Text>
                    </Pressable>
                  </View>
                ))}
                <View style={[styles.suggestionRow, styles.bringRow]}>
                  <Text style={styles.suggestionTitle}>加入下次就诊携带清单</Text>
                  <Switch value={Boolean(report.addToBringList)} onValueChange={setReportBringFlag} trackColor={{ true: colors.brand, false: colors.fillStrong }} />
                </View>
              </View>
            </View>
          ) : null}

          <Pressable onPress={() => setFieldsOpen((open) => !open)} style={styles.sourcePanel}>
            <View style={styles.sourceMark}><Text style={styles.sourceMarkText}>原</Text></View>
            <View style={styles.sourceCopy}>
              <Text style={styles.sourceTitle}>原始报告与识别字段</Text>
              <Text style={styles.sourceHint}>{report.pages.length} 页原件 · {report.fields.length} 个识别字段{lowCount ? ` · ${lowCount} 个待核对` : ""}</Text>
            </View>
            <Text style={styles.sourceAction}>{fieldsOpen ? "收起" : "查看"}</Text>
          </Pressable>

          {fieldsOpen ? (
            <View style={styles.fieldList}>
              {report.fields.map((field, index) => {
                const low = field.confidence < THRESHOLD;
                return (
                  <View key={field.id} style={[styles.fieldRow, index > 0 && styles.fieldDivider]}>
                    <View style={styles.fieldHead}>
                      <Text style={styles.fieldLabel}>{field.label}</Text>
                      {low ? <LowConfidenceBadge /> : null}
                    </View>
                    <Text style={styles.fieldValue}>{field.value}{field.unit ? <Text style={styles.fieldUnit}> {field.unit}</Text> : null}</Text>
                    {field.referenceRange ? <Text style={styles.fieldMeta}>参考范围 {field.referenceRange}</Text> : null}
                    {field.sourceFlag ? <Text style={styles.fieldMeta}>原报告标记：{field.sourceFlag}</Text> : null}
                    {low ? <Pressable onPress={() => updateReportField(field.id, { confidence: 0.99 })}><Text style={styles.verifyLink}>标记已核对</Text></Pressable> : null}
                  </View>
                );
              })}
            </View>
          ) : null}

          <Disclaimer kind="report" />
          {!canWrite ? <Text style={styles.readOnly}>仅查看角色不能确认归档</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button label="确认并归档" disabled={!canWrite} onPress={confirmReport} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFlex: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 24 },
  emptyCenter: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  kicker: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "700", color: colors.brandDark },
  headerHint: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  status: { fontFamily: fontFamilySans, fontSize: 12, fontWeight: "700", color: colors.accent, backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: radii.sm },
  reportTitle: { fontFamily: fontFamilySans, fontSize: 26, fontWeight: "700", color: colors.text, lineHeight: 35 },
  reportMeta: { fontFamily: fontFamilySans, fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 7 },
  explanationPanel: { backgroundColor: colors.warmCard, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.lg },
  explanationTitle: { fontFamily: fontFamilySans, fontSize: 19, fontWeight: "700", color: colors.text, marginTop: 14 },
  readingList: { marginTop: 10 },
  readingItem: { paddingVertical: 12 },
  readingDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,34,29,0.10)" },
  readingText: { fontFamily: fontFamilySans, fontSize: 15, lineHeight: 23, color: colors.text },
  citation: { fontFamily: fontFamilySans, fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.brandDark, marginTop: 7 },
  section: { marginTop: spacing.xl },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12 },
  sectionTitle: { fontFamily: fontFamilySans, fontSize: 18, fontWeight: "700", color: colors.text },
  sectionHint: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  link: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark },
  connectionPanel: { marginTop: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator, paddingVertical: 14 },
  connectionTitle: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 6 },
  connectionRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingVertical: 7 },
  connectionLabel: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  connectionText: { flex: 1, fontFamily: fontFamilySans, fontSize: 13, color: colors.textMuted, textAlign: "right" },
  connectionNote: { fontFamily: fontFamilySans, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 8 },
  syncRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.separator },
  syncCopy: { flex: 1 },
  syncTitle: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700", color: colors.text },
  syncHint: { fontFamily: fontFamilySans, fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 4 },
  suggestionList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.separator },
  suggestionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 12 },
  suggestionDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  suggestionCopy: { flex: 1 },
  suggestionTitle: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "600", color: colors.text, lineHeight: 21 },
  suggestionDetail: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, lineHeight: 18, marginTop: 3 },
  acceptButton: { minHeight: 34, justifyContent: "center", paddingHorizontal: 12, borderRadius: radii.md, backgroundColor: colors.brandSoft },
  acceptButtonDone: { backgroundColor: colors.fill },
  acceptText: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark },
  acceptTextDone: { color: colors.textMuted },
  bringRow: { justifyContent: "space-between" },
  sourcePanel: { minHeight: 74, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, marginTop: spacing.xl },
  sourceMark: { width: 34, height: 34, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.fill },
  sourceMarkText: { fontFamily: fontFamilySans, fontSize: 14, fontWeight: "700", color: colors.brandDark },
  sourceCopy: { flex: 1, marginLeft: 11 },
  sourceTitle: { fontFamily: fontFamilySans, fontSize: 15, fontWeight: "700", color: colors.text },
  sourceHint: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sourceAction: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark },
  fieldList: { borderBottomWidth: 1, borderColor: colors.separator },
  fieldRow: { paddingVertical: 14 },
  fieldDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator },
  fieldHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  fieldLabel: { flex: 1, fontFamily: fontFamilySans, fontSize: 13, color: colors.textMuted },
  fieldValue: { fontFamily: fontFamilySans, fontSize: 21, fontWeight: "700", color: colors.text, marginTop: 5, fontVariant: ["tabular-nums"] },
  fieldUnit: { fontSize: 13, fontWeight: "400", color: colors.textMuted },
  fieldMeta: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  verifyLink: { fontFamily: fontFamilySans, fontSize: 13, fontWeight: "700", color: colors.brandDark, marginTop: 8 },
  readOnly: { fontFamily: fontFamilySans, fontSize: 12, color: colors.textMuted, marginTop: 8 },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    backgroundColor: colors.bg,
    ...Platform.select({ web: { position: "sticky" as unknown as "absolute", bottom: 0 }, default: {} }),
  },
  successBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, paddingBottom: 64, paddingHorizontal: spacing.xl },
  successTitle: { fontFamily: fontFamilySans, fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center" },
  successHint: { fontFamily: fontFamilySans, fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: "center", marginBottom: spacing.md },
});
