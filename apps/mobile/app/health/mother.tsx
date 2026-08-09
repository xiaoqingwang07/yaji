import { ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { Body, Button, Caption, Card, Screen, Title } from "@/components/ui";
import { colors } from "@/constants/theme";
import { formatDate } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function MotherHealthScreen() {
  const { state } = usePrototype();
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>妈妈健康详情</Title>
        <Body muted>孕期/产后指标来自手动记录或已确认报告同步。</Body>
        {state.motherHealth.map((p) => (
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
        <Button label="新增记录" onPress={() => router.push("/health/mother-new")} />
      </ScrollView>
    </Screen>
  );
}
