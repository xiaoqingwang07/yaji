import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Chip, Screen } from "@/components/ui";
import { SproutMark } from "@/components/YajiMark";
import {
  colors,
  fontFamily,
  fontFamilySans,
  radii,
  spacing,
  WARM_COPY,
} from "@/constants/theme";
import { ROLE_LABELS } from "@/src/fixtures/labels";
import { go, goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import type { Role } from "@/src/fixtures/types";

function SoftLink({
  title,
  hint,
  onPress,
  last,
}: {
  title: string;
  hint?: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !last && styles.linkBorder,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.linkTitle}>{title}</Text>
        {hint ? <Text style={styles.linkHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.linkArrow}>→</Text>
    </Pressable>
  );
}

export default function MeScreen() {
  const {
    state,
    setRole,
    setUiState,
    logout,
    loadDemoScenario,
    openPendingReportReview,
  } = usePrototype();
  const [showDemo, setShowDemo] = useState(false);
  const [taps, setTaps] = useState(0);
  const displayName = state.motherName || "家人";

  const onLogoPress = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= 5) {
      setShowDemo(true);
      setTaps(0);
    }
  };

  return (
    <Screen glow glowVariant="peach" safeTop>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onLogoPress} style={styles.heroStage}>
          <View style={styles.heroWash} />
          <SproutMark size={52} breathe />
          <Text style={styles.hello}>{WARM_COPY.meGreeting(displayName)}</Text>
          <Text style={styles.familyName}>{state.familyName}</Text>
        </Pressable>

        <Text style={styles.softLine}>{WARM_COPY.meSoft}</Text>
        <Text style={styles.aiLine}>{WARM_COPY.meAiLine}</Text>

        <Text style={styles.sectionLabel}>家庭与信任</Text>
        <View style={styles.linkBlock}>
          <SoftLink title="完善档案" hint="预产期、宝宝信息" onPress={() => go("/profile-edit")} />
          <SoftLink title="家庭成员" hint="谁可以一起看这份档案" onPress={() => go("/family")} />
          <SoftLink
            title="隐私与信任"
            hint="数据怎么用、怎么保护"
            onPress={() => go("/trust")}
            last
          />
        </View>

        {showDemo ? (
          <>
            <Text style={styles.demoLabel}>演示模式</Text>
            <View style={styles.chipRow}>
              {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                <Chip
                  key={role}
                  label={ROLE_LABELS[role]}
                  active={state.role === role}
                  onPress={() => setRole(role)}
                />
              ))}
            </View>
            <View style={styles.linkBlock}>
              <SoftLink
                title="孕期示范"
                onPress={() => {
                  loadDemoScenario("PREGNANCY");
                  go("/(tabs)/now");
                }}
              />
              <SoftLink
                title="备孕示范"
                onPress={() => {
                  loadDemoScenario("PLANNING");
                  go("/(tabs)/now");
                }}
              />
              <SoftLink
                title="已出生示范"
                onPress={() => {
                  loadDemoScenario("BORN");
                  go("/(tabs)/now");
                }}
              />
              <SoftLink
                title="待确认超声（芽纪帮读）"
                onPress={() => {
                  openPendingReportReview("ultrasound");
                  go("/report/review");
                }}
              />
              <SoftLink
                title="档案空状态"
                onPress={() => {
                  setUiState("empty");
                  go("/(tabs)/timeline");
                }}
                last
              />
            </View>
          </>
        ) : null}

        <View style={styles.logoutWrap}>
          <Button
            label="退出登录"
            variant="ghost"
            onPress={() => {
              logout();
              goReplace("/login");
            }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 128, paddingTop: 4 },
  heroStage: {
    marginHorizontal: -spacing.screen,
    paddingHorizontal: spacing.screen,
    paddingTop: 28,
    paddingBottom: 28,
    marginBottom: spacing.lg,
    alignItems: "flex-start",
    gap: 10,
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  heroWash: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.warmCardAlt,
  },
  hello: {
    fontFamily,
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.4,
    marginTop: 4,
  },
  familyName: {
    fontFamily: fontFamilySans,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  softLine: {
    fontFamily: fontFamilySans,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 4,
    lineHeight: 22,
  },
  aiLine: {
    fontFamily: fontFamilySans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  linkBlock: {
    marginBottom: spacing.xl,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  linkBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
  },
  linkTitle: {
    fontFamily: fontFamilySans,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  linkHint: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  linkArrow: {
    fontSize: 16,
    color: colors.brand,
    fontWeight: "300",
  },
  demoLabel: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.sm },
  logoutWrap: { marginTop: spacing.sm },
});
