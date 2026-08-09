import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Caption, Chip, CollapsibleSection, Screen, StateBlock } from "@/components/ui";
import { colors, fontFamily, fontFamilySans, radii, spacing, WARM_COPY } from "@/constants/theme";
import { formatEventTypeLabel, formatListDateTime } from "@/src/fixtures/labels";
import type { TimelineEvent } from "@/src/fixtures/types";
import { go } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

type SubjectFilter = "ALL" | "MOTHER" | "BABY" | "FETUS";

function clinicalRank(e: TimelineEvent): number {
  if (e.type === "MEDICAL_REPORT" || e.type === "PRENATAL_CHECK" || e.type === "POSTPARTUM_CHECK")
    return 0;
  if (e.type === "BABY_CHECKUP" || e.type === "VACCINATION") return 1;
  if (e.type === "MILESTONE") return 3;
  return 2;
}

export default function TimelineScreen() {
  const { state } = usePrototype();
  const [subject, setSubject] = useState<SubjectFilter>("ALL");

  const filters: Array<[SubjectFilter, string]> =
    state.scenario === "PREGNANCY"
      ? [
          ["ALL", "全部"],
          ["MOTHER", "妈妈"],
          ["FETUS", "胎儿"],
        ]
      : [
          ["ALL", "全部"],
          ["MOTHER", "妈妈"],
          ["BABY", "宝宝"],
        ];

  const data = useMemo(() => {
    return state.events
      .filter((e) => {
        if (subject === "ALL") return true;
        if (subject === "FETUS")
          return (
            Boolean(e.aboutFetus) ||
            Boolean(
              e.metrics?.some((m) =>
                /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT|羊水|胎盘|胎方位|胎动|宫高/.test(
                  m.label,
                ),
              ),
            )
          );
        if (subject === "BABY") return e.subject === "BABY";
        if (subject === "MOTHER") return e.subject === "MOTHER" && !e.aboutFetus;
        return e.subject === subject;
      })
      .sort((a, b) => {
        const ra = clinicalRank(a);
        const rb = clinicalRank(b);
        if (ra !== rb) return ra - rb;
        return a.occurredAt < b.occurredAt ? 1 : -1;
      });
  }, [state.events, subject]);

  const isEmpty = state.uiState === "empty" || data.length === 0;
  const filterLabel = filters.find(([k]) => k === subject)?.[1] ?? "全部";

  if (state.uiState === "loading") {
    return (
      <Screen safeTop>
        <StateBlock kind="loading" />
      </Screen>
    );
  }
  if (state.uiState === "error") {
    return (
      <Screen safeTop>
        <StateBlock kind="error" onRetry={() => router.replace("/(tabs)/timeline")} />
      </Screen>
    );
  }
  if (state.uiState === "forbidden") {
    return (
      <Screen safeTop>
        <StateBlock kind="forbidden" />
      </Screen>
    );
  }

  return (
    <Screen style={{ paddingHorizontal: 0 }} glow safeTop>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.familyTitle} numberOfLines={1}>
            {state.familyName}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.collectBtn, pressed && { opacity: 0.72 }]}
            onPress={() => go("/add-menu")}
            hitSlop={8}
          >
            <Text style={styles.collectText}>{WARM_COPY.collectAction}</Text>
          </Pressable>
        </View>

        {!isEmpty ? (
          <CollapsibleSection
            title="筛选与小结"
            summary={filterLabel === "全部" ? "全部 · 阶段小结" : `${filterLabel} · 阶段小结`}
            defaultOpen={false}
          >
            <Pressable style={styles.summaryEntry} onPress={() => go("/summary/stage")}>
              <Text style={styles.summaryTitle}>阶段小结</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            {filters.length > 1 ? (
              <View style={styles.row}>
                {filters.map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    active={subject === key}
                    onPress={() => setSubject(key)}
                  />
                ))}
              </View>
            ) : null}
          </CollapsibleSection>
        ) : null}
      </View>

      {isEmpty ? (
        <View style={{ paddingHorizontal: spacing.screen }}>
          <StateBlock kind="empty" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 120 }}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => router.push(`/event/${item.id}`)}
              style={({ pressed }) => [
                styles.eventCard,
                index === 0 && styles.eventCardFirst,
                pressed && { opacity: 0.72 },
              ]}
            >
              <View style={styles.eventLeft}>
                <View style={styles.dot} />
                {index < data.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.eventBody}>
                <View style={styles.metaRow}>
                  <Text style={styles.type}>{formatEventTypeLabel(item)}</Text>
                  <Text style={styles.dateText}>{formatListDateTime(item.occurredAt)}</Text>
                </View>
                <Text style={styles.eventTitle}>{item.title}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  familyTitle: {
    flex: 1,
    fontFamily,
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.6,
  },
  collectBtn: {
    backgroundColor: colors.brandDeep,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  collectText: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.4,
  },
  summaryEntry: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    fontWeight: "600",
    color: colors.brandDark,
  },
  chevron: { marginLeft: "auto", fontSize: 18, color: colors.brandDark, fontWeight: "300" },
  row: { flexDirection: "row", flexWrap: "wrap" },
  eventCard: {
    flexDirection: "row",
    marginBottom: 0,
    paddingBottom: 16,
  },
  eventCardFirst: { paddingTop: spacing.sm },
  eventLeft: {
    width: 24,
    alignItems: "center",
    paddingTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  line: {
    flex: 1,
    width: 1.5,
    backgroundColor: colors.fillStrong,
    marginTop: 6,
  },
  eventBody: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0,
    marginLeft: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  type: {
    fontFamily: fontFamilySans,
    color: colors.brandDark,
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: colors.brandSoft,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.3,
  },
  dateText: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  eventTitle: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 22,
  },
});
