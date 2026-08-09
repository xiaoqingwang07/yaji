import type {
  ImportBatchItem,
  PrototypeState,
  StageSummaryData,
  VisitRecordingDraft,
} from "./types";

export function createInitialState(): PrototypeState {
  return {
    authed: false,
    onboarding: "NONE",
    scenario: "PREGNANCY",
    familyName: "芽纪示范家庭",
    motherName: "小芽",
    relationToMother: "MOTHER",
    role: "OWNER",
    dueDate: "2026-11-25",
    lmpDate: "2026-02-18",
    babyName: "豆豆",
    babyBirthDate: "2026-05-20",
    events: [],
    motherHealth: [],
    babyHealth: [],
    vaccines: [],
    reminders: [],
    nextActions: [],
    bringList: [],
    members: [],
    uiState: "ready",
  };
}

export function seedPregnancyScenario(base: PrototypeState): PrototypeState {
  return {
    ...base,
    scenario: "PREGNANCY",
    onboarding: "DONE",
    familyName: base.familyName || "我家的芽纪",
    motherName: base.motherName || "小芽",
    relationToMother: base.relationToMother || "MOTHER",
    dueDate: base.dueDate || "2026-11-25",
    lmpDate: base.lmpDate || "2026-02-18",
    events: [
      {
        id: "evt-us-22",
        title: "产科超声（孕中期）",
        type: "MEDICAL_REPORT",
        stage: "PREGNANCY",
        occurredAt: "2026-07-22T10:30:00+08:00",
        location: "示例市妇幼保健院",
        notes: "单胎头位，胎盘后壁 II 级，生长发育与孕周大致相符。",
        subject: "MOTHER",
        aboutFetus: true,
        source: "REPORT_IMPORT",
        contextLabel: "孕 22+1 周",
        institution: "示例市妇幼保健院",
        reportId: "rpt-us",
        metrics: [
          { label: "胎心", value: "146", unit: "次/分" },
          { label: "双顶径 BPD", value: "54", unit: "mm" },
          { label: "头围 HC", value: "198", unit: "mm" },
          { label: "腹围 AC", value: "172", unit: "mm" },
          { label: "股骨长 FL", value: "38", unit: "mm" },
          { label: "估计体重", value: "480", unit: "g" },
          { label: "胎盘分级", value: "II 级" },
        ],
        plainReadingItems: [
          {
            id: "pr-1",
            text: "报告结论写的是：单胎、头位，胎儿生长发育与孕周大致相符。",
            citation: "报告原文 P1",
          },
          {
            id: "pr-2",
            text: "「胎盘 II 级」是超声对胎盘成熟度的分级写法，常见于孕中期报告中的描述性用语，不等于病情诊断。",
            citation: "参考：胎盘分级说明",
          },
          {
            id: "pr-3",
            text: "本报告列出胎心 146 次/分、双顶径 54 mm 等测量值。",
            citation: "报告原文 P1",
          },
        ],
        fields: [
          { id: "f-fh", label: "胎心", value: "146", unit: "次/分", confidence: 0.96, fieldType: "MEASUREMENT" },
          { id: "f-bpd", label: "双顶径 BPD", value: "54", unit: "mm", confidence: 0.94, fieldType: "MEASUREMENT" },
          { id: "f-pl", label: "胎盘分级", value: "II 级", confidence: 0.91, fieldType: "KEY_VALUE" },
        ],
      },
      {
        id: "evt-prenatal-22",
        title: "孕 22 周产检",
        type: "PRENATAL_CHECK",
        stage: "PREGNANCY",
        occurredAt: "2026-07-22T09:00:00+08:00",
        location: "示例市妇幼保健院",
        notes: "宫高腹围正常，胎动好。",
        subject: "MOTHER",
        aboutFetus: true,
        source: "MANUAL",
        contextLabel: "孕 22+1 周",
        institution: "示例市妇幼保健院",
        metrics: [
          { label: "胎心", value: "144", unit: "次/分" },
          { label: "宫高", value: "21", unit: "cm" },
          { label: "腹围", value: "82", unit: "cm" },
        ],
      },
      {
        id: "evt-weight",
        title: "体重记录 58.2 kg",
        type: "OTHER",
        stage: "PREGNANCY",
        occurredAt: "2026-08-06T08:00:00+08:00",
        subject: "MOTHER",
        source: "HEALTH_RECORD",
        contextLabel: "孕 24+1 周",
        metrics: [{ label: "体重", value: "58.2", unit: "kg" }],
      },
      {
        id: "evt-bp",
        title: "血压记录 110/70",
        type: "OTHER",
        stage: "PREGNANCY",
        occurredAt: "2026-08-06T08:05:00+08:00",
        subject: "MOTHER",
        source: "HEALTH_RECORD",
        contextLabel: "孕 24+1 周",
        metrics: [{ label: "血压", value: "110/70", unit: "mmHg" }],
      },
      {
        id: "evt-lab",
        title: "血常规检验",
        type: "MEDICAL_REPORT",
        stage: "PREGNANCY",
        occurredAt: "2026-06-03T11:00:00+08:00",
        location: "示例社区卫生服务中心",
        notes: "报告建议两周后复查血常规（档案中未见后续记录）。",
        subject: "MOTHER",
        source: "REPORT_IMPORT",
        contextLabel: "孕 15+0 周",
        institution: "示例社区卫生服务中心",
        metrics: [{ label: "血红蛋白", value: "112", unit: "g/L" }],
      },
      {
        id: "evt-nt",
        title: "NT 超声检查",
        type: "MEDICAL_REPORT",
        stage: "PREGNANCY",
        occurredAt: "2026-05-10T11:20:00+08:00",
        location: "示例市妇幼保健院",
        notes: "NT 厚度在参考范围内（脱敏示范）。",
        subject: "MOTHER",
        aboutFetus: true,
        source: "REPORT_IMPORT",
        contextLabel: "孕 12+0 周",
        institution: "示例市妇幼保健院",
        metrics: [
          { label: "胎心", value: "162", unit: "次/分" },
          { label: "头臀长 CRL", value: "58", unit: "mm" },
          { label: "NT", value: "1.4", unit: "mm" },
        ],
      },
      {
        id: "evt-system",
        title: "建立孕育档案",
        type: "OTHER",
        stage: "FAMILY",
        occurredAt: "2026-03-01T09:00:00+08:00",
        subject: "FAMILY",
        source: "SYSTEM",
        contextLabel: "家庭",
      },
    ],
    motherHealth: [
      {
        id: "mh-fh-1",
        label: "胎心",
        value: "146",
        unit: "次/分",
        recordedAt: "2026-07-22",
        source: "已确认超声",
      },
      {
        id: "mh-fh-0",
        label: "胎心",
        value: "144",
        unit: "次/分",
        recordedAt: "2026-07-22",
        source: "产检记录",
      },
      {
        id: "mh-fh-nt",
        label: "胎心",
        value: "162",
        unit: "次/分",
        recordedAt: "2026-05-10",
        source: "已确认超声",
      },
      {
        id: "mh-bpd-1",
        label: "双顶径 BPD",
        value: "54",
        unit: "mm",
        recordedAt: "2026-07-22",
        source: "已确认超声",
      },
      {
        id: "mh-1",
        label: "体重",
        value: "58.2",
        unit: "kg",
        recordedAt: "2026-08-06",
        source: "居家监测",
      },
      {
        id: "mh-1b",
        label: "体重",
        value: "57.5",
        unit: "kg",
        recordedAt: "2026-07-20",
        source: "居家监测",
      },
      {
        id: "mh-1c",
        label: "体重",
        value: "56.8",
        unit: "kg",
        recordedAt: "2026-06-18",
        source: "居家监测",
      },
      {
        id: "mh-2",
        label: "血压",
        value: "110/70",
        unit: "mmHg",
        recordedAt: "2026-08-06",
        source: "居家监测",
      },
      {
        id: "mh-2b",
        label: "血压",
        value: "108/68",
        unit: "mmHg",
        recordedAt: "2026-07-15",
        source: "居家监测",
      },
      {
        id: "mh-2c",
        label: "血压",
        value: "112/72",
        unit: "mmHg",
        recordedAt: "2026-06-10",
        source: "居家监测",
      },
    ],
    babyHealth: [],
    vaccines: [],
    reminders: [
      {
        id: "rm-1",
        title: "大排畸超声",
        type: "PRENATAL_CHECK",
        scheduledAt: "2026-09-15T09:00:00+08:00",
        status: "PENDING",
        notes: "已预约，携带既往超声与医保卡",
      },
    ],
    nextActions: [
      {
        id: "na-cal-1",
        title: "孕 24–28 周：糖耐量筛查",
        detail: "参考日程，以医生安排为准",
        dueLabel: "本阶段",
        source: "CALENDAR",
        isReferenceSchedule: true,
        primaryCta: "REMINDER",
        status: "PENDING",
        why: "糖耐量筛查（OGTT）是孕中期常见的血糖代谢检查，多安排在 24–28 周，方便医生结合整体产检了解妈妈的身体状况。",
        whyNote: "常见安排的档案说明，具体以医生安排为准。",
      },
      {
        id: "na-1",
        title: "大排畸超声",
        detail: "已预约 · 携带既往超声与医保卡",
        dueLabel: "9 月 15 日",
        source: "REMINDER",
        primaryCta: "BRING",
        status: "PENDING",
        why: "大排畸是孕中期常见的系统性胎儿结构超声，通常安排在 20–24 周左右，用来把宝宝主要器官的发育情况记进档案。",
        whyNote: "常见安排的档案说明，具体以医生安排为准。",
      },
      {
        id: "na-2",
        title: "复查血常规",
        detail: "6 月 3 日报告建议两周后复查，档案中未见记录",
        dueLabel: "待安排",
        source: "REPORT",
        primaryCta: "REMINDER",
        linkedEventId: "evt-lab",
        status: "PENDING",
        why: "6 月 3 日血常规报告写明建议两周后复查；档案里还没看到对应后续记录，可在下次就诊时请医生确认是否仍需补查。",
        whyNote: "仅汇总你档案中的报告建议，具体以医生安排为准。",
      },
    ],
    bringList: [
      { id: "br-1", title: "产科超声（孕中期）", checked: true, fromReportId: "rpt-us" },
      { id: "br-2", title: "NT 超声报告", checked: true },
      { id: "br-3", title: "医保卡 / 就诊卡", checked: false },
      { id: "br-4", title: "身份证", checked: false },
    ],
    lastVisit: {
      date: "2026-07-22",
      title: "孕 22 周产检 + 超声",
      doctorNote: "生长发育大致相符；按时做大排畸与糖耐。",
      medication: "",
      conclusion: "单胎头位，胎盘后壁 II 级。",
    },
    members: [
      {
        id: "m-1",
        name: "小芽",
        relation: "MOTHER",
        role: "OWNER",
        isMe: true,
      },
      {
        id: "m-2",
        name: "阿树",
        relation: "FATHER",
        role: "EDITOR",
      },
    ],
  };
}

