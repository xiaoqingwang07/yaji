import React, { createContext, useContext, useMemo, useState } from "react";
import {
  buildStageSummary,
  createImportBatchItems,
  createInitialState,
  createMockReport,
  createVisitRecordingDraft,
  seedBornScenario,
  seedPlanningScenario,
  seedPregnancyScenario,
} from "../fixtures/seed";
import { formatDate, uid } from "../fixtures/labels";
import { alreadyBooked, suggestionTopic } from "../utils/suggestions";
import type {
  AiNextSuggestion,
  CalendarSyncStatus,
  DemoUiState,
  EventType,
  PrototypeState,
  Relation,
  ReportField,
  Role,
  Scenario,
  Stage,
  TimelineEvent,
} from "../fixtures/types";

interface PrototypeContextValue {
  state: PrototypeState;
  login: () => void;
  logout: () => void;
  completeOnboarding: (input: {
    scenario: Scenario;
    dueDate?: string;
    lmpDate?: string;
    babyBirthDate?: string;
  }) => void;
  updateProfile: (patch: Partial<Pick<PrototypeState, "familyName" | "motherName" | "relationToMother" | "dueDate" | "lmpDate" | "babyName" | "babyBirthDate">>) => void;
  loadDemoScenario: (scenario: Scenario) => void;
  setUiState: (uiState: DemoUiState) => void;
  setRole: (role: Role) => void;
  addEvent: (input: {
    title: string;
    type: EventType;
    stage: Stage;
    occurredAt: string;
    notes?: string;
    location?: string;
    subject: "MOTHER" | "BABY" | "FAMILY";
  }) => string;
  updateEvent: (id: string, patch: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  startReportUpload: (kind?: "ultrasound" | "lab" | "unknown") => void;
  markReportProcessing: () => void;
  markReportReady: () => void;
  /** 演示：直接打开带白话解读的待确认报告 */
  openPendingReportReview: (kind?: "ultrasound" | "lab" | "unknown") => void;
  updateReportField: (fieldId: string, patch: Partial<ReportField>) => void;
  setReportBringFlag: (value: boolean) => void;
  acceptSuggestion: (suggestionId: string) => void;
  acceptAllSuggestions: () => void;
  confirmReport: () => string | undefined;
  addMotherHealth: (label: string, value: string, unit?: string) => void;
  addBabyHealth: (label: string, value: string, unit?: string) => void;
  addVaccine: (name: string, date: string, dose?: number) => void;
  addReminder: (
    title: string,
    type: string,
    scheduledAt: string,
    notes?: string,
    calendarSync?: CalendarSyncStatus,
  ) => void;
  completeReminder: (id: string) => void;
  cancelReminder: (id: string) => void;
  completeNextAction: (id: string) => void;
  toggleBringItem: (id: string) => void;
  addDoctorNote: (note: string) => void;
  addMedicationNote: (note: string) => void;
  createInvite: (relation: Relation, role: Role) => string;
  removeMember: (id: string) => void;
  startImportBatch: () => void;
  confirmImportItem: (id: string) => void;
  abandonImportBatch: () => void;
  startVisitRecording: () => void;
  tickRecording: () => void;
  finishRecording: () => void;
  confirmVisitRecording: () => void;
  generateStageSummary: (rangeLabel?: string) => void;
  adoptOpenFollowUp: (id: string) => void;
  canWrite: boolean;
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PrototypeState>(createInitialState);

  const value = useMemo<PrototypeContextValue>(() => {
    const canWrite = state.role !== "VIEWER";

    return {
      state,
      canWrite,
      login: () => setState((s) => ({ ...s, authed: true })),
      logout: () => setState(createInitialState()),
      completeOnboarding: (input) => {
        setState((s) => {
          const next = {
            ...s,
            scenario: input.scenario,
            dueDate: input.dueDate,
            lmpDate: input.lmpDate,
            babyBirthDate: input.babyBirthDate,
            familyName: "我家的芽纪",
            motherName: "我",
            relationToMother: "MOTHER" as const,
            authed: true,
            onboarding: "DONE" as const,
            uiState: "ready" as const,
          };
          if (input.scenario === "BORN") return seedBornScenario(next);
          if (input.scenario === "PLANNING") return seedPlanningScenario(next);
          return seedPregnancyScenario(next);
        });
      },
      updateProfile: (patch) => setState((s) => ({ ...s, ...patch })),
      loadDemoScenario: (scenario) => {
        setState((s) => {
          const base = { ...s, authed: true, uiState: "ready" as const };
          if (scenario === "BORN") return seedBornScenario(base);
          if (scenario === "PLANNING") return seedPlanningScenario(base);
          return seedPregnancyScenario(base);
        });
      },
      setUiState: (uiState) => setState((s) => ({ ...s, uiState })),
      setRole: (role) => setState((s) => ({ ...s, role })),
      addEvent: (input) => {
        const id = uid("evt");
        setState((s) => ({
          ...s,
          events: [
            {
              id,
              ...input,
              source: "MANUAL",
              contextLabel:
                input.subject === "BABY" ? "宝宝" : input.subject === "MOTHER" ? "妈妈" : "家庭",
            },
            ...s.events,
          ],
        }));
        return id;
      },
      updateEvent: (id, patch) => {
        setState((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },
      deleteEvent: (id) => {
        setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }));
      },
      startReportUpload: (kind = "ultrasound") => {
        setState((s) => ({
          ...s,
          report: { ...createMockReport(kind), status: "UPLOADING" },
        }));
      },
      markReportProcessing: () => {
        setState((s) =>
          s.report ? { ...s, report: { ...s.report, status: "PROCESSING" } } : s,
        );
      },
      markReportReady: () => {
        setState((s) =>
          s.report ? { ...s, report: { ...s.report, status: "NEEDS_REVIEW" } } : s,
        );
      },
      openPendingReportReview: (kind = "ultrasound") => {
        setState((s) => ({
          ...s,
          report: { ...createMockReport(kind), status: "NEEDS_REVIEW" },
        }));
      },
      updateReportField: (fieldId, patch) => {
        setState((s) => {
          if (!s.report) return s;
          return {
            ...s,
            report: {
              ...s.report,
              fields: s.report.fields.map((f) =>
                f.id === fieldId ? { ...f, ...patch } : f,
              ),
            },
          };
        });
      },
      setReportBringFlag: (value) => {
        setState((s) =>
          s.report ? { ...s, report: { ...s.report, addToBringList: value } } : s,
        );
      },
      acceptSuggestion: (suggestionId) => {
        setState((s) => {
          if (!s.report?.suggestedNext) return s;
          const hit = s.report.suggestedNext.find((x) => x.id === suggestionId);
          if (!hit || hit.accepted) return s;
          const suggestedNext = s.report.suggestedNext.map((item) =>
            item.id === suggestionId ? { ...item, accepted: true } : item,
          );
          let nextActions = s.nextActions;
          let reminders = s.reminders;
          if (
            hit.kind === "REMINDER" &&
            !alreadyBooked(suggestionTopic(hit.title), s)
          ) {
            const remTitle =
              hit.title.match(/「([^」]+)」/)?.[1] ||
              hit.title.replace(/^添加/, "").replace(/提醒.*/, "").trim() ||
              hit.title;
            reminders = [
              {
                id: uid("rm"),
                title: remTitle,
                type: "PRENATAL_CHECK",
                scheduledAt: "2026-08-15T09:00:00+08:00",
                status: "PENDING",
                notes: hit.detail,
              },
              ...reminders,
            ];
            if (!nextActions.some((n) => n.title.includes(remTitle))) {
              nextActions = [
                {
                  id: uid("na"),
                  title: remTitle,
                  detail: hit.detail,
                  dueLabel: "已加入提醒",
                  source: "REPORT",
                  primaryCta: "REMINDER",
                  status: "PENDING",
                },
                ...nextActions,
              ];
            }
          }
          if (
            (hit.kind === "NOTE" || hit.kind === "MEDICATION") &&
            !nextActions.some((n) => n.title === hit.title)
          ) {
            nextActions = [
              {
                id: uid("na"),
                title: hit.title,
                detail: hit.detail,
                source: "REPORT",
                status: "PENDING",
              },
              ...nextActions,
            ];
          }
          return {
            ...s,
            reminders,
            nextActions,
            report: { ...s.report, suggestedNext },
          };
        });
      },
      acceptAllSuggestions: () => {
        setState((s) => {
          if (!s.report?.suggestedNext) return s;
          let nextActions = [...s.nextActions];
          let reminders = [...s.reminders];
          const suggestedNext = s.report.suggestedNext.map((item) => {
            if (item.accepted) return item;
            if (
              item.kind === "REMINDER" &&
              !alreadyBooked(suggestionTopic(item.title), {
                ...s,
                reminders,
                nextActions,
              })
            ) {
              const remTitle =
                item.title.match(/「([^」]+)」/)?.[1] ||
                item.title.replace(/^添加/, "").replace(/提醒.*/, "").trim() ||
                item.title;
              reminders = [
                {
                  id: uid("rm"),
                  title: remTitle,
                  type: "PRENATAL_CHECK",
                  scheduledAt: "2026-08-15T09:00:00+08:00",
                  status: "PENDING" as const,
                  notes: item.detail,
                },
                ...reminders,
              ];
              if (!nextActions.some((n) => n.title.includes(remTitle))) {
                nextActions = [
                  {
                    id: uid("na"),
                    title: remTitle,
                    detail: item.detail,
                    dueLabel: "已加入提醒",
                    source: "REPORT" as const,
                    primaryCta: "REMINDER" as const,
                    status: "PENDING" as const,
                  },
                  ...nextActions,
                ];
              }
            }
            if (
              (item.kind === "NOTE" || item.kind === "MEDICATION") &&
              !nextActions.some((n) => n.title === item.title)
            ) {
              nextActions = [
                {
                  id: uid("na"),
                  title: item.title,
                  detail: item.detail,
                  source: "REPORT" as const,
                  status: "PENDING" as const,
                },
                ...nextActions,
              ];
            }
            return { ...item, accepted: true };
          });
          return {
            ...s,
            reminders,
            nextActions,
            report: { ...s.report, suggestedNext },
          };
        });
      },
      confirmReport: () => {
        const eventId = uid("evt");
        let committed = false;
        setState((s) => {
          if (!s.report || s.role === "VIEWER") return s;
          committed = true;
          const metrics = s.report.fields
            .filter((f) => f.value)
            .map((f) => ({
              label: f.label,
              value: f.value,
              unit: f.unit,
            }));
          const aboutFetus =
            s.report.subject === "MOTHER" &&
            (s.report.category === "IMAGING" ||
              metrics.some((m) =>
                /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT/.test(m.label),
              ));
          const evt: TimelineEvent = {
            id: eventId,
            title: s.report.title,
            type: "MEDICAL_REPORT",
            stage: s.report.subject === "BABY" ? "BABY_0_1" : "PREGNANCY",
            occurredAt: `${s.report.reportDate || "2026-07-18"}T10:00:00+08:00`,
            subject: s.report.subject,
            aboutFetus,
            metrics,
            source: "REPORT_IMPORT",
            institution: s.report.institution,
            notes: s.report.conclusion,
            contextLabel: s.report.subject === "BABY" ? "宝宝" : aboutFetus ? "胎儿·孕期" : "妈妈",
            reportId: s.report.id,
            plainReadingItems: s.report.plainReadingItems,
            fields: s.report.fields,
          };
          const synced = s.report.fields.filter((f) => f.syncToHealth);
          const motherHealth = [...s.motherHealth];
          const babyHealth = [...s.babyHealth];
          synced.forEach((f) => {
            const point = {
              id: uid("hp"),
              label: f.label,
              value: f.value,
              unit: f.unit,
              recordedAt: s.report!.reportDate || formatToday(),
              source: "已确认报告",
            };
            if (s.report!.subject === "BABY") babyHealth.unshift(point);
            else motherHealth.unshift(point);
          });

          const accepted = (s.report.suggestedNext || []).filter((x) => x.accepted);
          let nextActions = [...s.nextActions];
          let bringList = [...s.bringList];
          accepted.forEach((sug: AiNextSuggestion) => {
            if (sug.kind === "BRING" || s.report!.addToBringList) {
              // handled below
            } else if (!nextActions.some((n) => n.title === sug.title)) {
              nextActions.unshift({
                id: uid("na"),
                title: sug.title,
                detail: sug.detail,
                source: "REPORT",
                status: "PENDING",
              });
            }
          });
          if (s.report.addToBringList) {
            bringList = [
              {
                id: uid("br"),
                title: s.report.title,
                checked: true,
                fromReportId: s.report.id,
              },
              ...bringList.filter((b) => b.fromReportId !== s.report!.id),
            ];
          }

          return {
            ...s,
            events: [evt, ...s.events],
            motherHealth,
            babyHealth,
            nextActions,
            bringList,
            lastVisit: {
              date: s.report.reportDate || formatToday(),
              title: s.report.title,
              conclusion: s.report.conclusion || s.report.plainReading,
              doctorNote: accepted.find((a) => a.kind === "NOTE")?.title,
            },
            report: { ...s.report, status: "CONFIRMED", eventId },
          };
        });
        return committed ? eventId : undefined;
      },
      addMotherHealth: (label, value, unit) => {
        const id = uid("mh");
        setState((s) => {
          const fetal = /胎心|双顶径|头围|腹围|股骨|头臀|估计体重|NT|羊水|宫高|胎动|胎方位/.test(
            label,
          );
          const home = /体重|血压|胎心/.test(label);
          return {
            ...s,
            motherHealth: [
              {
                id,
                label,
                value,
                unit,
                recordedAt: formatToday(),
                source: home ? "居家监测" : "手动记录",
              },
              ...s.motherHealth,
            ],
            events: [
              {
                id: uid("evt"),
                title: `${label} ${value}${unit ? ` ${unit}` : ""}`,
                type: fetal ? "PRENATAL_CHECK" : "OTHER",
                stage: s.scenario === "BORN" && !fetal ? "POSTPARTUM" : "PREGNANCY",
                occurredAt: `${formatToday()}T08:00:00+08:00`,
                subject: "MOTHER",
                aboutFetus: fetal,
                metrics: [{ label, value, unit }],
                source: "HEALTH_RECORD",
                contextLabel: fetal ? "胎儿·孕期" : s.scenario === "BORN" ? "产后" : "孕期",
              },
              ...s.events,
            ],
          };
        });
      },
      addBabyHealth: (label, value, unit) => {
        setState((s) => ({
          ...s,
          babyHealth: [
            {
              id: uid("bh"),
              label,
              value,
              unit,
              recordedAt: formatToday(),
              source: "手动记录",
            },
            ...s.babyHealth,
          ],
          events: [
            {
              id: uid("evt"),
              title: `宝宝${label} ${value}${unit ? ` ${unit}` : ""}`,
              type: "BABY_CHECKUP",
              stage: "BABY_0_1",
              occurredAt: `${formatToday()}T08:00:00+08:00`,
              subject: "BABY",
              source: "HEALTH_RECORD",
              contextLabel: "宝宝",
            },
            ...s.events,
          ],
        }));
      },
      addVaccine: (name, date, dose) => {
        setState((s) => ({
          ...s,
          vaccines: [{ id: uid("v"), name, date, dose }, ...s.vaccines],
          events: [
            {
              id: uid("evt"),
              title: `${name}${dose ? ` 第 ${dose} 剂` : ""}`,
              type: "VACCINATION",
              stage: "BABY_0_1",
              occurredAt: `${date}T10:00:00+08:00`,
              subject: "BABY",
              source: "MANUAL",
              contextLabel: "宝宝",
            },
            ...s.events,
          ],
        }));
      },
      addReminder: (title, type, scheduledAt, notes, calendarSync) => {
        setState((s) => ({
          ...s,
          reminders: [
            {
              id: uid("rm"),
              title,
              type,
              scheduledAt,
              status: "PENDING",
              notes,
              calendarSync,
            },
            ...s.reminders,
          ],
          nextActions: [
            {
              id: uid("na"),
              title,
              detail: notes,
              dueLabel: formatDate(scheduledAt),
              source: "REMINDER",
              status: "PENDING",
            },
            ...s.nextActions,
          ],
        }));
      },
      completeReminder: (id) => {
        setState((s) => ({
          ...s,
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, status: "COMPLETED" } : r,
          ),
        }));
      },
      cancelReminder: (id) => {
        setState((s) => ({
          ...s,
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, status: "CANCELLED" } : r,
          ),
        }));
      },
      completeNextAction: (id) => {
        setState((s) => ({
          ...s,
          nextActions: s.nextActions.map((n) =>
            n.id === id ? { ...n, status: "DONE" } : n,
          ),
        }));
      },
      toggleBringItem: (id) => {
        setState((s) => ({
          ...s,
          bringList: s.bringList.map((b) =>
            b.id === id ? { ...b, checked: !b.checked } : b,
          ),
        }));
      },
      addDoctorNote: (note) => {
        const id = uid("evt");
        setState((s) => ({
          ...s,
          events: [
            {
              id,
              title: "医生叮嘱",
              type: "DOCTOR_NOTE",
              stage: s.scenario === "BORN" ? "POSTPARTUM" : "PREGNANCY",
              occurredAt: `${formatToday()}T12:00:00+08:00`,
              subject: "MOTHER",
              notes: note,
              source: "MANUAL",
              contextLabel: "医嘱",
            },
            ...s.events,
          ],
          nextActions: [
            {
              id: uid("na"),
              title: "跟进医嘱",
              detail: note,
              source: "DOCTOR_NOTE",
              status: "PENDING",
            },
            ...s.nextActions,
          ],
          lastVisit: {
            date: formatToday(),
            title: "医生叮嘱",
            doctorNote: note,
            conclusion: s.lastVisit?.conclusion,
            medication: s.lastVisit?.medication,
          },
        }));
      },
      addMedicationNote: (note) => {
        setState((s) => ({
          ...s,
          events: [
            {
              id: uid("evt"),
              title: "用药记录",
              type: "MEDICATION",
              stage: s.scenario === "BORN" ? "POSTPARTUM" : "PREGNANCY",
              occurredAt: `${formatToday()}T12:00:00+08:00`,
              subject: "MOTHER",
              notes: note,
              source: "MANUAL",
              contextLabel: "用药",
            },
            ...s.events,
          ],
          nextActions: [
            {
              id: uid("na"),
              title: "按医嘱用药",
              detail: note,
              source: "DOCTOR_NOTE",
              status: "PENDING",
            },
            ...s.nextActions,
          ],
          lastVisit: {
            date: formatToday(),
            title: s.lastVisit?.title || "就诊记录",
            doctorNote: s.lastVisit?.doctorNote,
            medication: note,
            conclusion: s.lastVisit?.conclusion,
          },
        }));
      },
      createInvite: (relation, role) => {
        const code = `YAJI-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        setState((s) => ({
          ...s,
          inviteCode: code,
          members: [
            ...s.members,
            {
              id: uid("m"),
              name: "待加入成员",
              relation,
              role,
            },
          ],
        }));
        return code;
      },
      removeMember: (id) => {
        setState((s) => ({
          ...s,
          members: s.members.filter((m) => m.id !== id || m.isMe),
        }));
      },
      startImportBatch: () => {
        setState((s) => ({ ...s, importBatch: createImportBatchItems() }));
      },
      confirmImportItem: (id) => {
        setState((s) => {
          if (!s.importBatch) return s;
          const importBatch = s.importBatch.map((item) =>
            item.id === id ? { ...item, confirmed: true } : item,
          );
          const hit = importBatch.find((x) => x.id === id);
          if (!hit) return { ...s, importBatch };
          const already = s.events.some((e) => e.id === `evt-${id}`);
          return {
            ...s,
            importBatch,
            events: already
              ? s.events
              : [
                  {
                    id: `evt-${id}`,
                    title: hit.title,
                    type: "MEDICAL_REPORT" as const,
                    stage:
                      s.scenario === "PLANNING"
                        ? ("PRECONCEPTION" as const)
                        : ("PREGNANCY" as const),
                    occurredAt: `${hit.date}T10:00:00+08:00`,
                    subject: "MOTHER" as const,
                    source: "REPORT_IMPORT" as const,
                    institution: hit.institution,
                    contextLabel: "批量导入",
                  },
                  ...s.events,
                ],
          };
        });
      },
      abandonImportBatch: () => {
        setState((s) => ({ ...s, importBatch: undefined }));
      },
      startVisitRecording: () => {
        setState((s) => ({
          ...s,
          visitRecording: {
            ...createVisitRecordingDraft(),
            status: "RECORDING",
            durationSec: 0,
          },
        }));
      },
      tickRecording: () => {
        setState((s) =>
          s.visitRecording?.status === "RECORDING"
            ? {
                ...s,
                visitRecording: {
                  ...s.visitRecording,
                  durationSec: s.visitRecording.durationSec + 1,
                },
              }
            : s,
        );
      },
      finishRecording: () => {
        setState((s) => {
          if (!s.visitRecording) return s;
          return {
            ...s,
            visitRecording: {
              ...s.visitRecording,
              status: "TRANSCRIBING",
              durationSec: Math.max(s.visitRecording.durationSec, 42),
            },
          };
        });
        setTimeout(() => {
          setState((s) =>
            s.visitRecording
              ? {
                  ...s,
                  visitRecording: { ...s.visitRecording, status: "NEEDS_REVIEW" },
                }
              : s,
          );
        }, 900);
      },
      confirmVisitRecording: () => {
        setState((s) => {
          if (!s.visitRecording || !canWrite) return s;
          const vr = s.visitRecording;
          const noteText = vr.doctorNotes.join("；");
          return {
            ...s,
            visitRecording: { ...vr, status: "CONFIRMED" },
            events: [
              {
                id: uid("evt"),
                title: "就诊录音",
                type: "VISIT_RECORDING",
                stage: s.scenario === "BORN" ? "POSTPARTUM" : "PREGNANCY",
                occurredAt: `${formatToday()}T11:00:00+08:00`,
                subject: "MOTHER",
                notes: noteText,
                source: "MANUAL",
                contextLabel: "录音",
              },
              ...s.events,
            ],
            nextActions: [
              ...vr.nextVisit.map((t) => ({
                id: uid("na"),
                title: t,
                detail: "来自就诊录音抽取",
                source: "DOCTOR_NOTE" as const,
                status: "PENDING" as const,
              })),
              ...s.nextActions,
            ],
            lastVisit: {
              date: formatToday(),
              title: "就诊录音",
              doctorNote: noteText,
              medication: vr.medications.join("、"),
              conclusion: s.lastVisit?.conclusion,
            },
          };
        });
      },
      generateStageSummary: (rangeLabel = "近 3 个月") => {
        setState((s) => {
          const summary = buildStageSummary(s);
          return { ...s, stageSummary: { ...summary, rangeLabel } };
        });
      },
      adoptOpenFollowUp: (id) => {
        setState((s) => {
          const item = s.stageSummary?.openFollowUps.find((x) => x.id === id);
          if (!item) return s;
          return {
            ...s,
            reminders: [
              {
                id: uid("rm"),
                title: "复查血常规",
                type: "LAB",
                scheduledAt: "2026-08-20T09:00:00+08:00",
                status: "PENDING",
                notes: item.text,
              },
              ...s.reminders,
            ],
            nextActions: [
              {
                id: uid("na"),
                title: "复查血常规",
                detail: item.text,
                dueLabel: "已设提醒",
                source: "REPORT",
                status: "PENDING",
              },
              ...s.nextActions,
            ],
          };
        });
      },
    };
  }, [state]);

  return (
    <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be used within PrototypeProvider");
  return ctx;
}

function formatToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
