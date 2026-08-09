export type Relation = "MOTHER" | "FATHER" | "GRANDPARENT" | "CAREGIVER" | "OTHER";
export type Role = "OWNER" | "EDITOR" | "VIEWER";
export type Stage =
  | "PRECONCEPTION"
  | "PREGNANCY"
  | "DELIVERY"
  | "POSTPARTUM"
  | "BABY_0_1"
  | "FAMILY";
export type EventType =
  | "PRENATAL_CHECK"
  | "MEDICAL_REPORT"
  | "SYMPTOM"
  | "MEDICATION"
  | "DOCTOR_NOTE"
  | "VISIT_RECORDING"
  | "DELIVERY"
  | "POSTPARTUM_CHECK"
  | "BABY_CHECKUP"
  | "NEWBORN_SCREENING"
  | "VACCINATION"
  | "ILLNESS_VISIT"
  | "MILESTONE"
  | "OTHER";

export type ReportStatus =
  | "UPLOADING"
  | "UPLOADED"
  | "PROCESSING"
  | "NEEDS_REVIEW"
  | "CONFIRMED"
  | "FAILED";

export interface EventMetric {
  label: string;
  value: string;
  unit?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  type: EventType;
  stage: Stage;
  occurredAt: string;
  location?: string;
  notes?: string;
  subject: "MOTHER" | "BABY" | "FAMILY";
  /** 产检/超声中的胎儿发育指标；出生前归孕期档案，不单独建宝宝档案 */
  aboutFetus?: boolean;
  metrics?: EventMetric[];
  contextLabel?: string;
  source: "MANUAL" | "REPORT_IMPORT" | "HEALTH_RECORD" | "SYSTEM";
  institution?: string;
  reportId?: string;
  /** 归档后可回看的白话解读 */
  plainReadingItems?: PlainReadingItem[];
  /** 归档后可回看的原字段 */
  fields?: ReportField[];
}

export interface ReportField {
  id: string;
  label: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  sourceFlag?: string;
  confidence: number;
  fieldType: "KEY_VALUE" | "MEASUREMENT" | "TEXT";
  syncToHealth?: boolean;
}

export interface AiNextSuggestion {
  id: string;
  kind: "REMINDER" | "BRING" | "NOTE" | "MEDICATION";
  title: string;
  detail?: string;
  accepted?: boolean;
}

/** 分条白话解读，每条必须带出处 */
export interface PlainReadingItem {
  id: string;
  text: string;
  /** 如「报告原文 P1」或「参考：胎盘分级说明」 */
  citation: string;
}

export interface ReportDraft {
  id: string;
  status: ReportStatus;
  title: string;
  category: string;
  reportDate?: string;
  institution?: string;
  conclusion?: string;
  subject: "MOTHER" | "BABY";
  pages: Array<{ id: string; label: string; failed?: boolean }>;
  fields: ReportField[];
  rawText: string;
  eventId?: string;
  /** @deprecated 使用 plainReadingItems */
  plainReading?: string;
  plainReadingItems?: PlainReadingItem[];
  suggestedNext?: AiNextSuggestion[];
  addToBringList?: boolean;
}

export interface HealthPoint {
  id: string;
  label: string;
  value: string;
  unit?: string;
  recordedAt: string;
  source: string;
}

export type CalendarSyncStatus = "synced" | "local_only" | "denied";

export interface ReminderItem {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  /** 系统日历写入结果；web/无权限时为 local_only 或 denied，勿假称已同步 */
  calendarSync?: CalendarSyncStatus;
}

export type NextActionCta = "DETAIL" | "BRING" | "REMINDER" | "COMPLETE";

export interface NextActionItem {
  id: string;
  title: string;
  detail?: string;
  dueLabel?: string;
  source: "REMINDER" | "DOCTOR_NOTE" | "REPORT" | "SYSTEM" | "CALENDAR";
  /** 标准日历参考日程 */
  isReferenceSchedule?: boolean;
  status: "PENDING" | "DONE";
  /** 此刻列表主按钮；未设时按来源推断 */
  primaryCta?: NextActionCta;
  /** 主 CTA 为 DETAIL 时跳转的事件 */
  linkedEventId?: string;
  /** 1–2 句白话「为什么常会安排这件事」，帮用户理解而非催促 */
  why?: string;
  /** 简短边界提示；未设时 UI 使用全局免责句 */
  whyNote?: string;
}

export interface BringItem {
  id: string;
  title: string;
  checked: boolean;
  fromReportId?: string;
}

export interface LastVisitSummary {
  date: string;
  title: string;
  doctorNote?: string;
  medication?: string;
  conclusion?: string;
}

export interface MemberItem {
  id: string;
  name: string;
  relation: Relation;
  role: Role;
  isMe?: boolean;
}

export type OnboardingPhase = "NONE" | "IN_PROGRESS" | "DONE";
export type DemoUiState = "ready" | "loading" | "empty" | "error" | "forbidden";
export type Scenario = "PLANNING" | "PREGNANCY" | "BORN";

export interface ImportBatchItem {
  id: string;
  title: string;
  date: string;
  institution: string;
  category: string;
  confirmed: boolean;
}

export interface VisitRecordingDraft {
  id: string;
  status: "IDLE" | "RECORDING" | "TRANSCRIBING" | "NEEDS_REVIEW" | "CONFIRMED";
  durationSec: number;
  transcript: string;
  doctorNotes: string[];
  medications: string[];
  nextVisit: string[];
}

export interface StageSummaryData {
  rangeLabel: string;
  timeline: Array<{ date: string; title: string; place?: string }>;
  metrics: Array<{ label: string; values: string }>;
  conclusions: Array<{ quote: string; source: string }>;
  notes: string[];
  openFollowUps: Array<{ id: string; text: string }>;
  repeated: Array<{ label: string; count: number; detail: string }>;
  simplified: string;
}

export interface PrototypeState {
  authed: boolean;
  onboarding: OnboardingPhase;
  scenario: Scenario;
  familyName: string;
  motherName: string;
  relationToMother: Relation;
  role: Role;
  dueDate?: string;
  lmpDate?: string;
  babyName?: string;
  babyBirthDate?: string;
  events: TimelineEvent[];
  report?: ReportDraft;
  motherHealth: HealthPoint[];
  babyHealth: HealthPoint[];
  vaccines: Array<{ id: string; name: string; date: string; dose?: number }>;
  reminders: ReminderItem[];
  nextActions: NextActionItem[];
  bringList: BringItem[];
  lastVisit?: LastVisitSummary;
  members: MemberItem[];
  inviteCode?: string;
  uiState: DemoUiState;
  importBatch?: ImportBatchItem[];
  visitRecording?: VisitRecordingDraft;
  stageSummary?: StageSummaryData;
}
