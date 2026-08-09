import { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Caption, Chip, Field, Screen } from "@/components/ui";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import {
  formatDateTime,
  parseFlexibleDateTime,
  toLocalIso,
} from "@/src/fixtures/labels";
import { goReplace } from "@/src/nav";
import {
  addReminderToDeviceCalendar,
  supportsDeviceCalendarWrite,
} from "@/src/services/deviceCalendar";
import { usePrototype } from "@/src/state/PrototypeContext";
import type { CalendarSyncStatus } from "@/src/fixtures/types";

const TYPES = [
  ["PRENATAL_CHECK", "产检"],
  ["POSTPARTUM_CHECK", "产后复查"],
  ["BABY_CHECKUP", "宝宝体检"],
  ["MEDICATION", "用药"],
  ["VACCINATION", "疫苗"],
] as const;

function defaultScheduleIso() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(9, 0, 0, 0);
  return toLocalIso(d);
}

export default function ReminderNewScreen() {
  const { addReminder } = usePrototype();
  const params = useLocalSearchParams<{ title?: string; notes?: string }>();
  const prefillTitle = typeof params.title === "string" ? params.title : "";
  const prefillNotes = typeof params.notes === "string" ? params.notes : "";

  const initialIso = useMemo(() => defaultScheduleIso(), []);
  const [type, setType] = useState<(typeof TYPES)[number][0]>("PRENATAL_CHECK");
  const [title, setTitle] = useState(prefillTitle || "下次产检");
  const [scheduledAt, setScheduledAt] = useState(initialIso);
  const [timeText, setTimeText] = useState(() => formatDateTime(initialIso));
  const [notes, setNotes] = useState(prefillNotes);
  const canNativeCalendar = useMemo(() => supportsDeviceCalendarWrite(), []);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [saving, setSaving] = useState(false);

  const calendarHint = canNativeCalendar
    ? "开启后将写入手机系统日历（需授权）"
    : "网页预览无法写入系统日历；提醒会先保存在芽纪内，真机可同步";

  const onTimeTextChange = (text: string) => {
    setTimeText(text);
    const parsed = parseFlexibleDateTime(text, new Date(scheduledAt).getFullYear());
    if (parsed) setScheduledAt(parsed);
  };

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert("请填写标题");
      return;
    }
    const resolved =
      parseFlexibleDateTime(timeText, new Date(scheduledAt).getFullYear()) || scheduledAt;
    setScheduledAt(resolved);
    setTimeText(formatDateTime(resolved));

    setSaving(true);
    let calendarSync: CalendarSyncStatus = "local_only";
    let feedback =
      "提醒已保存在芽纪内。当前环境无法写入系统日历，真机可同步。";

    if (syncCalendar && canNativeCalendar) {
      const start = new Date(resolved);
      const result = await addReminderToDeviceCalendar({
        title: title.trim(),
        startDate: Number.isNaN(start.getTime()) ? new Date() : start,
        notes: notes.trim() || undefined,
      });
      if (result.ok) {
        calendarSync = "synced";
        feedback = "已写入系统日历，也会出现在「此刻 → 下一步」。";
      } else if (result.reason === "denied") {
        calendarSync = "denied";
        feedback = result.message;
      } else {
        calendarSync = "local_only";
        feedback = result.message;
      }
    } else if (syncCalendar && !canNativeCalendar) {
      calendarSync = "local_only";
      feedback =
        "当前环境无法写入系统日历，已保存在芽纪内；真机可同步。";
    } else {
      calendarSync = "local_only";
      feedback = "提醒已保存在芽纪内（未写入系统日历）。";
    }

    addReminder(title.trim(), type, resolved, notes.trim() || undefined, calendarSync);
    setSaving(false);
    Alert.alert("好了", feedback, [
      { text: "回到此刻", onPress: () => goReplace("/(tabs)/now") },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>设好时间，尽量同步到手机日历，到点就不会忘。</Text>

        <View style={styles.chips}>
          {TYPES.map(([key, label]) => (
            <Chip key={key} label={label} active={type === key} onPress={() => setType(key)} />
          ))}
        </View>

        <Field label="标题" value={title} onChangeText={setTitle} />
        <Field
          label="提醒时间"
          value={timeText}
          onChangeText={onTimeTextChange}
          placeholder="例如：8 月 16 日 上午 9:00"
        />
        <Caption>可按「月 日 · 上午/下午 时间」填写；保存时会记成标准时间</Caption>
        <Field label="备注" value={notes} onChangeText={setNotes} />

        <View style={styles.calendarCard}>
          <View style={styles.calendarRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.calendarTitle}>添加到系统日历</Text>
              <Caption>{calendarHint}</Caption>
            </View>
            <Switch
              value={syncCalendar}
              onValueChange={setSyncCalendar}
              trackColor={{ true: colors.brand, false: colors.fillStrong }}
            />
          </View>
          <Text style={styles.disclaimer}>事件备注会标注「以医嘱为准」</Text>
        </View>

        <Button
          label={saving ? "保存中…" : "确认并添加"}
          disabled={saving}
          onPress={() => void onSave()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 40, paddingTop: 4 },
  lead: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  calendarCard: {
    backgroundColor: colors.warmCard,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    marginBottom: spacing.xl,
    gap: 8,
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  calendarTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  disclaimer: {
    fontFamily,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
