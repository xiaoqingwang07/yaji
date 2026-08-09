import type { AiNextSuggestion, PrototypeState } from "../fixtures/types";

export function suggestionTopic(title: string): string {
  const quoted = title.match(/「([^」]+)」/);
  if (quoted?.[1]) return quoted[1];
  return title
    .replace(/^添加/, "")
    .replace(/提醒.*/, "")
    .replace(/（[^）]*）/g, "")
    .trim();
}

export function alreadyBooked(topic: string, state: PrototypeState): boolean {
  if (!topic) return false;
  const hitReminder = state.reminders.some(
    (r) => r.status === "PENDING" && r.title.includes(topic),
  );
  const hitNext = state.nextActions.some(
    (a) =>
      a.status === "PENDING" &&
      a.title.includes(topic) &&
      (a.detail?.includes("已预约") ||
        a.dueLabel?.includes("已预约") ||
        a.source === "REMINDER"),
  );
  return hitReminder || hitNext;
}

/** 已预约的 REMINDER 改为携带核对文案，避免再建议「添加提醒」 */
export function resolveSuggestions(
  items: AiNextSuggestion[] | undefined,
  state: PrototypeState,
): AiNextSuggestion[] {
  if (!items?.length) return [];
  return items.map((s) => {
    if (s.kind !== "REMINDER") return s;
    const topic = suggestionTopic(s.title);
    if (!alreadyBooked(topic, state)) return s;
    return {
      ...s,
      kind: "BRING" as const,
      title: `已有预约 · 核对「${topic}」携带`,
      detail: "不用再添提醒，打开携带清单勾一下就好",
    };
  });
}
