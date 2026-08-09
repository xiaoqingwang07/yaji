import { useState } from "react";
import { ScrollView } from "react-native";
import { Body, Button, Field, Screen, Title } from "@/components/ui";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function DoctorNoteScreen() {
  const { addDoctorNote } = usePrototype();
  const [note, setNote] = useState("四周后复查；注意胎动；两周后复查血常规。");

  return (
    <Screen>
      <ScrollView>
        <Title>记下医生叮嘱</Title>
        <Body muted>尽量按医生原话记录。会进入档案，并生成「此刻」待办。</Body>
        <Field label="叮嘱内容" value={note} onChangeText={setNote} multiline />
        <Button
          label="保存"
          disabled={!note.trim()}
          onPress={() => {
            addDoctorNote(note.trim());
            goReplace("/(tabs)/now");
          }}
        />
      </ScrollView>
    </Screen>
  );
}
