import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { BrandMark, Button, Field, Screen } from "@/components/ui";
import { colors, fontFamily, spacing, WARM_COPY } from "@/constants/theme";
import { goReplace } from "@/src/nav";
import { usePrototype } from "@/src/state/PrototypeContext";

export default function LoginScreen() {
  const { login, loadDemoScenario } = usePrototype();
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <Screen glow glowVariant="peach" safeTop>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <BrandMark subtitle={WARM_COPY.loginBrand} />
          <Text style={styles.tagline}>{WARM_COPY.loginTagline}</Text>
        </View>

        <Field
          label="手机号"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholder="请输入手机号"
        />
        <Field
          label="验证码"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          placeholder="请输入验证码"
        />

        <View style={styles.agreeRow}>
          <Switch
            value={agreed}
            onValueChange={setAgreed}
            trackColor={{ true: colors.brand, false: colors.fillStrong }}
          />
          <Text style={styles.agreeText}>同意服务协议与隐私政策</Text>
        </View>

        <Button
          label="继续"
          disabled={!agreed || mobile.length < 11 || code.length < 4}
          onPress={() => {
            login();
            goReplace("/onboarding");
          }}
        />

        <Pressable onPress={() => setShowDemo((v) => !v)} style={styles.demoToggle}>
          <Text style={styles.demoToggleText}>{showDemo ? "收起演示" : "体验示范档案"}</Text>
        </Pressable>

        {showDemo ? (
          <View style={styles.demoBlock}>
            <Pressable
              onPress={() => {
                loadDemoScenario("PREGNANCY");
                goReplace("/(tabs)/now");
              }}
            >
              <Text style={styles.demoLink}>孕期示范</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable
              onPress={() => {
                loadDemoScenario("BORN");
                goReplace("/(tabs)/now");
              }}
            >
              <Text style={styles.demoLink}>已出生示范</Text>
            </Pressable>
            <Text style={styles.dot}>·</Text>
            <Pressable
              onPress={() => {
                setMobile("13800000000");
                setCode("123456");
                setAgreed(true);
              }}
            >
              <Text style={styles.demoLink}>填入演示号</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingBottom: 64, paddingTop: 24 },
  hero: { marginBottom: 36 },
  tagline: {
    fontFamily,
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 28,
    marginTop: 4,
  },
  agreeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  agreeText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 13,
    fontFamily,
  },
  demoToggle: {
    alignSelf: "center",
    marginTop: 24,
    paddingVertical: 8,
  },
  demoToggleText: {
    fontFamily,
    fontSize: 14,
    color: colors.textMuted,
  },
  demoBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 10,
    flexWrap: "wrap",
  },
  demoLink: { color: colors.link, fontSize: 15, fontFamily },
  dot: { color: colors.textMuted },
});
