export const FamilyRelation = {
  MOTHER: "MOTHER",
  FATHER: "FATHER",
  GRANDPARENT: "GRANDPARENT",
  CAREGIVER: "CAREGIVER",
  OTHER: "OTHER",
} as const;
export type FamilyRelation = (typeof FamilyRelation)[keyof typeof FamilyRelation];

export const MemberRole = {
  OWNER: "OWNER",
  EDITOR: "EDITOR",
  VIEWER: "VIEWER",
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

/** 邀请界面仅暴露可查看 / 可编辑，映射 VIEWER / EDITOR */
export const InviteFacingRole = {
  VIEWER: "VIEWER",
  EDITOR: "EDITOR",
} as const;
export type InviteFacingRole = (typeof InviteFacingRole)[keyof typeof InviteFacingRole];

export const PregnancyStatus = {
  PLANNING: "PLANNING",
  PREGNANT: "PREGNANT",
  DELIVERED: "DELIVERED",
  CLOSED: "CLOSED",
} as const;
export type PregnancyStatus = (typeof PregnancyStatus)[keyof typeof PregnancyStatus];

export const EventStage = {
  PRECONCEPTION: "PRECONCEPTION",
  PREGNANCY: "PREGNANCY",
  DELIVERY: "DELIVERY",
  POSTPARTUM: "POSTPARTUM",
  BABY_0_1: "BABY_0_1",
  FAMILY: "FAMILY",
} as const;
export type EventStage = (typeof EventStage)[keyof typeof EventStage];

export const EventType = {
  PRENATAL_CHECK: "PRENATAL_CHECK",
  MEDICAL_REPORT: "MEDICAL_REPORT",
  SYMPTOM: "SYMPTOM",
  MEDICATION: "MEDICATION",
  DOCTOR_NOTE: "DOCTOR_NOTE",
  VISIT_RECORDING: "VISIT_RECORDING",
  DELIVERY: "DELIVERY",
  POSTPARTUM_CHECK: "POSTPARTUM_CHECK",
  BABY_CHECKUP: "BABY_CHECKUP",
  NEWBORN_SCREENING: "NEWBORN_SCREENING",
  VACCINATION: "VACCINATION",
  ILLNESS_VISIT: "ILLNESS_VISIT",
  MILESTONE: "MILESTONE",
  OTHER: "OTHER",
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const EventSource = {
  MANUAL: "MANUAL",
  REPORT_IMPORT: "REPORT_IMPORT",
  BULK_IMPORT: "BULK_IMPORT",
  VOICE_IMPORT: "VOICE_IMPORT",
  HEALTH_RECORD: "HEALTH_RECORD",
  SYSTEM: "SYSTEM",
} as const;
export type EventSource = (typeof EventSource)[keyof typeof EventSource];

export const ReportStatus = {
  UPLOADING: "UPLOADING",
  UPLOADED: "UPLOADED",
  PROCESSING: "PROCESSING",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ReportCategory = {
  IMAGING: "IMAGING",
  LAB: "LAB",
  PRENATAL_SPECIAL: "PRENATAL_SPECIAL",
  OUTPATIENT_RECORD: "OUTPATIENT_RECORD",
  PRESCRIPTION: "PRESCRIPTION",
  INPATIENT_DISCHARGE: "INPATIENT_DISCHARGE",
  DELIVERY: "DELIVERY",
  POSTPARTUM_CHECK: "POSTPARTUM_CHECK",
  NEWBORN_SCREENING: "NEWBORN_SCREENING",
  CHILD_CHECKUP: "CHILD_CHECKUP",
  VACCINATION: "VACCINATION",
  OTHER: "OTHER",
} as const;
export type ReportCategory = (typeof ReportCategory)[keyof typeof ReportCategory];

export const ImportBatchStatus = {
  IN_PROGRESS: "IN_PROGRESS",
  PARTIALLY_CONFIRMED: "PARTIALLY_CONFIRMED",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
} as const;
export type ImportBatchStatus = (typeof ImportBatchStatus)[keyof typeof ImportBatchStatus];

export const VisitRecordingStatus = {
  RECORDING: "RECORDING",
  UPLOADING: "UPLOADING",
  TRANSCRIBING: "TRANSCRIBING",
  EXTRACTING: "EXTRACTING",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
} as const;
export type VisitRecordingStatus =
  (typeof VisitRecordingStatus)[keyof typeof VisitRecordingStatus];

export const StageSummaryStatus = {
  GENERATING: "GENERATING",
  READY: "READY",
  STALE: "STALE",
  FAILED: "FAILED",
} as const;
export type StageSummaryStatus = (typeof StageSummaryStatus)[keyof typeof StageSummaryStatus];

export const MeasurementSource = {
  MANUAL: "MANUAL",
  REPORT_SYNC: "REPORT_SYNC",
  HOME_MONITOR: "HOME_MONITOR",
} as const;
export type MeasurementSource = (typeof MeasurementSource)[keyof typeof MeasurementSource];

export const KnowledgeCategory = {
  TERM: "TERM",
  CALENDAR_ITEM: "CALENDAR_ITEM",
  CHECKLIST_ITEM: "CHECKLIST_ITEM",
} as const;
export type KnowledgeCategory = (typeof KnowledgeCategory)[keyof typeof KnowledgeCategory];

export const ReminderType = {
  PRENATAL_CHECK: "PRENATAL_CHECK",
  POSTPARTUM_CHECK: "POSTPARTUM_CHECK",
  BABY_CHECKUP: "BABY_CHECKUP",
  MEDICATION: "MEDICATION",
  VACCINATION: "VACCINATION",
  OTHER: "OTHER",
} as const;
export type ReminderType = (typeof ReminderType)[keyof typeof ReminderType];

export const ReminderStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type ReminderStatus = (typeof ReminderStatus)[keyof typeof ReminderStatus];

export const OnboardingPhase = {
  PLANNING: "PLANNING",
  PREGNANCY: "PREGNANCY",
  BORN: "BORN",
} as const;
export type OnboardingPhase = (typeof OnboardingPhase)[keyof typeof OnboardingPhase];

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
  OTHER: "其他",
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  IMAGING: "影像/超声",
  LAB: "检验",
  PRENATAL_SPECIAL: "孕期专项检查",
  OUTPATIENT_RECORD: "门诊病历/诊断",
  PRESCRIPTION: "处方/用药",
  INPATIENT_DISCHARGE: "住院/出院",
  DELIVERY: "分娩",
  POSTPARTUM_CHECK: "产后复查",
  NEWBORN_SCREENING: "新生儿筛查",
  CHILD_CHECKUP: "儿童体检",
  VACCINATION: "疫苗",
  OTHER: "其他",
};

export const RELATION_LABELS: Record<FamilyRelation, string> = {
  MOTHER: "妈妈",
  FATHER: "爸爸",
  GRANDPARENT: "祖父母",
  CAREGIVER: "照护者",
  OTHER: "其他",
};

export const ROLE_LABELS: Record<MemberRole, string> = {
  OWNER: "拥有者",
  EDITOR: "可编辑",
  VIEWER: "仅查看",
};

export const EVENT_STAGE_LABELS: Record<EventStage, string> = {
  PRECONCEPTION: "备孕",
  PREGNANCY: "孕期",
  DELIVERY: "分娩",
  POSTPARTUM: "产后",
  BABY_0_1: "宝宝 0–1 岁",
  FAMILY: "家庭",
};
