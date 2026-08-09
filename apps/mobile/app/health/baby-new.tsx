import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Chip, Field, Screen, Title } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function BabyHealthNewScreen() {
  const { addBabyHealth, addVaccine } = usePrototype();
  const [mode, setMode] = useState<"GROWTH" | "VACCINE">("GROWTH");
  const [label, setLabel] = useState("体重");
  const [value, setValue] = useState("6.8");
  const [unit, setUnit] = useState("kg");
  const [vaccineName, setVaccineName] = useState("百白破");
  const [date, setDate] = useState("2026-07-20");

  return (
    <Screen>
      <ScrollView>
        <Title>新增宝宝记录</Title>
        <View style={{ flexDirection: "row", marginVertical: spacing.md }}>
          <Chip label="成长指标" active={mode === "GROWTH"} onPress={() => setMode("GROWTH")} />
          <Chip label="疫苗" active={mode === "VACCINE"} onPress={() => setMode("VACCINE")} />
        </View>
        {mode === "GROWTH" ? (
          <>
            <Body muted>身高/体重/头围等，保存后进入时间轴与健康页。</Body>
            <Field label="指标" value={label} onChangeText={setLabel} />
            <Field label="数值" value={value} onChangeText={setValue} />
            <Field label="单位" value={unit} onChangeText={setUnit} />
            <Button
              label="保存成长记录"
              onPress={() => {
                addBabyHealth(label, value, unit);
                router.replace("/(tabs)/health");
              }}
            />
          </>
        ) : (
          <>
            <Body muted>疫苗日期以用户输入或已确认资料为准，不自动推断接种计划。</Body>
            <Field label="疫苗名称" value={vaccineName} onChangeText={setVaccineName} />
            <Field label="接种日期" value={date} onChangeText={setDate} />
            <Button
              label="保存疫苗记录"
              onPress={() => {
                addVaccine(vaccineName, date, 1);
                router.replace("/(tabs)/health");
              }}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
