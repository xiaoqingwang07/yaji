import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors, fontFamilySans, metricPalette, radii, shadows, spacing } from "@/constants/theme";

export type MetricKind = "heart" | "ruler" | "weight" | "pressure" | "baby" | "default";

export function resolveMetricKind(label: string): MetricKind {
  if (/胎心|心率|heart/i.test(label)) return "heart";
  if (/双顶|头围|腹围|股骨|头臀|BPD|HC|AC|FL|CRL|NT|宫高|小脑/.test(label))
    return "ruler";
  if (/体重|估计体重|weight/i.test(label)) return "weight";
  if (/血压|收缩|舒张|pressure/i.test(label)) return "pressure";
  if (/胎盘|胎儿|宝宝|身长|头围/.test(label)) return "baby";
  return "default";
}

export function MetricIcon({
  kind,
  size = 32,
}: {
  kind: MetricKind;
  size?: number;
}) {
  const palette = metricPalette[kind];
  const inner = size * 0.4;

  return (
    <View
      style={[
        styles.iconWrap,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: palette.bg,
        },
      ]}
    >
      {kind === "heart" ? (
        <View
          style={{
            width: inner,
            height: inner * 0.85,
            borderRadius: inner / 2,
            backgroundColor: palette.fg,
            transform: [{ rotate: "-45deg" }],
            opacity: 0.85,
          }}
        />
      ) : null}
      {kind === "ruler" ? (
        <View style={{ width: inner * 1.1, height: 2.5, backgroundColor: palette.fg, borderRadius: 2 }}>
          <View
            style={{
              position: "absolute",
              left: 0,
              top: -3,
              width: 2,
              height: 8,
              backgroundColor: palette.fg,
              borderRadius: 1,
            }}
          />
          <View
            style={{
              position: "absolute",
              right: 0,
              top: -3,
              width: 2,
              height: 8,
              backgroundColor: palette.fg,
              borderRadius: 1,
            }}
          />
        </View>
      ) : null}
      {kind === "weight" ? (
        <View
          style={{
            width: inner,
            height: inner * 0.7,
            borderRadius: 3,
            borderWidth: 2,
            borderColor: palette.fg,
            backgroundColor: "transparent",
          }}
        />
      ) : null}
      {kind === "pressure" ? (
        <View
          style={{
            width: inner * 0.6,
            height: inner * 0.6,
            borderRadius: inner,
            borderWidth: 2,
            borderColor: palette.fg,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: "35%",
              left: "20%",
              right: "20%",
              height: 1.5,
              backgroundColor: palette.fg,
            }}
          />
        </View>
      ) : null}
      {kind === "baby" || kind === "default" ? (
        <View
          style={{
            width: inner * 0.65,
            height: inner * 0.65,
            borderRadius: inner,
            backgroundColor: palette.fg,
            opacity: 0.8,
          }}
        />
      ) : null}
    </View>
  );
}

export function parseMetricNumber(raw: string): number | null {
  if (!raw) return null;
  const bp = raw.match(/(\d+)\s*\/\s*\d+/);
  if (bp) return Number(bp[1]);
  const n = raw.replace(/[^\d.-]/g, "");
  if (!n) return null;
  const v = Number(n);
  return Number.isFinite(v) ? v : null;
}

export function recentPair(values: number[]): [number, number] | null {
  if (values.length < 2) return null;
  return [values[values.length - 2], values[values.length - 1]];
}

export function trendPhrase(values: number[]): string {
  const pair = recentPair(values);
  if (!pair) return "";
  const [prev, last] = pair;
  const tol = Math.max(Math.abs(prev) * 0.02, 1);
  const delta = last - prev;
  if (Math.abs(delta) <= tol) return "较上次接近";
  return delta > 0 ? "较上次略高" : "较上次略低";
}

export function sparklineValues(values: number[]): number[] {
  const pair = recentPair(values);
  return pair ? [...pair] : values;
}

export function Sparkline({
  values,
  color = colors.brandDark,
  width = 100,
  height = 32,
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const padX = 6;
  const padY = 6;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;
  const points = values.map((v, i) => {
    const x =
      padX + (values.length === 1 ? usableW / 2 : (i / (values.length - 1)) * usableW);
    const y = padY + ((max - v) / span) * usableH;
    return { x, y };
  });

  return (
    <View
      style={{ width, height, marginTop: 8, position: "relative" }}
      accessibilityLabel="趋势"
    >
      {points.slice(0, -1).map((a, i) => {
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`seg-${i}`}
            style={{
              position: "absolute",
              left: (a.x + b.x) / 2 - length / 2,
              top: (a.y + b.y) / 2 - 1,
              width: length,
              height: 2,
              borderRadius: 1,
              backgroundColor: color,
              opacity: 0.35,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}
      {points.map((p, i) => {
        const last = i === points.length - 1;
        const size = last ? 6 : 4;
        return (
          <View
            key={`pt-${i}`}
            style={{
              position: "absolute",
              left: p.x - size / 2,
              top: p.y - size / 2,
              width: size,
              height: size,
              borderRadius: size,
              backgroundColor: color,
              opacity: last ? 1 : 0.45,
            }}
          />
        );
      })}
    </View>
  );
}

export function MetricTile({
  label,
  value,
  unit,
  series,
  onPress,
  style,
}: {
  label: string;
  value?: string;
  unit?: string;
  series?: number[];
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const kind = resolveMetricKind(label);
  const palette = metricPalette[kind];

  const content = (
    <View style={[styles.tile, { backgroundColor: palette.bg }, style]}>
      <View style={styles.tileHeader}>
        <MetricIcon kind={kind} size={28} />
        <Text style={styles.tileLabel} numberOfLines={1}>
          {shortLabel(label)}
        </Text>
      </View>
      <Text style={[styles.tileValue, { color: palette.fg }]} numberOfLines={1}>
        {value ?? "—"}
        {unit ? <Text style={styles.tileUnit}> {unit}</Text> : null}
      </Text>
      {series && series.length >= 2 ? (
        <>
          <Sparkline
            values={sparklineValues(series)}
            color={palette.fg}
            width={88}
            height={26}
          />
          <Text style={[styles.trendHint, { color: palette.fg }]}>
            {trendPhrase(series)}
          </Text>
        </>
      ) : series && series.length === 1 ? (
        <Text style={[styles.trendHint, { color: colors.textMuted }]}>再记一条可看趋势</Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.72 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function MetricStrip({
  items,
  onPressItem,
}: {
  items: Array<{ label: string; value?: string; unit?: string; series?: number[] }>;
  onPressItem?: (label: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <View style={styles.strip}>
      {items.map((item) => (
        <View key={item.label} style={styles.stripItem}>
          <MetricTile
            label={item.label}
            value={item.value}
            unit={item.unit}
            series={item.series}
            onPress={onPressItem ? () => onPressItem(item.label) : undefined}
          />
        </View>
      ))}
    </View>
  );
}

function shortLabel(label: string) {
  return label
    .replace(/\s*BPD|\s*HC|\s*AC|\s*FL|\s*CRL/g, "")
    .replace("双顶径", "双顶径")
    .trim();
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  tile: {
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minHeight: 120,
    gap: 4,
    ...shadows.sm as object,
  },
  tileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  trendHint: {
    fontFamily: fontFamilySans,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tileLabel: {
    fontFamily: fontFamilySans,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  tileValue: {
    fontFamily: fontFamilySans,
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -0.5,
  },
  tileUnit: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textMuted,
  },
  strip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: spacing.lg,
  },
  stripItem: {
    width: "31%",
    flexGrow: 1,
    minWidth: "30%",
    maxWidth: "48%",
  },
});
