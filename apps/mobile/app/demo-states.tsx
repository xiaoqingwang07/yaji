import { router } from "expo-router";
import { Body, Button, Screen, Title } from "@/components/ui";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function DemoStatesScreen() {
  const { setUiState } = usePrototype();
  return (
    <Screen>
      <Title>状态演示</Title>
      <Body muted>每个数据页需覆盖加载、空、失败、无权限。点按后查看时间轴表现。</Body>
      <Button
        label="加载中"
        onPress={() => {
          setUiState("loading");
          router.push("/(tabs)/timeline");
        }}
      />
      <Button
        label="空数据"
        variant="secondary"
        onPress={() => {
          setUiState("empty");
          router.push("/(tabs)/timeline");
        }}
      />
      <Button
        label="失败"
        variant="secondary"
        onPress={() => {
          setUiState("error");
          router.push("/(tabs)/timeline");
        }}
      />
      <Button
        label="无权限"
        variant="secondary"
        onPress={() => {
          setUiState("forbidden");
          router.push("/(tabs)/timeline");
        }}
      />
      <Button
        label="恢复正常"
        variant="ghost"
        onPress={() => {
          setUiState("ready");
          router.push("/(tabs)/timeline");
        }}
      />
    </Screen>
  );
}
