import { useState } from "react";
import { ScrollView } from "react-native";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function MedicationNoteScreen() {
  const { addMedicationNote } = usePrototype();
  const [note, setNote] = useState("铁剂（按处方剂量与疗程，以医生处方为准）");

  return (
    <Screen>
      <ScrollView>
        <Title>记下用药</Title>
        <Body muted>只记录医嘱/处方内容，不做用药推荐。保存后出现在「此刻」。</Body>
        <Field label="用药记录" value={note} onChangeText={setNote} multiline />
        <Button
          label="保存"
          disabled={!note.trim()}
          onPress={() => {
            addMedicationNote(note.trim());
            goReplace("/(tabs)/now");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
