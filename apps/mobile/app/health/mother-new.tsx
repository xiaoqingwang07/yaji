import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Chip, Field, Screen, Title } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

const PRESETS = [
  { label: "胎心", value: "148", unit: "次/分" },
  { label: "双顶径 BPD", value: "72", unit: "mm" },
  { label: "头围 HC", value: "262", unit: "mm" },
  { label: "腹围 AC", value: "245", unit: "mm" },
  { label: "股骨长 FL", value: "54", unit: "mm" },
  { label: "估计体重", value: "1180", unit: "g" },
  { label: "体重", value: "62.8", unit: "kg" },
  { label: "血压", value: "112/70", unit: "mmHg" },
] as const;

export default function MotherHealthNewScreen() {
  const { addMotherHealth } = usePrototype();
  const [label, setLabel] = useState("胎心");
  const [value, setValue] = useState("148");
  const [unit, setUnit] = useState("次/分");

  return (
    <Screen>
      <ScrollView>
        <Title>记一条</Title>
        <Body muted>
          居家监测或产检指标：体重、血压、胎心等。保存后同步出现在健康与档案。
        </Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.md }}>
          {PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              active={label === p.label}
              onPress={() => {
                setLabel(p.label);
                setValue(p.value);
                setUnit(p.unit);
              }}
            />
          ))}
        </View>
        <Field label="指标" value={label} onChangeText={setLabel} />
        <Field label="数值" value={value} onChangeText={setValue} />
        <Field label="单位" value={unit} onChangeText={setUnit} hint="不同单位不会静默换算" />
        <Button
          label="保存"
          onPress={() => {
            addMotherHealth(label, value, unit);
            router.replace("/(tabs)/health");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
