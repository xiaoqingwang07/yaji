import { useState } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Chip, Field, Screen } from "@/components/ui";
import { spacing } from "@/constants/theme";
import { RELATION_LABELS } from "@/src/fixtures/labels";
import type { Relation } from "@/src/fixtures/types";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function ProfileEditScreen() {
  const { state, updateProfile } = usePrototype();
  const [familyName, setFamilyName] = useState(state.familyName);
  const [motherName, setMotherName] = useState(state.motherName);
  const [relation, setRelation] = useState<Relation>(state.relationToMother);
  const [dueDate, setDueDate] = useState(state.dueDate || "");
  const [lmpDate, setLmpDate] = useState(state.lmpDate || "");
  const [babyName, setBabyName] = useState(state.babyName || "");
  const [babyBirthDate, setBabyBirthDate] = useState(state.babyBirthDate || "");

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Body muted>需要时再补即可，不着急一次填完。</Body>
        <Field label="家庭名称" value={familyName} onChangeText={setFamilyName} />
        <Field label="妈妈称呼" value={motherName} onChangeText={setMotherName} />
        <Body>与妈妈的关系</Body>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: spacing.sm }}>
          {(Object.keys(RELATION_LABELS) as Relation[]).map((key) => (
            <Chip
              key={key}
              label={RELATION_LABELS[key]}
              active={relation === key}
              onPress={() => setRelation(key)}
            />
          ))}
        </View>
        {state.scenario === "PREGNANCY" ? (
          <>
            <Field label="预产期" value={dueDate} onChangeText={setDueDate} />
            <Field label="末次月经" value={lmpDate} onChangeText={setLmpDate} />
          </>
        ) : (
          <>
            <Field label="宝宝昵称" value={babyName} onChangeText={setBabyName} />
            <Field label="出生日期" value={babyBirthDate} onChangeText={setBabyBirthDate} />
          </>
        )}
        <Button
          label="保存"
          onPress={() => {
            updateProfile({
              familyName,
              motherName,
              relationToMother: relation,
              dueDate: dueDate || undefined,
              lmpDate: lmpDate || undefined,
              babyName: babyName || undefined,
              babyBirthDate: babyBirthDate || undefined,
            });
            router.back();
          }}
        />
      </ScrollView>
    </Screen>
  );
}