export function seedBornScenario(base: PrototypeState): PrototypeState {
  return {
    ...base,
    scenario: "BORN",
    onboarding: "DONE",
    familyName: base.familyName || "我家的芽纪",
    motherName: base.motherName || "小芽",
    babyName: base.babyName || "豆豆",
    babyBirthDate: base.babyBirthDate || "2026-05-20",
    events: [
      {
        id: "evt-system",
        title: "建立孕育档案",
        type: "OTHER",
        stage: "FAMILY",
        occurredAt: "2026-05-21T09:00:00+08:00",
        subject: "FAMILY",
        source: "SYSTEM",
        contextLabel: "家庭",
      },
      {
        id: "evt-birth",
        title: "豆豆出生基线",
        type: "MILESTONE",
        stage: "BABY_0_1",
        occurredAt: "2026-05-20T08:20:00+08:00",
        subject: "BABY",
        source: "SYSTEM",
        contextLabel: "出生当日",
        notes: "出生体重 3200 g，身长 50 cm，头围 34 cm",
        metrics: [
          { label: "出生体重", value: "3200", unit: "g" },
          { label: "身长", value: "50", unit: "cm" },
          { label: "头围", value: "34", unit: "cm" },
        ],
      },
      {
        id: "evt-vaccine",
        title: "乙肝疫苗第 1 剂",
        type: "VACCINATION",
        stage: "BABY_0_1",
        occurredAt: "2026-05-20T12:00:00+08:00",
        subject: "BABY",
        source: "MANUAL",
        contextLabel: "出生当日",
        institution: "示例市第一人民医院",
      },
      {
        id: "evt-checkup",
        title: "满月体检",
        type: "BABY_CHECKUP",
        stage: "BABY_0_1",
        occurredAt: "2026-06-20T10:00:00+08:00",
        subject: "BABY",
        source: "MANUAL",
        contextLabel: "1 月龄",
        institution: "示例社区儿童保健科",
        metrics: [
          { label: "体重", value: "4.6", unit: "kg" },
          { label: "身长", value: "55", unit: "cm" },
          { label: "头围", value: "38", unit: "cm" },
        ],
      },
      {
        id: "evt-postpartum",
        title: "产后 42 天复查",
        type: "POSTPARTUM_CHECK",
        stage: "POSTPARTUM",
        occurredAt: "2026-07-01T14:00:00+08:00",
        subject: "MOTHER",
        source: "MANUAL",
        contextLabel: "产后 42 天",
      },
      {
        id: "evt-us-preg-hist",
        title: "孕晚期超声（历史）",
        type: "MEDICAL_REPORT",
        stage: "PREGNANCY",
        occurredAt: "2026-05-10T10:00:00+08:00",
        subject: "MOTHER",
        aboutFetus: true,
        source: "REPORT_IMPORT",
        contextLabel: "孕 37+0 周",
        institution: "示例市第一人民医院",
        notes: "分娩前最后一次超声，可与出生后宝宝档案对照查看。",
        metrics: [
          { label: "胎心", value: "140", unit: "次/分" },
          { label: "双顶径 BPD", value: "92", unit: "mm" },
          { label: "腹围 AC", value: "330", unit: "mm" },
          { label: "股骨长 FL", value: "72", unit: "mm" },
          { label: "估计体重", value: "3100", unit: "g" },
        ],
      },
    ],
    motherHealth: [
      {
        id: "mh-p1",
        label: "体重",
        value: "58.0",
        unit: "kg",
        recordedAt: "2026-07-01",
        source: "手动记录",
      },
    ],
    babyHealth: [
      {
        id: "bh-1",
        label: "体重",
        value: "4.6",
        unit: "kg",
        recordedAt: "2026-06-20",
        source: "手动记录",
      },
      {
        id: "bh-2",
        label: "身长",
        value: "55",
        unit: "cm",
        recordedAt: "2026-06-20",
        source: "手动记录",
      },
      {
        id: "bh-3",
        label: "头围",
        value: "38",
        unit: "cm",
        recordedAt: "2026-06-20",
        source: "手动记录",
      },
    ],
    vaccines: [
      { id: "v-1", name: "乙肝疫苗", date: "2026-05-20", dose: 1 },
      { id: "v-2", name: "卡介苗", date: "2026-05-20", dose: 1 },
    ],
    reminders: [
      {
        id: "rm-b1",
        title: "宝宝两月体检",
        type: "BABY_CHECKUP",
        scheduledAt: "2026-07-20T09:30:00+08:00",
        status: "PENDING",
      },
    ],
    nextActions: [
      {
        id: "na-b1",
        title: "宝宝两月体检",
        detail: "社区儿童保健",
        dueLabel: "7月20日",
        source: "REMINDER",
        status: "PENDING",
        why: "社区儿童保健常见会在满两个月安排体检，记录体重、身长、头围等，方便把成长曲线完整收进档案。",
        whyNote: "常见安排的档案说明，具体以医生安排为准。",
      },
      {
        id: "na-b2",
        title: "按疫苗本核对下一针",
        detail: "以接种记录与医生安排为准，系统不自动推断计划",
        source: "SYSTEM",
        status: "PENDING",
        why: "接种节奏以疫苗本和接种医生安排为准；芽纪只记录已完成的接种，不会替你推断下一针时间。",
        whyNote: "请以接种本与医生安排为准。",
      },
    ],
    bringList: [
      { id: "br-b1", title: "满月体检记录", checked: true },
      { id: "br-b2", title: "疫苗接种本", checked: true },
      { id: "br-b3", title: "出院/出生记录", checked: false },
    ],
    lastVisit: {
      date: "2026-06-20",
      title: "满月体检",
      doctorNote: "生长发育正常，按期打疫苗、满两月再检。",
      conclusion: "体重/身长/头围已记入档案。",
    },
    members: [
      {
        id: "m-1",
        name: "小芽",
        relation: "MOTHER",
        role: "OWNER",
        isMe: true,
      },
      {
        id: "m-2",
        name: "阿树",
        relation: "FATHER",
        role: "EDITOR",
      },
    ],
  };
}

