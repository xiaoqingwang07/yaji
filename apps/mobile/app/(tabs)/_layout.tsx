import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { TabIcon } from "@/components/TabIcons";
import { colors, fontFamilySans } from "@/constants/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={[
        labelStyles.text,
        { color: focused ? colors.brandDeep : colors.textMuted },
        focused && labelStyles.textActive,
      ]}
    >
      {label}
    </Text>
  );
}

function TabItem({
  label,
  name,
  focused,
}: {
  label: string;
  name: "now" | "archive" | "health" | "me";
  focused: boolean;
}) {
  return (
    <View style={[itemStyles.wrap, focused && itemStyles.wrapActive]}>
      <TabIcon name={name} focused={focused} />
      <TabLabel label={label} focused={focused} />
    </View>
  );
}

const labelStyles = StyleSheet.create({
  text: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: fontFamilySans,
    letterSpacing: 0.4,
    marginTop: 3,
  },
  textActive: { fontWeight: "700" },
});

const itemStyles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  wrapActive: {},
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.bg,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 17,
          fontFamily: fontFamilySans,
        },
        headerTintColor: colors.text,
        tabBarActiveTintColor: colors.brandDeep,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === "web" ? 70 : 74,
          borderRadius: 0,
          backgroundColor: "rgba(255,255,255,0.98)",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderWidth: 0,
          borderColor: colors.separator,
          paddingBottom: 0,
          paddingTop: 8,
          ...Platform.select({
            web: {
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
              boxShadow: "0 -2px 10px rgba(23,34,29,0.04)",
            },
            ios: {
              shadowColor: "#17221D",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            },
            android: { elevation: 4 },
            default: {},
          }),
        },
        tabBarItemStyle: { paddingTop: 0 },
      }}
    >
      <Tabs.Screen
        name="now"
        options={{
          title: "此刻",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabItem label="此刻" name="now" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="timeline"
        options={{
          title: "档案",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabItem label="档案" name="archive" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          href: null,
          title: "添加",
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: "健康",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabItem label="健康" name="health" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "我的",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabItem label="我的" name="me" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          href: null,
          title: "提醒",
        }}
      />
    </Tabs>
  );
}
