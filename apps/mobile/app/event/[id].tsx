import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Body, Button, Caption, Group, Row, Screen, SectionHeader } from "@/components/ui";
import { MetricStrip } from "@/components/MetricVisual";
import { colors, fontFamily, radii, spacing, typography } from "@/constants/theme";
import { formatDateTime, formatEventTypeLabel } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, deleteEvent, canWrite } = usePrototype();
  const event = state.events.find((e) => e.id === id);
  const [showFields, setShowFields] = useState(false);

  if (!event) {
    return (
      <Screen>
        <Body muted>这条记录不在了。</Body>
        <Button label="关闭" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const readings = event.plainReadingItems || [];
  const fields = event.fields || [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{event.title}</Text>
        <Caption>
          {formatEventTypeLabel(event)} · {formatDateTime(event.occurredAt)}
        </Caption>
        {event.institution || event.location ? (
          <Caption>{event.institution || event.location}</Caption>
        ) : null}

        {event.metrics && event.metrics.length > 0 ? (
          <MetricStrip
            items={event.metrics.map((m) => ({
              label: m.label,
              value: m.value,
              unit: m.unit,
            }))}
          />
        ) : null}

        {readings.length > 0 ? (
          <>
            <SectionHeader title="白话解读" />
            <View style={styles.readingBox}>
              {readings.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.readingItem,
                    index < readings.length - 1 && styles.readingBorder,
                  ]}
                >
                  <Text style={styles.readingText}>{item.text}</Text>
                  <Text style={styles.citation}>{item.citation}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {fields.length > 0 ? (
          <>
            <Pressable onPress={() => setShowFields((v) => !v)} style={styles.foldHead}>
              <Text style={styles.foldTitle}>
                原字段（{fields.length}）
              </Text>
              <Text style={styles.foldAction}>{showFields ? "收起" : "展开"}</Text>
            </Pressable>
            {showFields ? (
              <Group>
                {fields.map((f, i) => (
                  <Row
                    key={f.id}
                    title={f.label}
                    detail={`${f.value}${f.unit ? ` ${f.unit}` : ""}`}
                    showSeparator={i < fields.length - 1}
                  />
                ))}
              </Group>
            ) : null}
          </>
        ) : null}

        {event.notes ? (
          <>
            <SectionHeader title="备注" />
            <Group>
              <Row title={event.notes} showSeparator={false} />
            </Group>
          </>
        ) : null}

        {canWrite ? (
          <Button
            label="删除"
            variant="ghost"
            onPress={() =>
              Alert.alert("确认删除", "删除后不可恢复。", [
                { text: "取消", style: "cancel" },
                {
                  text: "删除",
                  style: "destructive",
                  onPress: () => {
                    deleteEvent(event.id);
                    router.back();
                  },
                },
              ])
            }
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 40, gap: spacing.sm },
  title: {
    fontFamily,
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  readingBox: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  readingItem: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  readingBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(63, 111, 91, 0.18)",
  },
  readingText: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
  },
  citation: {
    marginTop: 8,
    fontSize: 13,
    color: colors.brandDark,
    fontFamily,
    fontWeight: "500",
  },
  foldHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  foldTitle: {
    fontFamily,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  foldAction: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: colors.brandDark,
  },
});
