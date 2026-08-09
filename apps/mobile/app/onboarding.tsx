import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Chip, Field, Group, LargeTitle, Screen } from "@/components/ui";
import { colors, fontFamily, spacing } from "@/constants/theme";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import type { Scenario } from "@/src/fixtures/types";

export default function OnboardingScreen() {
  const { completeOnboarding } = usePrototype();
  const [scenario, setScenario] = useState<Scenario>("PREGNANCY");
  const [dueDate, setDueDate] = useState("2026-11-25");
  const [babyBirthDate, setBabyBirthDate] = useState("2026-05-20");

  const canStart =
    scenario === "PLANNING" ||
    (scenario === "PREGNANCY" ? dueDate.length >= 8 : babyBirthDate.length >= 8);

  return (
    <Screen safeTop>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <LargeTitle>你们现在处于哪个阶段</LargeTitle>
        <Text style={styles.sub}>选好后，就可以开始收档案了</Text>

        <Text style={styles.label}>阶段</Text>
        <View style={styles.row}>
          <Chip
            label="备孕中"
            active={scenario === "PLANNING"}
            onPress={() => setScenario("PLANNING")}
          />
          <Chip
            label="怀孕中"
            active={scenario === "PREGNANCY"}
            onPress={() => setScenario("PREGNANCY")}
          />
          <Chip
            label="宝宝已出生"
            active={scenario === "BORN"}
            onPress={() => setScenario("BORN")}
          />
        </View>

        {scenario !== "PLANNING" ? (
          <Group>
            <View style={styles.fieldPad}>
              {scenario === "PREGNANCY" ? (
                <Field
                  label="预产期"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <Field
                  label="出生日期"
                  value={babyBirthDate}
                  onChangeText={setBabyBirthDate}
                  placeholder="YYYY-MM-DD"
                />
              )}
            </View>
          </Group>
        ) : (
          <Text style={styles.hint}>之后随时把检查收进来就好。</Text>
        )}

        <Button
          label="进入芽纪"
          disabled={!canStart}
          onPress={() => {
            if (scenario === "PLANNING") {
              completeOnboarding({ scenario });
            } else if (scenario === "PREGNANCY") {
              completeOnboarding({ scenario, dueDate });
            } else {
              completeOnboarding({ scenario, babyBirthDate });
            }
            goReplace("/(tabs)/now");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 48, paddingTop: 24 },
  sub: {
    fontFamily,
    fontSize: 17,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 36,
  },
  label: {
    fontFamily,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.lg },
  fieldPad: { padding: spacing.lg, paddingBottom: spacing.sm },
  hint: {
    fontFamily,
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
});
