import { ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { Body, Button, Caption, Card, Screen, Title } from "@/components/ui";
import { colors } from "@/constants/theme";
import { formatDate } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function BabyHealthScreen() {
  const { state } = usePrototype();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>宝宝成长详情</Title>
        <Body muted>
          {state.babyName || "宝宝"} · 出生 {state.babyBirthDate || "未填写"}
        </Body>
        {state.babyHealth.map((p) => (
          <Card key={p.id}>
            <Text style={{ color: colors.textMuted }}>{p.label}</Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>
              {p.value}
              {p.unit ? ` ${p.unit}` : ""}
            </Text>
            <Caption>
              {formatDate(p.recordedAt)} · {p.source}
            </Caption>
          </Card>
        ))}
        <Title>疫苗</Title>
        {state.vaccines.map((v) => (
          <Card key={v.id}>
            <Text style={{ fontWeight: "700", color: colors.text }}>{v.name}</Text>
            <Caption>
              {formatDate(v.date)}
              {v.dose ? ` · 第 ${v.dose} 剂` : ""}
            </Caption>
          </Card>
        ))}
        <Button label="新增成长/疫苗记录" onPress={() => router.push("/health/baby-new")} />
      </ScrollView>
    </Screen>
  );
}