export function createMockReport(kind: "ultrasound" | "lab" | "unknown" = "ultrasound") {
  if (kind === "lab") {
    return {
      id: "rpt-lab",
      status: "NEEDS_REVIEW" as const,
      title: "血常规检验报告",
      category: "LAB",
      reportDate: "2026-07-10",
      institution: "示例社区卫生服务中心",
      conclusion: "详见各项结果。",
      subject: "MOTHER" as const,
      pages: [{ id: "p1", label: "第 1 页" }],
      rawText: "血常规检验报告（脱敏样本）血红蛋白 112 g/L（参考 115-150，原报告标记：低）",
      plainReading:
        "这份是血常规。报告写明血红蛋白 112 g/L，对照本报告参考范围 115-150，并带有原报告「低」标记。白细胞等项目见字段列表。此处只转述报告原文，不判断病因或用药。",
      suggestedNext: [
        {
          id: "s1",
          kind: "NOTE" as const,
          title: "记下医生是否要求复查血常规",
          detail: "若病历/医嘱写了复查时间，可添加到下一步",
        },
        {
          id: "s2",
          kind: "BRING" as const,
          title: "建议下次就诊携带本报告",
        },
      ],
      addToBringList: true,
      fields: [
        {
          id: "f1",
          label: "血红蛋白",
          value: "112",
          unit: "g/L",
          referenceRange: "115-150",
          sourceFlag: "低",
          confidence: 0.96,
          fieldType: "MEASUREMENT" as const,
          syncToHealth: false,
        },
        {
          id: "f2",
          label: "白细胞",
          value: "8.1",
          unit: "10^9/L",
          confidence: 0.7,
          fieldType: "MEASUREMENT" as const,
          syncToHealth: false,
        },
      ],
    };
  }
  if (kind === "unknown") {
    return {
      id: "rpt-unknown",
      status: "NEEDS_REVIEW" as const,
      title: "通用医疗报告",
      category: "OTHER",
      reportDate: "2026-06-01",
      institution: "",
      conclusion: "",
      subject: "MOTHER" as const,
      pages: [{ id: "p1", label: "第 1 页" }],
      rawText: "部分文字无法可靠识别，请对照原图手动补录。",
      plainReading:
        "清晰度不足，只能识别到部分日期类信息。请对照原图补全医院、结论和关键项目后再确认归档。",
      suggestedNext: [
        {
          id: "s1",
          kind: "NOTE" as const,
          title: "对照原图手动补录关键字段",
        },
      ],
      addToBringList: false,
      fields: [
        {
          id: "f1",
          label: "日期",
          value: "2026-06-01",
          confidence: 0.6,
          fieldType: "KEY_VALUE" as const,
        },
      ],
    };
  }
  return {
    id: "rpt-us",
    status: "NEEDS_REVIEW" as const,
    title: "产科超声检查报告",
    category: "IMAGING",
    reportDate: "2026-07-22",
    institution: "示例市妇幼保健院",
    conclusion: "单胎，头位，胎儿生长发育与孕周大致相符。",
    subject: "MOTHER" as const,
    pages: [
      { id: "p1", label: "第 1 页" },
      { id: "p2", label: "第 2 页" },
    ],
    rawText:
      "产科超声检查报告（脱敏样本）。胎心 146 次/分；双顶径 54 mm；胎盘后壁，分级 II 级。结论：单胎头位，生长发育与孕周大致相符。",
    plainReading:
      "这是一份产科超声。报告写明单胎、头位，生长发育与孕周大致相符；并记录胎心、双顶径等测量值与胎盘 II 级。",
    plainReadingItems: [
      {
        id: "pr-1",
        text: "报告结论写的是：单胎、头位，胎儿生长发育与孕周大致相符。",
        citation: "报告原文 P1",
      },
      {
        id: "pr-2",
        text: "「胎盘 II 级」是超声对胎盘成熟度的分级写法，常见于孕中期报告中的描述性用语，不等于病情诊断。",
        citation: "参考：胎盘分级说明",
      },
      {
        id: "pr-3",
        text: "本报告列出胎心 146 次/分、双顶径 54 mm 等测量值，详见下方字段。",
        citation: "报告原文 P1",
      },
    ],
    suggestedNext: [
      {
        id: "s1",
        kind: "REMINDER" as const,
        title: "添加「大排畸」提醒（若尚未预约）",
        detail: "示范档案已有大排畸预约时，确认页会改为「核对携带」",
      },
      {
        id: "s2",
        kind: "BRING" as const,
        title: "建议下次就诊携带本超声报告",
      },
      {
        id: "s3",
        kind: "NOTE" as const,
        title: "若医生另有口头叮嘱，请单独记一条医嘱",
      },
    ],
    addToBringList: true,
    fields: [
      {
        id: "f-hr",
        label: "胎心",
        value: "146",
        unit: "次/分",
        confidence: 0.95,
        fieldType: "MEASUREMENT" as const,
        syncToHealth: true,
      },
      {
        id: "f1",
        label: "双顶径 BPD",
        value: "54",
        unit: "mm",
        confidence: 0.94,
        fieldType: "MEASUREMENT" as const,
        syncToHealth: true,
      },
      {
        id: "f-pl",
        label: "胎盘分级",
        value: "II 级",
        confidence: 0.91,
        fieldType: "KEY_VALUE" as const,
      },
      {
        id: "f2",
        label: "腹围 AC",
        value: "172",
        unit: "mm",
        confidence: 0.72,
        fieldType: "MEASUREMENT" as const,
        syncToHealth: true,
      },
      {
        id: "f-fl",
        label: "股骨长 FL",
        value: "38",
        unit: "mm",
        confidence: 0.94,
        fieldType: "MEASUREMENT" as const,
        syncToHealth: true,
      },
      {
        id: "f-ew",
        label: "估计体重",
        value: "480",
        unit: "g",
        confidence: 0.88,
        fieldType: "MEASUREMENT" as const,
        syncToHealth: true,
      },
    ],
  };
}

