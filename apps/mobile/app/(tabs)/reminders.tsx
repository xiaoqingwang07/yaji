import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Body,
  Button,
  Caption,
  Card,
  Chip,
  Screen,
  Title,
} from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { formatDateTime } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";
import { useState } from "react";

export default function RemindersScreen() {
  const { state, completeReminder, cancelReminder, canWrite } = usePrototype();
  const [filter, setFilter] = useState<"PENDING" | "COMPLETED" | "CANCELLED">("PENDING");
  const list = state.reminders.filter((r) => r.status === filter);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Title>提醒</Title>
        <Body muted>仅支持一次性提醒；不会根据 OCR 自动创建。</Body>
        <View style={styles.row}>
          <Chip label="待办" active={filter === "PENDING"} onPress={() => setFilter("PENDING")} />
          <Chip label="已完成" active={filter === "COMPLETED"} onPress={() => setFilter("COMPLETED")} />
          <Chip label="已取消" active={filter === "CANCELLED"} onPress={() => setFilter("CANCELLED")} />
        </View>
        {list.length === 0 ? (
          <Card>
            <Body muted>当前分类暂无提醒</Body>
          </Card>
        ) : (
          list.map((r) => (
            <Card key={r.id}>
              <Text style={styles.title}>{r.title}</Text>
              <Caption>{formatDateTime(r.scheduledAt)}</Caption>
              {r.notes ? <Body muted>{r.notes}</Body> : null}
              {filter === "PENDING" && canWrite ? (
                <View style={styles.actions}>
                  <Button label="完成" onPress={() => completeReminder(r.id)} />
                  <Button label="取消" variant="ghost" onPress={() => cancelReminder(r.id)} />
                </View>
              ) : null}
            </Card>
          ))
        )}
        <Button label="新增提醒" disabled={!canWrite} onPress={() => router.push("/reminder/new")} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.md },
  title: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 4 },
  actions: { marginTop: spacing.sm },
});
