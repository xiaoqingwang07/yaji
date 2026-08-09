import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Button, Screen } from "@/components/ui";
import { colors, fontFamily, fontFamilySans, radii, shadows, spacing, WARM_COPY } from "@/constants/theme";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

function SoftOption({
  title,
  onPress,
  last,
}: {
  title: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        softStyles.row,
        !last && softStyles.border,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={softStyles.title}>{title}</Text>
      <Text style={softStyles.arrow}>→</Text>
    </Pressable>
  );
}

const softStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  border: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  title: {
    flex: 1,
    fontFamily: fontFamilySans,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  arrow: { fontSize: 16, color: colors.brand, fontWeight: "300" },
});

const PRIMARY = [
  {
    key: "report",
    title: "收报告",
    sub: "拍照或选图，确认后归档",
    tint: "#E6F3ED",
    action: "report" as const,
  },
  {
    key: "voice",
    title: "录医嘱",
    sub: "诊室一键录音",
    tint: "#FDE8E4",
    action: "voice" as const,
  },
  {
    key: "note",
    title: "记一条",
    sub: "叮嘱 · 用药 · 监测",
    tint: "#F5EEF2",
    action: "note" as const,
  },
];

export default function AddMenuScreen() {
  const { canWrite, startReportUpload, markReportProcessing, startImportBatch } =
    usePrototype();
  const [more, setMore] = useState(false);

  if (!canWrite) {
    return (
      <Screen>
        <View style={styles.noAccessWrap}>
          <Text style={styles.noAccess}>当前为仅查看，无法添加</Text>
          <Button label="关闭" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const run = (action: "report" | "voice" | "note") => {
    if (action === "report") {
      startReportUpload("ultrasound");
      markReportProcessing();
      goReplace("/report/upload");
      return;
    }
    if (action === "voice") {
      goReplace("/voice/recording");
      return;
    }
    goReplace("/note/quick");
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.wrap}>
        <Text style={styles.lead}>刚看完医生？</Text>
        <Text style={styles.hint}>{WARM_COPY.aiAssistHint} — 确认后才入档</Text>

        <View style={styles.grid}>
          {PRIMARY.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => run(item.action)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: item.tint },
                pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => setMore((v) => !v)} style={styles.moreBtn}>
          <Text style={styles.moreText}>{more ? "收起" : "更多选项"}</Text>
        </Pressable>

        {more ? (
          <View style={styles.moreList}>
            <SoftOption
              title="批量导入旧报告"
              onPress={() => {
                startImportBatch();
                goReplace("/import/batch");
              }}
            />
            <SoftOption
              title="设提醒（写入系统日历）"
              last
              onPress={() => goReplace("/reminder/new")}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 40, paddingTop: 12 },
  noAccessWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.lg },
  noAccess: {
    fontFamily: fontFamilySans,
    fontSize: 16,
    color: colors.textMuted,
  },
  lead: {
    fontFamily,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  hint: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  grid: { gap: 14, marginBottom: spacing.lg },
  card: {
    borderRadius: radii.xl,
    paddingVertical: 22,
    paddingHorizontal: 22,
    minHeight: 92,
    gap: 6,
    ...(shadows.sm as object),
  },
  cardTitle: {
    fontFamily,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
  },
  cardSub: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    color: colors.textSecondary,
  },
  moreBtn: {
    alignSelf: "center",
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  moreText: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    color: colors.brand,
    fontWeight: "600",
  },
  moreList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
  },
});
