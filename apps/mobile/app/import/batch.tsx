import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Body,
  Button,
  Caption,
  Group,
  Row,
  Screen,
} from "@/components/ui";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";
import { useEffect } from "react";

export default function ImportBatchScreen() {
  const { state, startImportBatch, confirmImportItem, abandonImportBatch } =
    usePrototype();

  useEffect(() => {
    startImportBatch();
    // 仅进入页面时初始化示范批次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const batch = state.importBatch || [];
  const confirmed = batch.filter((b) => b.confirmed).length;
  const total = batch.length || 1;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>把攒下的报告一次收进来</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressNum}>
            已确认 {confirmed}/{batch.length}
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(confirmed / total) * 100}%` }]} />
          </View>
          <Caption>识别不到的日期或医院可留空，稍后补</Caption>
        </View>

        <Button
          label="重新载入"
          variant="secondary"
          onPress={() => startImportBatch()}
        />

        <Group>
          {batch.map((item, index) => (
            <Row
              key={item.id}
              title={item.title}
              subtitle={`${item.date} · ${item.institution} · ${item.category}`}
              showSeparator={index < batch.length - 1}
              trailing={
                item.confirmed ? (
                  <Text style={styles.done}>已确认</Text>
                ) : (
                  <Text
                    style={styles.confirm}
                    onPress={() => confirmImportItem(item.id)}
                  >
                    确认
                  </Text>
                )
              }
            />
          ))}
        </Group>

        <Body muted>列表式快速确认即可入档，字段细节以后再补。</Body>

        <Button
          label="完成并回档案"
          onPress={() => {
            abandonImportBatch();
            goReplace("/(tabs)/timeline");
          }}
        />
        <Button
          label="稍后继续"
          variant="ghost"
          onPress={() => router.back()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 48, paddingTop: 8 },
  sub: {
    fontFamily,
    fontSize: 17,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: spacing.xl,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 8,
  },
  progressNum: {
    fontFamily,
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.fillStrong,
    overflow: "hidden",
  },
  fill: { height: "100%", backgroundColor: colors.brand },
  done: { color: colors.textMuted, fontSize: 15, fontFamily },
  confirm: { color: colors.brand, fontSize: 15, fontWeight: "600", fontFamily },
});