export function seedPlanningScenario(base: PrototypeState): PrototypeState {
  return {
    ...base,
    scenario: "PLANNING",
    onboarding: "DONE",
    familyName: base.familyName || "我家的芽纪",
    motherName: base.motherName || "小芽",
    dueDate: undefined,
    lmpDate: undefined,
    events: [
      {
        id: "evt-plan-lab",
        title: "备孕体检报告",
        type: "MEDICAL_REPORT",
        stage: "PRECONCEPTION",
        occurredAt: "2026-01-12T10:00:00+08:00",
        location: "示例市同济医院",
        notes: "备孕期归档示范（脱敏）。",
        subject: "MOTHER",
        source: "REPORT_IMPORT",
        contextLabel: "备孕",
        institution: "示例市同济医院",
      },
      {
        id: "evt-system",
        title: "建立孕育档案",
        type: "OTHER",
        stage: "FAMILY",
        occurredAt: "2026-01-10T09:00:00+08:00",
        subject: "FAMILY",
        source: "SYSTEM",
        contextLabel: "家庭",
      },
    ],
    motherHealth: [],
    babyHealth: [],
    vaccines: [],
    reminders: [],
    nextActions: [
      {
        id: "na-p1",
        title: "整理既往检查报告",
        detail: "可用批量导入一次收进来",
        source: "SYSTEM",
        status: "PENDING",
        why: "把备孕阶段的体检与检验报告收进档案后，以后见医生时能快速翻到完整历史，少翻一堆纸质材料。",
        whyNote: "整理档案用，不构成医学建议。",
      },
    ],
    bringList: [{ id: "br-p1", title: "既往体检报告", checked: false }],
    lastVisit: {
      date: "2026-01-12",
      title: "备孕体检",
      conclusion: "报告已归档（示范）。",
    },
    members: [
      { id: "m-1", name: "小芽", relation: "MOTHER", role: "OWNER", isMe: true },
      { id: "m-2", name: "阿树", relation: "FATHER", role: "EDITOR" },
    ],
  };
}

