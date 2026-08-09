import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Body, Chip, Screen } from "@/components/ui";
import {
  MetricStrip,
  parseMetricNumber,
  recentPair,
  resolveMetricKind,
  Sparkline,
  sparklineValues,
  trendPhrase,
} from "@/components/MetricVisual";
import { colors, fontFamily, fontFamilySans, metricPalette, radii, shadows, spacing, WARM_COPY } from "@/constants/theme";
import { formatDate } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";

const FETAL_LABEL =
  /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT|羊水|胎盘|宫高|胎动|胎方位|小脑/;

export default function HealthScreen() {
  const { state } = usePrototype();
  const [seg, setSeg] = useState<"MOTHER" | "BABY">(
    state.scenario === "PREGNANCY" || state.scenario === "BORN" ? "BABY" : "MOTHER",
  );
  const [detailLabel, setDetailLabel] = useState<string | null>(null);

  const chips =
    state.scenario === "PREGNANCY"
      ? ([
          ["MOTHER", "妈妈"],
          ["BABY", "胎儿"],
        ] as const)
      : state.scenario === "BORN"
        ? ([
            ["MOTHER", "妈妈"],
            ["BABY", "宝宝"],
          ] as const)
        : ([["MOTHER", "妈妈"]] as const);

  const { motherPoints, fetalPoints } = useMemo(() => {
    const fetal = state.motherHealth.filter((p) => FETAL_LABEL.test(p.label));
    const mother = state.motherHealth.filter((p) => !FETAL_LABEL.test(p.label));
    return { motherPoints: mother, fetalPoints: fetal };
  }, [state.motherHealth]);

  const pool = useMemo(() => {
    if (seg === "BABY") {
      return state.scenario === "PREGNANCY" ? fetalPoints : state.babyHealth;
    }
    return motherPoints;
  }, [seg, state.scenario, state.babyHealth, motherPoints, fetalPoints]);

  const seriesByLabel = useMemo(() => {
    const map = new Map<string, number[]>();
    const sorted = [...pool].sort((a, b) =>
      a.recordedAt < b.recordedAt ? -1 : a.recordedAt > b.recordedAt ? 1 : 0,
    );
    sorted.forEach((p) => {
      const n = parseMetricNumber(p.value);
      if (n == null) return;
      const arr = map.get(p.label) || [];
      arr.push(n);
      map.set(p.label, arr);
    });
    return map;
  }, [pool]);

  const latestByLabel = useMemo(() => {
    const map = new Map<string, (typeof pool)[0]>();
    pool.forEach((p) => {
      if (!map.has(p.label)) map.set(p.label, p);
    });
    return Array.from(map.values());
  }, [pool]);

  const history = detailLabel
    ? [...pool]
        .filter((p) => p.label === detailLabel)
        .sort((a, b) => (a.recordedAt < b.recordedAt ? -1 : 1))
    : [];

  const detailSeries = detailLabel ? seriesByLabel.get(detailLabel) || [] : [];
  const detailKind = detailLabel ? resolveMetricKind(detailLabel) : "default";
  const detailPalette = metricPalette[detailKind];

  return (
    <Screen glow glowVariant="mint" safeTop>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>{WARM_COPY.healthLead}</Text>

        {chips.length > 1 ? (
          <View style={styles.row}>
            {chips.map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                active={seg === key}
                onPress={() => {
                  setSeg(key);
                  setDetailLabel(null);
                }}
              />
            ))}
          </View>
        ) : null}

        {!detailLabel ? (
          <>
            {latestByLabel.length === 0 ? (
              <Body muted>{WARM_COPY.healthEmpty}</Body>
            ) : (
              <MetricStrip
                items={latestByLabel.map((p) => ({
                  label: p.label,
                  value: p.value,
                  unit: p.unit,
                  series: seriesByLabel.get(p.label),
                }))}
                onPressItem={(label) => setDetailLabel(label)}
              />
            )}

            {seg === "BABY" && state.scenario === "BORN" && state.vaccines.length > 0 ? (
              <>
                <Text style={styles.sectionEditorial}>疫苗</Text>
                <View style={styles.vaxList}>
                  {state.vaccines.map((v) => (
                    <View key={v.id} style={styles.vaxRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.vaxName}>{v.name}</Text>
                        <Text style={styles.vaxMeta}>{formatDate(v.date)}</Text>
                      </View>
                      {v.dose ? (
                        <Text style={styles.vaxDose}>第 {v.dose} 剂</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.detailHead}>
              <Text style={styles.detailTitle}>{detailLabel}</Text>
              <Pressable onPress={() => setDetailLabel(null)} hitSlop={8}>
                <Text style={styles.detailBack}>返回</Text>
              </Pressable>
            </View>
            {detailSeries.length >= 2 ? (
              <View style={[styles.chartCard, { backgroundColor: detailPalette.bg }]}>
                <Text style={styles.chartHint}>{trendPhrase(detailSeries)}</Text>
                <Sparkline
                  values={sparklineValues(detailSeries)}
                  color={detailPalette.fg}
                  width={260}
                  height={64}
                />
                {(() => {
                  const pair = recentPair(detailSeries);
                  const prevPt = history[history.length - 2];
                  const lastPt = history[history.length - 1];
                  if (!pair || !prevPt || !lastPt) return null;
                  const unit = lastPt.unit ? ` ${lastPt.unit}` : "";
                  return (
                    <>
                      <Text style={styles.pairLabel}>上次 → 这次</Text>
                      <Text style={[styles.chartRange, { color: detailPalette.fg }]}>
                        {prevPt.value}
                        {unit}
                        {"  →  "}
                        {lastPt.value}
                        {unit}
                      </Text>
                      {history.length > 2 ? (
                        <Text style={styles.spanHint}>
                          自首次记录：{history[0].value}
                          {history[0].unit ? ` ${history[0].unit}` : ""}
                          {" → "}
                          {lastPt.value}
                          {unit}
                        </Text>
                      ) : null}
                    </>
                  );
                })()}
                <Text style={styles.boundary}>仅为档案内数值对照，非医学结论</Text>
              </View>
            ) : (
              <Body muted>再有一条同指标记录，就会在这里连成线。</Body>
            )}
            <View style={styles.histList}>
              {[...history].reverse().map((p) => (
                <View key={p.id} style={styles.histRow}>
                  <Text style={styles.histValue}>
                    {p.value}
                    {p.unit ? ` ${p.unit}` : ""}
                  </Text>
                  <Text style={styles.histMeta}>
                    {formatDate(p.recordedAt)} · {p.source}
                  </Text>
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
  wrap: { paddingBottom: 128, paddingTop: 8 },
  lead: {
    fontFamily,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 34,
    letterSpacing: 0.4,
    marginBottom: spacing.xl,
  },
  detailHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  detailTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  detailBack: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "700",
    color: colors.brand,
  },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg },
  sectionEditorial: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: 12,
  },
  vaxList: { marginBottom: spacing.lg },
  vaxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  vaxName: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  vaxMeta: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  vaxDose: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandDark,
    backgroundColor: colors.brandSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  histList: { marginTop: spacing.sm },
  histRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  histValue: {
    fontFamily: fontFamilySans,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  histMeta: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  chartCard: {
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...(shadows.sm as object),
  },
  chartHint: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pairLabel: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.md,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  chartRange: {
    fontFamily: fontFamilySans,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.3,
  },
  spanHint: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontVariant: ["tabular-nums"],
  },
  boundary: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.md,
    lineHeight: 16,
  },
});
