import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Body, Screen } from "@/components/ui";
import { colors, fontFamily, spacing } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function ReportProcessingScreen() {
  const { state, markReportReady } = usePrototype();

  useEffect(() => {
    const t = setTimeout(() => {
      markReportReady();
      router.replace("/report/review");
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen>
      <View style={styles.box}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.title}>芽纪正在帮你读报告…</Text>
        <Body muted>白话解读与建议下一步会先给你确认，不会自动写入档案。</Body>
        {state.report?.title ? (
          <Text style={styles.meta}>{state.report.title}</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingBottom: 80,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginTop: spacing.sm,
  },
  meta: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
