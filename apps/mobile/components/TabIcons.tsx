import { View } from "react-native";
import { colors } from "@/constants/theme";

/**
 * 底栏图标 v3 — 更纤细的线性几何
 * active 用实心填充 + 品牌色 vs inactive 用 hairline 描边
 */
export function TabIcon({
  name,
  focused,
}: {
  name: "now" | "archive" | "health" | "me";
  focused: boolean;
}) {
  const fg = focused ? colors.brandDark : colors.textMuted;
  const o = focused ? 1 : 0.5;

  if (name === "now") {
    return (
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: fg,
            alignItems: "center",
            justifyContent: "center",
            opacity: o,
          }}
        >
          {/* 时针 */}
          <View
            style={{
              position: "absolute",
              width: 1.4,
              height: 6,
              backgroundColor: fg,
              borderRadius: 1,
              top: 4,
              left: 9.3,
            }}
          />
          {/* 分针 */}
          <View
            style={{
              position: "absolute",
              width: 5,
              height: 1.4,
              backgroundColor: fg,
              borderRadius: 1,
              top: 9.3,
              left: 10,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === "archive") {
    return (
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 16,
            height: 19,
            borderRadius: 3,
            borderWidth: 1.4,
            borderColor: fg,
            opacity: o,
            paddingTop: 5,
            paddingHorizontal: 3,
            gap: 3,
          }}
        >
          <View
            style={{
              height: 1.2,
              backgroundColor: fg,
              borderRadius: 1,
              opacity: 0.9,
            }}
          />
          <View
            style={{
              height: 1.2,
              width: "60%",
              backgroundColor: fg,
              borderRadius: 1,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              height: 1.2,
              width: "75%",
              backgroundColor: fg,
              borderRadius: 1,
              opacity: 0.35,
            }}
          />
        </View>
      </View>
    );
  }

  if (name === "health") {
    return (
      <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            width: 20,
            height: 16,
            justifyContent: "flex-end",
            opacity: o,
          }}
        >
          {/* baseline */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1.2,
              backgroundColor: fg,
              borderRadius: 1,
              opacity: 0.3,
            }}
          />
          {/* bars */}
          <View
            style={{
              position: "absolute",
              bottom: 2,
              left: 1,
              width: 3.5,
              height: 4,
              borderRadius: 1.5,
              backgroundColor: fg,
              opacity: 0.35,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 2,
              left: 7,
              width: 3.5,
              height: 8,
              borderRadius: 1.5,
              backgroundColor: fg,
              opacity: 0.55,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: 2,
              left: 13,
              width: 3.5,
              height: 6,
              borderRadius: 1.5,
              backgroundColor: focused ? colors.brand : fg,
              opacity: focused ? 0.9 : 0.75,
            }}
          />
        </View>
      </View>
    );
  }

  // "me"
  return (
    <View style={{ width: 24, height: 24, alignItems: "center", justifyContent: "flex-end" }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1.4,
          borderColor: fg,
          backgroundColor: focused ? fg : "transparent",
          opacity: o,
          marginBottom: 2,
        }}
      />
      <View
        style={{
          width: 14,
          height: 7,
          borderTopLeftRadius: 7,
          borderTopRightRadius: 7,
          borderWidth: 1.4,
          borderBottomWidth: 0,
          borderColor: fg,
          backgroundColor: focused ? fg : "transparent",
          opacity: focused ? 0.7 : o,
        }}
      />
    </View>
  );
}
