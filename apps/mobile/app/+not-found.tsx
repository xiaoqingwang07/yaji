import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontFamily } from "@/constants/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "页面不存在" }} />
      <View style={styles.container}>
        <Text style={styles.title}>这里什么也没有</Text>
        <Link href="/(tabs)/now" style={styles.link}>
          <Text style={styles.linkText}>回到此刻</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily,
    color: colors.text,
  },
  link: { marginTop: 16, paddingVertical: 12 },
  linkText: { fontSize: 15, color: colors.link, fontFamily },
});
