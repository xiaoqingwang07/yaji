import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import {
  Body,
  Button,
  Caption,
  Chip,
  Group,
  Row,
  Screen,
  SectionHeader,
} from "@/components/ui";
import { colors, fontFamily, radii, spacing } from "@/constants/theme";
import { RELATION_LABELS } from "@/src/fixtures/labels";
import { usePrototype } from "@/src/state/PrototypeContext";
import type { Role } from "@/src/fixtures/types";

export default function FamilyScreen() {
  const { state, createInvite, removeMember, canWrite } = usePrototype();
  const isOwner = state.role === "OWNER";
  const [inviteRole, setInviteRole] = useState<Role>("EDITOR");
  const [showInvite, setShowInvite] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.sub}>夫妻共用一份档案，权限从简</Text>

        <Group>
          {state.members.map((m, index) => (
            <Row
              key={m.id}
              title={`${m.name}${m.isMe ? "（我）" : ""}`}
              subtitle={`${RELATION_LABELS[m.relation]} · ${
                m.role === "VIEWER" ? "可查看" : "可编辑"
              }`}
              showSeparator={index < state.members.length - 1}
              trailing={
                !m.isMe && isOwner ? (
                  <Text
                    style={styles.remove}
                    onPress={() =>
                      Alert.alert("确认移除", "移除后立即失去访问权限。", [
                        { text: "取消", style: "cancel" },
                        {
                          text: "移除",
                          style: "destructive",
                          onPress: () => removeMember(m.id),
                        },
                      ])
                    }
                  >
                    移除
                  </Text>
                ) : undefined
              }
            />
          ))}
        </Group>

        {state.inviteCode ? (
          <View style={styles.codeCard}>
            <Caption>邀请码（一次性，24 小时有效）</Caption>
            <Text style={styles.code}>{state.inviteCode}</Text>
          </View>
        ) : null}

        {!showInvite ? (
          <Button
            label="邀请另一半"
            disabled={!isOwner}
            onPress={() => setShowInvite(true)}
          />
        ) : (
          <>
            <SectionHeader title="权限二选一" />
            <View style={styles.row}>
              <Chip
                label="可查看"
                active={inviteRole === "VIEWER"}
                onPress={() => setInviteRole("VIEWER")}
              />
              <Chip
                label="可编辑"
                active={inviteRole === "EDITOR"}
                onPress={() => setInviteRole("EDITOR")}
              />
            </View>
            <Body muted>
              {inviteRole === "VIEWER"
                ? "对方能看档案与解读，不能改写。"
                : "对方可以一起归档报告、记叮嘱。"}
            </Body>
            <Button
              label="生成邀请"
              onPress={() => {
                createInvite("FATHER", inviteRole);
                setShowInvite(false);
              }}
            />
            <Button label="取消" variant="ghost" onPress={() => setShowInvite(false)} />
          </>
        )}

        {!canWrite ? <Caption>当前角色无管理权限</Caption> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 48, paddingTop: 8 },
  sub: {
    fontFamily,
    fontSize: 17,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: spacing.xl,
  },
  remove: { color: colors.danger, fontSize: 15, fontFamily },
  codeCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 6,
  },
  code: {
    fontFamily,
    fontSize: 28,
    fontWeight: "700",
    color: colors.brandDark,
    letterSpacing: 1,
  },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: spacing.md },
});
