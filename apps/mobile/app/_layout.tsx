import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PrototypeProvider } from "@/src/state/PrototypeContext";
import { colors } from "@/constants/theme";

export { ErrorBoundary } from "expo-router";

/**
 * 标题策略：
 * - Tab / 登录：无系统栏
 * - Modal / 二级页：系统栏短标题 + 返回；页内不再写同名大标题
 */
export default function RootLayout() {
  return (
    <PrototypeProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "600", fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-menu" options={{ title: "添加", presentation: "modal" }} />
        <Stack.Screen name="note/quick" options={{ title: "记一条", presentation: "modal" }} />
        <Stack.Screen name="voice/recording" options={{ title: "就诊录音", presentation: "modal" }} />
        <Stack.Screen name="profile-edit" options={{ title: "完善档案", presentation: "modal" }} />
        <Stack.Screen name="reminder/new" options={{ title: "设提醒", presentation: "modal" }} />
        <Stack.Screen name="event/new" options={{ title: "新增事件", presentation: "modal" }} />
        <Stack.Screen name="report/upload" options={{ title: "上传报告" }} />
        <Stack.Screen name="report/processing" options={{ title: "识别中" }} />
        <Stack.Screen name="report/review" options={{ title: "确认报告" }} />
        <Stack.Screen name="import/batch" options={{ title: "批量导入" }} />
        <Stack.Screen name="summary/stage" options={{ title: "阶段小结" }} />
        <Stack.Screen name="trust/index" options={{ title: "隐私与信任" }} />
        <Stack.Screen name="privacy/index" options={{ title: "隐私与数据" }} />
        <Stack.Screen name="family/index" options={{ title: "家庭成员" }} />
        <Stack.Screen name="event/[id]" options={{ title: "详情" }} />
        <Stack.Screen name="note/doctor" options={{ title: "医生叮嘱", presentation: "modal" }} />
        <Stack.Screen name="note/medication" options={{ title: "用药记录", presentation: "modal" }} />
        <Stack.Screen name="health/mother" options={{ title: "妈妈健康" }} />
        <Stack.Screen name="health/mother-new" options={{ title: "记一条", presentation: "modal" }} />
        <Stack.Screen name="health/baby" options={{ title: "宝宝成长" }} />
        <Stack.Screen name="health/baby-new" options={{ title: "新增宝宝记录", presentation: "modal" }} />
        <Stack.Screen name="demo-states" options={{ title: "状态演示" }} />
      </Stack>
    </PrototypeProvider>
  );
}
