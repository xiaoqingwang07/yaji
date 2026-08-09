import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Body,
  Button,
  Chip,
  Disclaimer,
  Group,
  Row,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { colors, fontFamily, radii, spacing, typography } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

const RANGES = ["近 1 个月", "近 3 个月", "近 6 个月", "整个孕期"] as const;

export default function StageSummaryScreen() {
  const { state, generateStageSummary, adoptOpenFollowUp } = usePrototype();
  const [range, setRange] = useState<(typeof RANGES)[number]>("近 3 个月");
  const [showFull, setShowFull] = useState(false);
  const summary = state.stageSummary;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          {RANGES.map((r) => (
            <Chip key={r} label={r} active={range === r} onPress={() => setRange(r)} />
          ))}
        </View>

        {!summary ? (
          <>
            <Body muted>基于已确认档案汇总事实，不产生新的医学结论。生成后默认给家人看的简版。</Body>
            <Button
              label="生成小结"
              onPress={() => {
                setShowFull(false);
                generateStageSummary(range);
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.familyLabel}>家人简版</Text>
            <View style={styles.simpleBox}>
              <Text style={styles.simpleText}>{summary.simplified}</Text>
            </View>

            <Pressable
              onPress={() => setShowFull((v) => !v)}
              style={styles.expandHead}
              hitSlop={6}
            >
              <Text style={styles.expandTitle}>
                {showFull ? "收起完整分区" : "展开完整分区"}
              </Text>
              <Text style={styles.expandHint}>时间线 · 指标 · 结论</Text>
            </Pressable>

            {showFull ? (
              <>
                <SectionHeader title="检查时间线" />
                <Group>
                  {summary.timeline.map((t, i) => (
                    <Row
                      key={`${t.date}-${t.title}`}
                      title={t.title}
                      subtitle={[t.date, t.place].filter(Boolean).join(" · ")}
                      showSeparator={i < summary.timeline.length - 1}
                    />
                  ))}
                </Group>

                <SectionHeader title="指标变化" />
                <Group>
                  {summary.metrics.map((m, i) => (
                    <Row
                      key={m.label}
                      title={m.label}
                      detail={m.values}
                      showSeparator={i < summary.metrics.length - 1}
                    />
                  ))}
                </Group>

                <SectionHeader title="医院结论" />
                <View style={styles.quoteBox}>
                  {summary.conclusions.map((c) => (
                    <View key={c.source + c.quote} style={styles.quoteItem}>
                      <Text style={styles.quoteText}>「{c.quote}」</Text>
                      <Text style={styles.citation}>来源 · {c.source}</Text>
                    </View>
                  ))}
                </View>

                <SectionHeader title="叮嘱与未闭环" />
                <Group>
                  {[...summary.notes, ...summary.openFollowUps.map((o) => o.text)].map(
                    (n, i, arr) => (
                      <Row key={`${n}-${i}`} title={n} showSeparator={i < arr.length - 1} />
                    ),
                  )}
                </Group>
                {summary.openFollowUps.length > 0 ? (
                  <Button
                    label="把未闭环设为提醒"
                    variant="secondary"
                    onPress={() => adoptOpenFollowUp(summary.openFollowUps[0].id)}
                  />
                ) : null}
              </>
            ) : null}

            <Disclaimer kind="stageSummary" />

            <Button
              label="重新生成"
              variant="ghost"
              onPress={() => {
                setShowFull(false);
                generateStageSummary(range);
              }}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 48, paddingTop: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
  familyLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: colors.brandDark,
    marginBottom: spacing.sm,
  },
  quoteBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  quoteItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  quoteText: { ...typography.body, fontSize: 16, lineHeight: 24 },
  citation: {
    marginTop: 8,
    fontSize: 13,
    color: colors.brandDark,
    fontFamily,
    fontWeight: "500",
  },
  simpleBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  simpleText: { ...typography.body, lineHeight: 26 },
  expandHead: {
    paddingVertical: 12,
    marginBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  expandTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "600",
    color: colors.brandDark,
  },
  expandHint: {
    fontFamily,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
