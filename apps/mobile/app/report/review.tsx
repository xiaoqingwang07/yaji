import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import {
  Body,
  Button,
  Caption,
  Disclaimer,
  LowConfidenceBadge,
  Screen,
} from "@/components/ui";
import { MetricStrip, resolveMetricKind } from "@/components/MetricVisual";
import { AiAssistChip, SproutMark } from "@/components/YajiMark";
import { colors, fontFamily, fontFamilySans, radii, shadows, spacing, typography, WARM_COPY } from "@/constants/theme";
import { CATEGORY_LABELS } from "@/src/fixtures/labels";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import { resolveSuggestions } from "@/src/utils/suggestions";

const THRESHOLD = 0.85;

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
  const successScale = useRef(new Animated.Value(0.9)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const readingItems = useMemo(() => {
    if (!report) return [];
    const items =
      report.plainReadingItems && report.plainReadingItems.length > 0
        ? report.plainReadingItems
        : report.plainReading
          ? [{ id: "legacy", text: report.plainReading, citation: "报告原文" }]
          : [];
    return items.slice(0, 3);
  }, [report]);

  const citationVisible = useMemo(() => {
    const seen = new Set<string>();
    return readingItems.map((item) => {
      if (seen.has(item.citation)) return false;
      seen.add(item.citation);
      return true;
    });
  }, [readingItems]);

  useEffect(() => {
    if (report?.status === "CONFIRMED") {
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          friction: 8,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
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
      <Screen glow glowVariant="mint">
        <Animated.View
          style={[
            styles.successBox,
            { opacity: successOpacity, transform: [{ scale: successScale }] },
          ]}
        >
          <SproutMark size={64} breathe />
          <Text style={styles.successTitle}>{WARM_COPY.confirmSuccess}</Text>
          <Text style={styles.successHint}>{WARM_COPY.confirmSuccessHint}</Text>
          <Button label="回到此刻" onPress={() => goReplace("/(tabs)/now")} />
        </Animated.View>
      </Screen>
    );
  }

  const visualFields = report.fields.filter(
    (f) => f.fieldType === "MEASUREMENT" || resolveMetricKind(f.label) !== "default",
  );
  const measurementFields = report.fields.filter((f) => f.fieldType === "MEASUREMENT");
  const syncAllOn =
    measurementFields.length > 0 && measurementFields.every((f) => f.syncToHealth);
  const lowCount = report.fields.filter((f) => f.confidence < THRESHOLD).length;
  const suggestions = useMemo(
    () => resolveSuggestions(report.suggestedNext, state),
    [report.suggestedNext, state],
  );
  const pendingSuggestions = suggestions.filter((s) => !s.accepted).length;

  const setSyncAll = (value: boolean) => {
    measurementFields.forEach((f) => updateReportField(f.id, { syncToHealth: value }));
  };

  return (
    <Screen>
      <View style={styles.root}>
        <ScrollView
          style={styles.scrollFlex}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Step 1: 先懂 */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepLabel}>理解</Text>
          </View>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportMeta}>
            {report.institution || "医院待补"} · {report.reportDate || "日期待补"} ·{" "}
            {CATEGORY_LABELS[report.category] || report.category}
          </Text>

          {readingItems.length > 0 ? (
            <View style={styles.aiBlock}>
              <View style={styles.aiHead}>
                <AiAssistChip />
              </View>
              <View style={styles.readingBox}>
                {readingItems.map((item, index) => (
                  <View
                    key={item.id}
                    style={[
                      styles.readingItem,
                      index < readingItems.length - 1 && styles.readingBorder,
                    ]}
                  >
                    <Text style={styles.readingText}>{item.text}</Text>
                    {citationVisible[index] ? (
                      <Text style={styles.citation}>— {item.citation}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Step 2: 再核 */}
          {visualFields.length > 0 ? (
            <>
              <View style={styles.stepHeader}>
                <Text style={styles.stepLabel}>核对</Text>
              </View>
              <MetricStrip
                items={visualFields.slice(0, 4).map((f) => ({
                  label: f.label,
                  value: f.value,
                  unit: f.unit,
                }))}
              />
            </>
          ) : null}

          {measurementFields.length > 0 ? (
            <View style={styles.syncMaster}>
              <View style={{ flex: 1 }}>
                <Text style={styles.syncLabel}>一并记入健康趋势</Text>
                <Caption>确认前不会写入档案</Caption>
              </View>
              <Switch
                value={syncAllOn}
                onValueChange={setSyncAll}
                trackColor={{ true: colors.brand, false: colors.fillStrong }}
              />
            </View>
          ) : null}

          <Pressable
            onPress={() => setFieldsOpen((v) => !v)}
            style={styles.foldHead}
            hitSlop={6}
          >
            <Text style={styles.foldTitle}>
              全部字段（{report.fields.length}）
              {lowCount > 0 ? ` · ${lowCount} 待核对` : ""}
            </Text>
            <Text style={styles.foldChevron}>
              {fieldsOpen ? "收起" : "展开"}
            </Text>
          </Pressable>

          {fieldsOpen ? (
            <View style={styles.fieldList}>
              {report.fields.map((f, index) => {
                const low = f.confidence < THRESHOLD;
                return (
                  <View
                    key={f.id}
                    style={[
                      styles.fieldRow,
                      index < report.fields.length - 1 && styles.fieldBorder,
                    ]}
                  >
                    <View style={styles.fieldHead}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      {low ? <LowConfidenceBadge /> : null}
                    </View>
                    <Text style={styles.fieldValue}>
                      {f.value}
                      {f.unit ? <Text style={styles.fieldUnit}> {f.unit}</Text> : null}
                    </Text>
                    {f.referenceRange ? (
                      <Caption>参考 {f.referenceRange}</Caption>
                    ) : null}
                    {f.sourceFlag ? <Caption>原报告标记：{f.sourceFlag}</Caption> : null}
                    {low ? (
                      <Pressable
                        onPress={() => updateReportField(f.id, { confidence: 0.99 })}
                        style={styles.markOk}
                      >
                        <Text style={styles.markOkText}>标记已核对</Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Step 3: 采纳 */}
          {suggestions.length > 0 ? (
            <>
              <View style={styles.stepHeader}>
                <Text style={styles.stepLabel}>采纳</Text>
              </View>
              <View style={styles.suggestHead}>
                <Text style={styles.suggestTitle}>可采纳的下一步</Text>
                {canWrite && pendingSuggestions > 0 ? (
                  <Pressable onPress={() => acceptAllSuggestions()} hitSlop={8}>
                    <Text style={styles.acceptAll}>全部采纳</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={styles.suggestLead}>
                提醒或携带清单；采纳并确认归档后才生效
              </Text>
              <View style={styles.suggestList}>
                {suggestions.map((s, index) => (
                  <View
                    key={s.id}
                    style={[
                      styles.suggestItem,
                      index < suggestions.length - 1 && styles.suggestBorder,
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={styles.suggestItemTitle}>{s.title}</Text>
                      {s.detail ? (
                        <Text style={styles.suggestItemDetail}>{s.detail}</Text>
                      ) : null}
                    </View>
                    <Pressable
                      disabled={!canWrite || s.accepted}
                      onPress={() => acceptSuggestion(s.id)}
                      style={[styles.acceptBtn, s.accepted && styles.acceptDone]}
                    >
                      <Text
                        style={[
                          styles.acceptText,
                          s.accepted && styles.acceptTextDone,
                        ]}
                      >
                        {s.accepted ? "已采纳" : "采纳"}
                      </Text>
                    </Pressable>
                  </View>
                ))}
                <View style={[styles.fieldRow, styles.bringRow]}>
                  <Text style={styles.syncLabel}>加入下次就诊携带清单</Text>
                  <Switch
                    value={Boolean(report.addToBringList)}
                    onValueChange={setReportBringFlag}
                    trackColor={{ true: colors.brand, false: colors.fillStrong }}
                  />
                </View>
              </View>
            </>
          ) : null}

          <Disclaimer kind="report" />
          {!canWrite ? <Caption>仅查看角色不能确认归档</Caption> : null}
        </ScrollView>

        {/* Step 4: 归档 */}
        <View style={styles.footer}>
          <Button
            label="确认归档"
            disabled={!canWrite}
            onPress={() => {
              confirmReport();
            }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollFlex: { flex: 1 },
  scroll: { paddingBottom: 24, paddingTop: 8 },
  emptyCenter: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.lg },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    backgroundColor: colors.bg,
    zIndex: 2,
    ...Platform.select({
      web: {
        position: "sticky" as unknown as "absolute",
        bottom: 0,
      },
      default: {},
    }),
  },
  stepHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  stepLabel: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.brand,
    textTransform: "uppercase",
  },
  reportTitle: {
    fontFamily,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  reportMeta: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  aiBlock: { marginTop: spacing.lg, marginBottom: spacing.md },
  aiHead: {
    marginBottom: spacing.sm,
  },
  suggestHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  suggestTitle: {
    fontFamily: fontFamilySans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  acceptAll: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand,
  },
  suggestLead: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  fieldList: {
    marginBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  fieldRow: {
    paddingHorizontal: 2,
    paddingVertical: 14,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  suggestList: {
    marginBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
  suggestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  suggestBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  suggestItemTitle: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 21,
  },
  suggestItemDetail: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 18,
  },
  fieldHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  fieldValue: {
    fontFamily: fontFamilySans,
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
  },
  fieldUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textMuted,
  },
  syncMaster: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginBottom: spacing.md,
    gap: spacing.md,
    ...(shadows.sm as object),
  },
  syncLabel: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamilySans,
    fontWeight: "600",
  },
  foldHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  foldTitle: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    flex: 1,
  },
  foldChevron: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.brand,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  markOk: { marginTop: 8 },
  markOkText: { color: colors.brand, fontSize: 14, fontWeight: "700", fontFamily: fontFamilySans },
  readingBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    borderLeftWidth: 3,
    borderLeftColor: colors.brand,
    ...(shadows.sm as object),
  },
  readingItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  readingBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(61, 122, 100, 0.12)",
  },
  readingText: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  citation: {
    marginTop: 8,
    fontSize: 12,
    color: colors.brandDark,
    fontFamily: fontFamilySans,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  acceptBtn: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptDone: { backgroundColor: colors.fill },
  acceptText: {
    color: colors.brandDark,
    fontSize: 13,
    fontWeight: "700",
    fontFamily: fontFamilySans,
  },
  acceptTextDone: { color: colors.textMuted },
  bringRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  successBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    paddingBottom: 64,
    paddingHorizontal: spacing.xl,
  },
  successTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  successHint: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
});
