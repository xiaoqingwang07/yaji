import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Chip, Field, Screen, Title } from "@/components/ui";
import { spacing } from "@/constants/theme";
import {
  EVENT_TYPE_LABELS,
  formatDateTime,
  parseFlexibleDateTime,
} from "@/src/fixtures/labels";
import type { EventType, Stage } from "@/src/fixtures/types";
import { usePrototype } from "@/src/state/PrototypeContext";

const TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];
const DEFAULT_OCCURRED = "2026-08-01T10:00:00+08:00";

export default function NewEventScreen() {
  const { addEvent, state } = usePrototype();
  const [type, setType] = useState<EventType>("PRENATAL_CHECK");
  const [title, setTitle] = useState("");
  const [occurredAt, setOccurredAt] = useState(DEFAULT_OCCURRED);
  const [timeText, setTimeText] = useState(() => formatDateTime(DEFAULT_OCCURRED));
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [subject, setSubject] = useState<"MOTHER" | "BABY">(
    state.scenario === "BORN" ? "BABY" : "MOTHER",
  );

  const stage: Stage =
    type === "DELIVERY"
      ? "DELIVERY"
      : subject === "BABY"
        ? "BABY_0_1"
        : type === "POSTPARTUM_CHECK"
          ? "POSTPARTUM"
          : "PREGNANCY";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>手动新增事件</Title>
        <Body muted>必填：类型、发生时间、标题</Body>
        <Body>所属主体</Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.sm }}>
          <Chip label="妈妈" active={subject === "MOTHER"} onPress={() => setSubject("MOTHER")} />
          <Chip label="宝宝" active={subject === "BABY"} onPress={() => setSubject("BABY")} />
        </View>
        <Body>事件类型</Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.sm }}>
          {TYPES.map((t) => (
            <Chip
              key={t}
              label={EVENT_TYPE_LABELS[t]}
              active={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>
        <Field label="标题" value={title} onChangeText={setTitle} placeholder="例如：孕检复查" />
        <Field
          label="发生时间"
          value={timeText}
          onChangeText={(text) => {
            setTimeText(text);
            const parsed = parseFlexibleDateTime(text);
            if (parsed) setOccurredAt(parsed);
          }}
          placeholder="例如：8 月 1 日 上午 10:00"
        />
        <Field label="地点/医院" value={location} onChangeText={setLocation} />
        <Field label="备注" value={notes} onChangeText={setNotes} multiline />
        <Button
          label="保存到时间轴"
          disabled={!title.trim()}
          onPress={() => {
            const resolved =
              parseFlexibleDateTime(timeText) || occurredAt;
            const id = addEvent({
              title: title.trim(),
              type,
              stage,
              occurredAt: resolved,
              notes,
              location,
              subject,
            });
            router.replace(`/event/${id}`);
          }}
        />
      </ScrollView>
    </Screen>
  );
}