export function createImportBatchItems(): ImportBatchItem[] {
  return [
    {
      id: "ib-1",
      title: "血常规",
      date: "2026-06-03",
      institution: "示例社区卫生服务中心",
      category: "检验",
      confirmed: true,
    },
    {
      id: "ib-2",
      title: "NT 超声",
      date: "2026-05-10",
      institution: "示例市妇幼保健院",
      category: "超声",
      confirmed: true,
    },
    {
      id: "ib-3",
      title: "产科超声",
      date: "2026-07-22",
      institution: "示例市妇幼保健院",
      category: "超声",
      confirmed: true,
    },
    {
      id: "ib-4",
      title: "甲状腺功能",
      date: "2026-04-18",
      institution: "示例市同济医院",
      category: "检验",
      confirmed: false,
    },
    {
      id: "ib-5",
      title: "门诊病历页",
      date: "2026-07-22",
      institution: "示例市妇幼保健院",
      category: "病历",
      confirmed: false,
    },
    {
      id: "ib-6",
      title: "通用报告",
      date: "2026-03-02",
      institution: "待补",
      category: "其他",
      confirmed: false,
    },
  ];
}

export function createVisitRecordingDraft(): VisitRecordingDraft {
  return {
    id: "vr-1",
    status: "IDLE",
    durationSec: 0,
    transcript:
      "医生：这次胎心和生长看起来和孕周大致相符。下个月去做大排畸，记得带上次超声。铁剂按处方继续吃，两周后复查血常规。",
    doctorNotes: ["生长发育与孕周大致相符（医生口述）"],
    medications: ["铁剂按处方继续（以处方剂量为准）"],
    nextVisit: ["下个月大排畸", "两周后复查血常规"],
  };
}

