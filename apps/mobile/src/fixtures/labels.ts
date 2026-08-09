import type { EventType, Relation, Role, TimelineEvent } from "./types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  PRENATAL_CHECK: "产检",
  MEDICAL_REPORT: "检查报告",
  SYMPTOM: "症状",
  MEDICATION: "用药",
  DOCTOR_NOTE: "医生嘱咐",
  VISIT_RECORDING: "就诊录音",
  DELIVERY: "分娩",
  POSTPARTUM_CHECK: "产后复查",
  BABY_CHECKUP: "宝宝体检",
  NEWBORN_SCREENING: "新生儿筛查",
  VACCINATION: "疫苗",
  ILLNESS_VISIT: "疾病就诊",
  MILESTONE: "成长里程碑",
  OTHER: "记录",
};

/** 避免把体重/血压等居家监测显示成空洞的「其他」 */
export function formatEventTypeLabel(event: TimelineEvent): string {
  if (event.source === "SYSTEM") return "家庭";
  if (event.source === "HEALTH_RECORD") {
    const metric = event.metrics?.[0]?.label || "";
    if (/体重|血压|胎心/.test(metric) || /体重|血压|胎心/.test(event.title)) {
      return "居家监测";
    }
    return "健康记录";
  }
  if (event.type === "OTHER") return "记录";
  return EVENT_TYPE_LABELS[event.type];
}

export const RELATION_LABELS: Record<Relation, string> = {
  MOTHER: "妈妈",
  FATHER: "爸爸",
  GRANDPARENT: "祖父母",
  CAREGIVER: "照护者",
  OTHER: "其他",
};

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "拥有者",
  EDITOR: "可编辑",
  VIEWER: "仅查看",
};

export const CATEGORY_LABELS: Record<string, string> = {
  IMAGING: "影像/超声",
  LAB: "检验",
  OTHER: "其他",
  CHILD_CHECKUP: "儿童体检",
  DELIVERY: "分娩",
};

function parseInstant(iso: string): Date | null {
  if (!iso?.trim()) return null;
  const raw = iso.trim();
  const withZone =
    /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00+08:00` : raw;
  const d = new Date(withZone);
  return Number.isNaN(d.getTime()) ? null : d;
}

function dayPeriod(hours: number): string {
  if (hours < 6) return "凌晨";
  if (hours < 12) return "上午";
  if (hours < 13) return "中午";
  if (hours < 18) return "下午";
  return "晚上";
}

function clock12(hours: number, minutes: number): string {
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, "0")}`;
}

/** 用户可见时间：8 月 16 日 上午 9:00（内部仍用 ISO） */
export function formatDateTime(iso: string) {
  const d = parseInstant(iso);
  if (!d) return iso;
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 ${dayPeriod(d.getHours())} ${clock12(d.getHours(), d.getMinutes())}`;
}

/** 仅日期：8 月 16 日；支持 YYYY-MM-DD */
export function formatDate(iso: string) {
  const d = parseInstant(iso);
  if (!d) return iso;
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

/** 列表用短时间：7 月 22 日 · 上午；今天/昨天优先 */
export function formatListDateTime(iso: string, now = new Date()) {
  const d = parseInstant(iso);
  if (!d) return iso;
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(now)) / 86400000);
  const period = dayPeriod(d.getHours());
  if (diffDays === 0) return `今天 · ${period}`;
  if (diffDays === -1) return `昨天 · ${period}`;
  if (diffDays === 1) return `明天 · ${period}`;
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${period}`;
}

/** 写入本地 ISO（+08:00），供提醒/事件保存 */
export function toLocalIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00+08:00`;
}

/**
 * 解析人话或机读时间；失败返回 null。
 * 支持：ISO、2026-08-16 09:00、8 月 16 日 上午 9:00
 */
export function parseFlexibleDateTime(text: string, fallbackYear?: number): string | null {
  const raw = text.trim();
  if (!raw) return null;

  const asIso = parseInstant(raw);
  if (asIso && (/T/.test(raw) || /^\d{4}-\d{2}-\d{2}/.test(raw))) {
    return toLocalIso(asIso);
  }

  const ymd = raw.match(
    /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/,
  );
  if (ymd) {
    const y = Number(ymd[1]);
    const mo = Number(ymd[2]);
    const day = Number(ymd[3]);
    const hh = ymd[4] != null ? Number(ymd[4]) : 9;
    const mm = ymd[5] != null ? Number(ymd[5]) : 0;
    return toLocalIso(new Date(y, mo - 1, day, hh, mm, 0, 0));
  }

  const cn = raw.match(
    /^(?:(\d{4})\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*日(?:\s*(凌晨|上午|中午|下午|晚上)\s*(\d{1,2}):(\d{2}))?$/,
  );
  if (cn) {
    const y = cn[1] ? Number(cn[1]) : fallbackYear ?? new Date().getFullYear();
    const mo = Number(cn[2]);
    const day = Number(cn[3]);
    let hh = 9;
    let mm = 0;
    if (cn[5] != null) {
      let h = Number(cn[5]);
      mm = Number(cn[6]);
      const period = cn[4];
      if (period === "下午" || period === "晚上") {
        if (h < 12) h += 12;
      } else if (period === "中午") {
        if (h < 12) h = 12;
      } else if (period === "凌晨" && h === 12) {
        h = 0;
      } else if ((period === "上午" || period === "凌晨") && h === 12) {
        h = 0;
      }
      hh = h;
    } else if (cn[4]) {
      const period = cn[4];
      hh =
        period === "凌晨"
          ? 3
          : period === "上午"
            ? 9
            : period === "中午"
              ? 12
              : period === "下午"
                ? 15
                : 20;
    }
    return toLocalIso(new Date(y, mo - 1, day, hh, mm, 0, 0));
  }

  return null;
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
