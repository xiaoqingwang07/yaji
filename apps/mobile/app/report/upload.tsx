import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Group, Row, Screen } from "@/components/ui";
import { colors, fontFamily, spacing } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function ReportUploadScreen() {
  const { state, markReportProcessing, markReportReady } = usePrototype();
  const report = state.report;

  useEffect(() => {
    if (!report) return;
    if (report.status === "UPLOADING") {
      const t = setTimeout(() => markReportProcessing(), 600);
      return () => clearTimeout(t);
    }
    if (report.status === "PROCESSING") {
      const t = setTimeout(() => {
        markReportReady();
        router.replace("/report/processing");
      }, 900);
      return () => clearTimeout(t);
    }
  }, [report?.status]);

  if (!report) {
    return (
      <Screen>
        <Body muted>还没有选择报告。</Body>
        <Button label="关闭" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          拍清楚就好，任意合规报告都可以收进来。AI 帮读 · 需你确认后才进档案。
        </Text>
        <Group>
          {report.pages.map((p, idx) => (
            <Row
              key={p.id}
              title={`${idx + 1}. ${p.label}`}
              subtitle={report.subject === "MOTHER" ? "妈妈" : "宝宝"}
              showSeparator={idx < report.pages.length - 1}
            />
          ))}
        </Group>
        <Button
          label="开始识别"
          onPress={() => {
            markReportProcessing();
            router.push("/report/processing");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 40 },
  lead: {
    fontFamily,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
});
