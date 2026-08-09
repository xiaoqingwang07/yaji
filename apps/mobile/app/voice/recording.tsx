import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Body,
  Button,
  Caption,
  Disclaimer,
  Group,
  Row,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { colors, fontFamily, radii, spacing, typography } from "@/constants/theme";
import { dedupeExtractLines } from "@/src/fixtures/seed";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

function formatSec(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function VisitRecordingScreen() {
  const {
    state,
    startVisitRecording,
    tickRecording,
    finishRecording,
    confirmVisitRecording,
    canWrite,
  } = usePrototype();
  const vr = state.visitRecording;

  useEffect(() => {
    startVisitRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (vr?.status !== "RECORDING") return;
    const t = setInterval(() => tickRecording(), 1000);
    return () => clearInterval(t);
  }, [vr?.status, tickRecording]);

  if (!vr) {
    return (
      <Screen>
        <Button label="开始录音" onPress={startVisitRecording} />
      </Screen>
    );
  }

  if (vr.status === "CONFIRMED") {
    return (
      <Screen>
        <Body>叮嘱与下一步已更新。</Body>
        <Button label="好的" onPress={() => goReplace("/(tabs)/now")} />
      </Screen>
    );
  }

  if (vr.status === "RECORDING" || vr.status === "IDLE") {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.centerWrap}>
          <Disclaimer kind="recording" />
          <View style={styles.pulseOuter}>
            <View style={styles.pulseMid}>
              <Pressable
                accessibilityRole="button"
                onPress={() => (vr.status === "RECORDING" ? finishRecording() : startVisitRecording())}
                style={styles.recBtn}
              >
                <Text style={styles.recLabel}>
                  {vr.status === "RECORDING" ? "结束" : "开始"}
                </Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.timer}>{formatSec(vr.durationSec)}</Text>
          <Body muted>
            {vr.status === "RECORDING" ? "再点一次结束" : "点大按钮开始"}
          </Body>
        </ScrollView>
      </Screen>
    );
  }

  if (vr.status === "TRANSCRIBING") {
    return (
      <Screen>
        <Body muted>正在整理医嘱与下次检查…</Body>
        <View style={styles.skeleton} />
        <View style={[styles.skeleton, { width: "70%" }]} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Caption>时长 {formatSec(vr.durationSec)} · 核对后入档</Caption>

        <View style={styles.transcript}>
          <Text style={styles.transcriptText}>{vr.transcript}</Text>
        </View>

        <SectionHeader title="整理出的要点" />
        <Group>
          {dedupeExtractLines(vr.doctorNotes, vr.medications, vr.nextVisit).map(
            (n, i, arr) => (
              <Row key={`${n}-${i}`} title={n} showSeparator={i < arr.length - 1} />
            ),
          )}
        </Group>

        <Button
          label="确认入档"
          disabled={!canWrite}
          onPress={() => {
            confirmVisitRecording();
            goReplace("/(tabs)/now");
          }}
        />
        <Button label="重新录制" variant="ghost" onPress={startVisitRecording} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 48,
    gap: spacing.md,
  },
  wrap: { paddingBottom: 48, paddingTop: 8 },
  pulseOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.xl,
  },
  pulseMid: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.fillStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  recBtn: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.brandDark,
    alignItems: "center",
    justifyContent: "center",
  },
  recLabel: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    fontFamily,
  },
  timer: {
    fontFamily,
    fontSize: 34,
    fontWeight: "600",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  skeleton: {
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.skeleton,
    marginTop: spacing.md,
    width: "100%",
  },
  transcript: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  transcriptText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
});
