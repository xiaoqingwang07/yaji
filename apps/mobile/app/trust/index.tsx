import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Group, Row, Screen } from "@/components/ui";
import { colors, fontFamily, radii, spacing, typography } from "@/constants/theme";

const ITEMS = [
  {
    title: "加密存储",
    body: "报告、录音和健康数值按敏感数据保护，不会写进公开地址或普通日志。",
  },
  {
    title: "绝不用于模型训练",
    body: "家庭档案只为你们整理与解读，不会拿去训练模型，也不会交给广告。",
  },
  {
    title: "随时导出，删除即删除",
    body: "你可以完整带走数据。申请删除后，账号侧访问立即停止。",
  },
] as const;

export default function TrustScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>写进产品的三条底线，不是营销话术。</Text>

        {ITEMS.map((item, index) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.index}>{String(index + 1).padStart(2, "0")}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        ))}

        <Group>
          <Row
            title="导出家庭数据"
            subtitle="JSON + 附件"
            showSeparator
            onPress={() =>
              Alert.alert("已创建导出任务", "原型阶段模拟异步导出。")
            }
          />
          <Row
            title="申请删除家庭数据"
            showSeparator={false}
            onPress={() =>
              Alert.alert("二次确认", "删除将异步执行，备份清理周期见隐私政策。", [
                { text: "取消", style: "cancel" },
                { text: "确认申请", style: "destructive" },
              ])
            }
          />
        </Group>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 56, paddingTop: 8 },
  lead: {
    fontFamily,
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  index: {
    fontFamily,
    fontSize: 13,
    color: colors.brandDark,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
