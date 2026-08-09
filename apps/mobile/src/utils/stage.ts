import type { PrototypeState } from "../fixtures/types";

export type NodeInfo = {
  title: string;
  subtitle: string;
  /** 主数字，如「24」或「3」 */
  heroNumber: string;
  /** 主数字旁单位，如「周」或「月」 */
  heroUnit: string;
  /** 主数字旁补充，如「+3 天」 */
  heroAside?: string;
  stageLine: string;
  /** 0–1，孕期进度用 */
  progress?: number;
};

/** 用预产期倒推或 LMP 估算孕周展示（原型用） */
export function getNodeLabel(state: PrototypeState): NodeInfo {
  if (state.scenario === "PLANNING") {
    return {
      title: "备孕中",
      subtitle: "先把检查收进来，给未来的小芽留一份起点",
      heroNumber: "·",
      heroUnit: "备孕",
      stageLine: "慢慢准备，不着急",
    };
  }

  if (state.scenario === "BORN") {
    const birth = state.babyBirthDate || "2026-05-20";
    const days = daysBetween(birth, today());
    const months = Math.max(0, Math.floor(days / 30));
    const rem = days % 30;
    const baby = state.babyName || "宝宝";
    return {
      title: `${baby} · ${months} 月龄`,
      subtitle: `和 ${baby} 一起走过约 ${days} 天`,
      heroNumber: String(months),
      heroUnit: "月",
      heroAside: rem ? `+${rem} 天` : undefined,
      stageLine: `${baby} 在长大，档案陪着你们`,
      progress: Math.min(1, days / 365),
    };
  }

  const due = state.dueDate;
  const lmp = state.lmpDate;
  let gestationalDays = 24 * 7 + 3; // brief 示范默认 24+3
  if (lmp) {
    gestationalDays = Math.max(0, daysBetween(lmp, today()));
  } else if (due) {
    const remaining = daysBetween(today(), due);
    gestationalDays = Math.max(0, 280 - remaining);
  }
  const weeks = Math.floor(gestationalDays / 7);
  const plus = gestationalDays % 7;
  const remainWeeks = due
    ? Math.max(0, Math.ceil(daysBetween(today(), due) / 7))
    : Math.max(0, 40 - weeks);

  const stageLine =
    weeks < 14
      ? "孕早期 · 小芽刚安顿好"
      : weeks < 28
        ? "孕中期 · 小芽正在慢慢长开"
        : "孕晚期 · 见面越来越近了";

  return {
    title: `孕 ${weeks}+${plus} 周`,
    subtitle: due
      ? `预产期 ${due} · 大约还有 ${remainWeeks} 周陪伴`
      : "可在「我的」补充预产期",
    heroNumber: String(weeks),
    heroUnit: "周",
    heroAside: `+${plus} 天`,
    stageLine,
    progress: Math.min(1, gestationalDays / 280),
  };
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysBetween(from: string, to: string) {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
}