/** 录音抽取结果去重：标题高度相似则保留一条 */
export function dedupeExtractLines(...groups: string[][]): string[] {
  const seen: string[] = [];
  const norm = (s: string) =>
    s
      .replace(/[（(].*?[）)]/g, "")
      .replace(/[：:·，,。\s]/g, "")
      .toLowerCase();
  for (const g of groups) {
    for (const line of g) {
      const key = norm(line);
      if (!key) continue;
      const dup = seen.some((x) => {
        const nk = norm(x);
        return nk === key || nk.includes(key) || key.includes(nk);
      });
      if (!dup) seen.push(line);
    }
  }
  return seen;
}

export function buildStageSummary(state: PrototypeState): StageSummaryData {
  const events = [...state.events]
    .filter((e) => e.source !== "SYSTEM")
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, 8);

  return {
    rangeLabel: "近 3 个月",
    timeline: events.map((e) => ({
      date: e.occurredAt.slice(0, 10),
      title: e.title,
      place: e.institution || e.location,
    })),
    metrics: [
      { label: "胎心", values: "162 → 146 次/分" },
      { label: "体重", values: "居家最近 58.2 kg" },
      { label: "血压", values: "居家最近 110/70 mmHg" },
    ],
    conclusions: events
      .filter((e) => e.notes)
      .slice(0, 3)
      .map((e) => ({
        quote: e.notes!,
        source: e.title,
      })),
    notes: [
      state.lastVisit?.doctorNote || "暂无已确认医嘱摘要",
      state.lastVisit?.medication ? `用药：${state.lastVisit.medication}` : "",
    ].filter(Boolean),
    openFollowUps: [
      {
        id: "of-1",
        text: "6 月 3 日报告建议两周后复查血常规，档案中未见记录",
      },
    ],
    repeated: [
      {
        label: "产科超声",
        count: 2,
        detail: "NT（5 月）· 孕中期超声（7 月）",
      },
    ],
    simplified:
      "近三个月做了 NT、血常规和一次孕中期超声。最近超声写生长发育与孕周大致相符。血常规里有一项复查建议，档案里还没看到后续记录。下次重点是大排畸和糖耐安排，以医生意见为准。",
  };
}
