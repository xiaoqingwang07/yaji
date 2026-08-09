import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Chip, Field, Screen } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { usePrototype } from "@/src/state/PrototypeContext";

type Mode = "note" | "med" | "monitor";

const MONITOR_PRESETS = [
  { label: "体重", value: "58.2", unit: "kg" },
  { label: "血压", value: "110/70", unit: "mmHg" },
  { label: "胎心", value: "146", unit: "次/分" },
] as const;

export default function QuickNoteScreen() {
  const { addDoctorNote, addMedicationNote, addMotherHealth } = usePrototype();
  const [mode, setMode] = useState<Mode>("note");
  const [text, setText] = useState("");
  const [label, setLabel] = useState("体重");
  const [value, setValue] = useState("58.2");
  const [unit, setUnit] = useState("kg");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Chip label="叮嘱" active={mode === "note"} onPress={() => setMode("note")} />
          <Chip label="用药" active={mode === "med"} onPress={() => setMode("med")} />
          <Chip label="监测" active={mode === "monitor"} onPress={() => setMode("monitor")} />
        </View>

        {mode === "monitor" ? (
          <>
            <View style={styles.row}>
              {MONITOR_PRESETS.map((p) => (
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
            <Field label="数值" value={value} onChangeText={setValue} />
            <Field label="单位" value={unit} onChangeText={setUnit} />
            <Button
              label="保存"
              onPress={() => {
                addMotherHealth(label, value, unit);
                router.replace("/(tabs)/health");
              }}
            />
          </>
        ) : (
          <>
            <Field
              label={mode === "note" ? "医生说了什么" : "用药内容"}
              value={text}
              onChangeText={setText}
              placeholder={mode === "note" ? "例如：两周后复查血常规" : "例如：铁剂，按处方"}
              multiline
            />
            <Button
              label="保存"
              disabled={text.trim().length < 2}
              onPress={() => {
                if (mode === "note") addDoctorNote(text.trim());
                else addMedicationNote(text.trim());
                router.replace("/(tabs)/now");
              }}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 40, paddingTop: 4 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
});
