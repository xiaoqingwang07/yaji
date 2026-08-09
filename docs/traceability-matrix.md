# 需求追踪矩阵

| 需求 | 页面 | 主要接口 | 数据实体 | 权限 | 测试用例 |
|---|---|---|---|---|---|
| AUTH-001~005 | P01 | `/auth/*`, `/me` | User, ConsentRecord | 本人 | T-AUTH-01~05 |
| ONBOARD-001~006 | P02 | `/families`, mother/pregnancy/baby | Family, MotherProfile, Pregnancy, Baby, Event | OWNER(创建者) | T-ONB-01~06 |
| EVENT-001~007 | P03,P04,P05 | `/events`, `/search` | Event, Attachment | VIEWER读 / EDITOR写 | T-EVT-01~07 |
| REPORT-001~010 | P06,P07,P08 | attachments/reports/* | Report, ReportField, Attachment | EDITOR+ | T-RPT-01~10 |
| HEALTH-001~006 | P09~P13 | health-overview, health/growth/vaccination | MotherHealthRecord, BabyGrowthRecord, VaccinationRecord, Event | EDITOR写 | T-HLT-01~06 |
| REMINDER-001~003 | P14,P15 | `/reminders` | Reminder | EDITOR写 | T-RMD-01~03 |
| FAMILY-001~005 | P16 | members/invites | FamilyMember, FamilyInvite, AuditLog | OWNER管理 | T-FAM-01~05 |
| PRIVACY-001~004 | P17 | consents/exports/deletion | ConsentRecord, AuditLog | OWNER导出删除 | T-PRI-01~04 |
| NFR-001~005 | 全部 | — | — | — | T-NFR-01~05 |

## 页面覆盖

| 页面 | 需求 |
|---|---|
| P01 启动登录 | AUTH-* |
| P02 首次建档 | ONBOARD-* |
| P03 时间轴 | EVENT-001,003,004 |
| P04 事件详情 | EVENT-002,006,007 |
| P05 手动事件 | EVENT-002,005 |
| P06 上传报告 | REPORT-001~003 |
| P07 OCR 处理中 | REPORT-004 |
| P08 报告确认 | REPORT-005~010 |
| P09 健康总览 | HEALTH-001,004 |
| P10/P11 妈妈健康 | HEALTH-002,005,006 |
| P12/P13 宝宝成长 | HEALTH-003,005,006 |
| P14/P15 提醒 | REMINDER-* |
| P16 家庭成员 | FAMILY-* |
| P17 隐私数据 | PRIVACY-* |
