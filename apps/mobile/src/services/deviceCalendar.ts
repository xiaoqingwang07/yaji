import { Platform } from "react-native";
import * as Calendar from "expo-calendar/legacy";

export type CalendarWriteResult =
  | { ok: true; eventId: string }
  | {
      ok: false;
      reason: "web" | "unsupported" | "denied" | "error";
      message: string;
    };

const DISCLAIMER = "以医嘱为准。芽纪提醒仅供记录，不构成医疗建议。";

/** Web / 无原生日历模块时不可写入；勿假称已同步 */
export function supportsDeviceCalendarWrite(): boolean {
  return Platform.OS === "ios" || Platform.OS === "android";
}

async function resolveWritableCalendarId(): Promise<string | null> {
  if (Platform.OS === "ios") {
    const def = await Calendar.getDefaultCalendarAsync();
    return def?.id ?? null;
  }
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((c) => c.allowsModifications) ?? calendars[0];
  return writable?.id ?? null;
}

export async function addReminderToDeviceCalendar(input: {
  title: string;
  startDate: Date;
  notes?: string;
}): Promise<CalendarWriteResult> {
  if (!supportsDeviceCalendarWrite()) {
    return {
      ok: false,
      reason: "web",
      message: "当前环境无法写入系统日历，已保存在芽纪内；真机可同步",
    };
  }

  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== "granted") {
      return {
        ok: false,
        reason: "denied",
        message: "未获得日历权限，提醒已保存在芽纪内",
      };
    }

    const calendarId = await resolveWritableCalendarId();
    if (!calendarId) {
      return {
        ok: false,
        reason: "unsupported",
        message: "未找到可写入的日历，提醒已保存在芽纪内",
      };
    }

    const endDate = new Date(input.startDate.getTime() + 60 * 60 * 1000);
    const notes = [input.notes?.trim(), DISCLAIMER].filter(Boolean).join("\n");

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: input.title,
      startDate: input.startDate,
      endDate,
      notes,
      timeZone: "Asia/Shanghai",
      alarms: [{ relativeOffset: -60 }],
    });

    return { ok: true, eventId };
  } catch {
    return {
      ok: false,
      reason: "error",
      message: "写入系统日历未成功，提醒已保存在芽纪内",
    };
  }
}
