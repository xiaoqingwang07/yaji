# 芽纪 MVP 开发执行规格

> 文档版本：v2.0  
> 产品形态：面向中国大陆家庭的移动 App  
> 目标读者：Cursor Agent，以及产品、设计、研发和测试人员  
> 原始研究稿：`deep-research-report.md`  
> 本文优先级：本文是产品与技术唯一基线。如与原始研究稿或 `docs/` 下任何文档冲突，以本文为准。

### v2.0 相对 v1.2 的变更摘要

基于 38 问种子用户深度访谈（记录见 `docs/product-positioning.md`）收敛，产品定义章节重写，工程章节保留并扩充：

| 变更 | 说明 |
|---|---|
| 定位 | 从"档案工具"升级为"家庭孕育档案与解读助手"；「此刻」取代时间轴成为默认首页 |
| 新增阶段 | 备孕（仅归档，无流程引导） |
| 新增 MVP 能力 | 就诊录音转写（原 P1）、存量批量导入、阶段小结（跨报告事实汇总）、标准孕育日历与材料清单、事件级费用记录、居家监测录入 |
| AI 边界 | 确立四层模型：只做①术语与报告解释、②档案事实提示；不做③行动建议、④医生评判 |
| AI 能力实现 | 从"传统 OCR + Mock"升级为 OCR / LLM / ASR 三个可替换 Provider；首版接入国内大模型 API |
| 解读可信度 | 引入自建可控知识库（术语解释 + 标准日历），出处只指向知识库或报告原文，禁止模型自由引用指南 |
| 权限收敛 | 邀请只提供"可查看 / 可编辑"两种选择；角色调整与审计日志移至 P1 |
| 指标 | 增长口径指标改为体验达标线；新增单份归档 ≤30 秒、存量批量导入 ≤10 分钟 |
| 明确不做新增 | AI 行动建议与医生评判、老人端、挂号排队缴费、广告与打卡催办 |

---

## 0. 给 Cursor Agent 的执行指令

你要开发的产品叫“芽纪”。请完整阅读本文后再开始编码，并严格遵守以下规则：

1. 只实现本文标记为 **MVP 必须实现** 的内容，不自行加入社区、电商、医生端、医院对接、健康诊断等功能。
2. 默认按照本文确定的技术栈、目录结构、数据模型和接口执行。只有遇到无法实现的技术阻塞时才允许调整，并记录调整原因。
3. 按第 12 节的四个项目大步骤实施。其中“全量开发”是一次连续建设过程，内部功能顺序只表示依赖关系，不得拆成多套版本或反复推倒重做。
4. 先建立真实可运行的业务骨架，再接入第三方能力。所有外部智能能力通过第 6.5 节的 `OcrProvider`、`LlmProvider`、`AsrProvider` 接口接入；每个接口都必须提供 Mock 实现，没有任何密钥也能完整演示报告归档、录音转写和阶段小结流程。
5. 所有 AI/OCR/ASR 结果都必须先进入“待确认”状态。未经用户确认，不得写入正式健康档案，不得生成医疗诊断。
6. 严格遵守第 6.1 节的 AI 四层边界：只做术语与报告解释、档案事实提示；不得输出行动建议（该补什么、该不该做某项检查、用什么药），不得评判医生或判断是否过度医疗。
7. 白话解读与术语解释的出处只能指向自建知识库条目或用户报告原文。禁止让模型自由生成指南名称、条款编号或链接。无法确认时输出“不确定，请核对原报告”。
8. 所有健康数据、附件、就诊录音和家庭信息均视为敏感数据。禁止写入公开 URL、客户端日志、普通分析埋点或错误追踪正文。
9. 所有页面都要实现加载、空数据、失败、无权限四类状态；所有表单都要有前后端双重校验。
10. 不要只生成界面或静态假数据。MVP 完成时，移动端、API、数据库、对象存储和 OCR / LLM / ASR 模拟服务必须形成可运行闭环。
11. 提交代码时同步维护 `README.md`、`.env.example`、数据库迁移、种子数据和测试，不在文档中写入真实密钥。
12. 如本文已经给出明确答案，不要再次询问产品选择。确实影响数据安全、核心范围或无法继续执行的问题，再向用户确认。

### Cursor 开工时的第一批动作

1. 创建 `PROJECT_PLAN.md`，把本文全部 MVP 要求映射为一张可勾选的执行清单，不重新发明需求。
2. 执行“大步骤一：整体设计与可复用原型”，在最终 Expo 工程中完成全部页面、状态和主流程原型，禁止创建后续会丢弃的一次性原型项目。
3. 同步确定 Prisma 数据模型、OpenAPI 契约、权限矩阵和需求追踪矩阵，让页面、接口、数据表和测试可以一一对应。
4. 原型与总体方案确认后，连续完成“大步骤二：全量开发”，不要在每个功能包之间停下来重新规划。
5. 功能代码、迁移、测试、README 和 `.env.example` 同步提交，不把测试和文档全部拖到最后补。
6. 全量功能完成后统一执行系统测试、集中修复和发布验收。

---

## 1. 产品定义

### 1.1 一句话定位

芽纪是**属于一个家庭的孕育档案与解读助手**，覆盖备孕、孕期、妈妈产后恢复和宝宝 0-1 岁成长。

用户把每次检查的报告、医生说的话（录音）、在家测的数据交给它；它记得完整历史，用白话告诉用户：发生了什么、这个词是什么意思、下一个标准节点是什么、下次去医院要带什么。

它不给诊疗建议、不评判医生，而是让用户**带着完整的事实去见医生**。

### 1.2 产品要解决的问题

产品源于真实家庭处境，五个痛点按优先级排列：

| 痛点 | 具体表现 |
|---|---|
| 散 | 从备孕开始就跑医院，报告攒成一大袋，纸质与电子混存，跨医院不通 |
| 忘 | 见医生常常只有两三分钟；出了诊室就记不清叮嘱、用药和注意事项 |
| 看不懂 | 报告全是缩写与参考区间；病历上的通用术语（如"先兆流产"）会造成不必要的恐慌 |
| 不知道下一步 | 下次何时查、查什么、带什么材料，靠护士口头交代或群通知，有漏检风险 |
| 串不起来 | 单份报告都看得懂，攒三五个月却得不出结论；容易被单一医生的片面判断带偏，做额外无用的检查 |

用户当前的替代方案是自建手工流水线：图文发一个通用 AI、音频发另一个、多家交叉验证，每次重新交代背景，信息碎在各个工具里，还要承担会员与网络成本。芽纪要替代的正是这条流水线。

### 1.3 核心价值

产品首先是“档案工具”，其次才是“AI 工具”。AI 的作用是降低录入成本、帮助理解、汇总事实，不能替代医生，不能改变原始医疗信息，不能给出行动建议。

核心闭环：

```text
看完医生
    -> 拍报告 / 就诊录音 / 记叮嘱与用药（30 秒级录入）
    -> OCR 与 LLM 抽取字段、ASR 转写录音
    -> 白话解读（出处指向知识库或报告原文）+ 建议下一步
    -> 用户逐项核对并确认
    -> 归入备孕、孕期、产后或宝宝 0-1 岁时间轴
    -> 「此刻」呈现当前节点、下一步与携带清单
    -> 阶段小结把几个月的记录汇总成看得懂的事实
    -> 同一份数据生成健康趋势、搜索结果和提醒
    -> 夫妻共同维护或导出
```

首次使用还包含一条独立闭环：**存量批量导入**——把已经攒下的一大袋报告在 10 分钟内粗归档，构成初始时间轴。

### 1.4 北极星目标与体验达标线

北极星目标：让家庭能在 30 秒内找到任一关键孕育记录及其原始依据，并在任何时候一眼看清“当前节点、下一步、带什么”。

本产品优先服务真实自用需求，不以增长指标驱动。下列指标是**体验达标线与验收参考**，不是代码中的硬编码阈值，也不作为运营考核：

| 指标 | 定义 | 目标 |
|---|---|---:|
| 单份报告归档耗时 | 从进入上传到确认归档的中位时间 | <= 30 秒 |
| 叮嘱记录耗时 | 从打开添加菜单到保存一条医生叮嘱的中位时间 | <= 30 秒 |
| 存量批量导入耗时 | 20 份存量报告完成批量导入与粗确认的总时间 | <= 10 分钟 |
| 报告确认完成率 | 已开始识别的报告中最终被确认归档的比例 | >= 70% |
| 通用报告可归档率 | 任意合规报告经识别或手动补录后可完成归档的比例 | >= 95% |
| 基础字段接受率 | 清晰报告中日期、医院、标题、结论等基础字段未修改直接确认的比例 | >= 80% |
| 录音要素抽取接受率 | 清晰录音中医嘱、用药、下次检查三类要素未修改直接确认的比例 | >= 70% |
| 关键记录查找成功率 | 测试用户在 30 秒内找到指定记录的比例 | >= 90% |
| 「此刻」首屏有效性 | 新建档用户首屏即可看到当前节点与至少一条下一步的比例 | 100% |

最后一项由内置标准日历保证：只要填了预产期或出生日期，「此刻」首屏不得为空壳。

---

## 2. 用户、关系与权限

### 2.1 目标用户

- 核心用户：备孕中、孕期中，或宝宝 0-1 岁的家庭，尤其是首次生育家庭。
- 实际使用形态：**夫妻二人共用一份家庭档案**。常见分工是一方作为"信息管理员"负责录入整理与先看解读，另一方随时查看，双方都不需要通过转述获得信息。
- 老人不进入产品。用户使用阶段小结生成的简化结论口头转述给长辈即可，不做老人端。

### 2.2 关系和权限必须分离

家庭关系用于展示，权限角色用于鉴权，不得把 `mother`、`father` 直接当作权限。

关系枚举：

- `MOTHER`
- `FATHER`
- `GRANDPARENT`
- `CAREGIVER`
- `OTHER`

权限角色：

| 角色 | 查看档案 | 新增/编辑记录 | 上传报告 | 管理提醒 | 邀请成员 | 管理成员权限 | 导出/删除家庭数据 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `OWNER` | 是 | 是 | 是 | 是 | 是 | 是 | 是 |
| `EDITOR` | 是 | 是 | 是 | 是 | 否 | 否 | 否 |
| `VIEWER` | 是 | 否 | 否 | 否 | 否 | 否 | 否 |

权限规则：

- 创建家庭的用户自动成为 `OWNER`。
- 一个家庭至少保留一个 `OWNER`。
- 邀请必须使用一次性、有限期令牌；被邀请人确认后才获得权限。
- 成员被移除后立即失去访问权限。
- API 必须以当前用户的家庭成员关系进行服务端鉴权，不能只依赖前端隐藏按钮。

#### v2.0 权限收敛

数据层保留完整的三值角色枚举，但客户端交互收敛为面向夫妻共用的最简形态：

- 邀请界面只提供两种选择：**可查看**（映射 `VIEWER`）与**可编辑**（映射 `EDITOR`）。不暴露角色矩阵概念。
- MVP 支持移除成员（二次确认）；**成员角色调整与审计日志移至 P1**。
- 不提供祖父母/照护者专用入口与老人端；`GRANDPARENT`、`CAREGIVER` 关系值保留但不在首版引导中出现。

---

## 3. MVP 范围

### 3.1 MVP 必须实现

#### A. 账号与首次建档

- 手机号验证码登录。
- 本地开发环境提供固定验证码或开发登录入口，生产环境不得启用。
- 创建家庭和妈妈档案，填写当前用户与妈妈的关系；当前用户不一定就是妈妈本人。
- 首次进入时选择当前阶段：`备孕中`、`怀孕中` 或 `宝宝已出生且未满 1 岁`。
- **建档必须极简**：一张卡完成，只要求阶段 + 一个日期。家庭名与关系可默认生成，允许在“我的 → 完善档案”后补，不得作为首次建档阻断项。
- 备孕中：创建 `status = PLANNING` 的孕期记录，无必填日期，可选记录开始备孕时间。备孕阶段**只提供归档能力，不提供试管或备孕流程引导**。
- 怀孕中：创建当前孕期，末次月经日期、预产期至少填写一个；首次优先只问预产期。
- 宝宝已出生：创建宝宝档案，出生日期必填；可补录孕期、分娩和产后历史，但不作为首次建档阻断项。
- 备孕用户确认怀孕后，同一条孕期记录从 `PLANNING` 流转为 `PREGNANT` 并补充日期，备孕期归档的报告保持关联，不得断链。
- 首次建档完成后进入「此刻」首页。

#### A2. 存量批量导入

用户首次使用时通常已积攒大量既往报告，这是首次体验的成败点。

- 建档完成后引导进入批量导入，可跳过，也可在“我的”与添加菜单中再次进入。
- 支持连拍、相册多选和多文件选择，一次提交多份报告。
- 每份独立粗识别：报告日期、医院、报告大类；识别不到时留空，不得阻断。
- 提供**列表式快速确认**：用户逐条核对日期与大类即可入档，动态字段细节允许以后补充。
- 导入过程可随时中断，进度必须保留；重新进入继续未完成部分。
- 批量导入的每一份报告仍遵守“确认后才进正式档案”规则，但允许以“仅基础字段”的最小信息完成归档。
- 目标：20 份存量报告在 10 分钟内完成导入与粗确认。

#### B. 孕育事件时间轴（档案）

- 按时间倒序展示备孕、孕期、分娩、妈妈产后恢复和宝宝 0-1 岁关键事件。
- 支持事件新增、查看、编辑、软删除。
- 支持按主体（全部、妈妈、胎儿或宝宝）、阶段、事件类型和日期筛选。
- 支持关键词搜索标题、备注、报告摘要和医院名称。
- 事件类型：产检、检查报告、症状、用药、医生嘱咐、就诊录音、分娩、产后复查、宝宝体检、新生儿筛查、疫苗、疾病就诊、成长里程碑、其他。
- 孕期事件显示孕周，产后事件显示产后天数，宝宝事件显示月龄或日龄，备孕事件标注备孕期；计算依据始终可追溯和校正。
- 每个事件可关联多个附件和多份报告；一份报告只能归入一个正式事件，避免重复统计。
- 事件支持**可选费用记录**（金额 + 说明），用于就诊花费的轻量留档，服务报销备查；不做发票识别、报销流程和账目统计报表。
- 胎儿指标（胎心、双顶径、头围、腹围、股骨长等）归属孕期与胎儿记录，出生前不创建宝宝档案。

#### C. 各类医疗报告通用 OCR 归档

- 支持 JPG、PNG、PDF，单文件最大 15 MB。
- 同一报告支持多张图片或一个多页 PDF，页面顺序可调整；单份报告最多 20 页、附件总量最多 50 MB。
- 客户端上传前校验格式和大小；服务端再次校验 MIME、文件头和大小。
- 文件保存到私有对象存储，不生成永久公开链接。
- 报告状态完整可见：上传中、识别中、待确认、已归档、识别失败。
- 所有合规报告都允许上传，不得因类型未知而提示“不支持”。
- OCR 先做通用文字与版面识别，再建议报告大类：影像/超声、检验、孕期专项检查、门诊病历/诊断、处方/用药、住院/出院、分娩、产后复查、新生儿筛查、儿童体检、疫苗、其他。
- OCR 至少尝试提取：报告日期、医院、报告标题、报告大类、所属主体、动态字段、表格、原文结论和全文。
- 动态字段不限制为固定检验项目，可保存普通键值、检验表格、文本段落及其原文位置。
- 每个提取字段保存置信度，并对低置信度字段进行醒目标记。
- 用户必须能够逐项编辑、删除错误字段、补充遗漏字段。
- 只有点击“确认归档”后，才创建或更新正式事件和报告记录。
- 类型判断或结构化失败时自动进入“通用报告”模式，保留原图、OCR 全文和可识别的基础字段，允许用户完全手动补录，不能阻断归档。
- 报告确认页必须同时提供**白话解读**与**建议下一步**：
  - 白话解读只基于本份报告原文与知识库条目，逐条标注出处；无法确认时输出“不确定，请核对原报告”。
  - 建议下一步只允许三类：建议添加提醒、建议加入下次就诊携带清单、建议记录为医生叮嘱。用户采纳后才生效。
  - 不得输出行动建议或医生评判（见第 6.1 节四层边界）。

#### C2. 就诊录音与转写

用户在诊室中普遍存在“医生说得快、来不及记、事后回忆不全”的问题，录音是真实高频行为。

- 添加菜单第一项提供**一键就诊录音**：进入即单一大按钮，一次点击开始，一次点击结束，不要求填写任何前置信息。
- 支持导入手机中已有的录音文件（会话开始前录制的音频不能被排除在外）。
- 首次使用与录音界面固定提示：`录音仅存入您自己的档案；请遵守就诊场所相关规定。`
- 录音结束后通过 `AsrProvider` 转写为文本，再通过 `LlmProvider` 抽取三类要素：医生叮嘱、用药、下次检查（时间与项目）。
- 抽取结果进入待确认页，逐项可编辑与删除，确认后：叮嘱写入医生嘱咐事件、用药写入用药记录、下次检查可采纳为提醒或携带清单项。
- 原始音频与转写全文均留档，支持回放与查看，可与就诊事件关联。
- 转写或抽取失败时保留音频与已得到的部分结果，允许完全手动补录，不能阻断归档。
- 录音音频属于最高敏感级数据：私有存储、短时签名访问、禁止进入日志，且不得用于任何模型训练。

#### C3. 阶段小结（跨报告事实汇总）

解决“单份报告都看得懂、攒三五个月却串不起来”的核心痛点。

- 用户选择时间范围：近 1 个月、近 3 个月、近 6 个月，或整个孕期 / 出生至今。
- 基于**已确认档案**生成白话综述，必须分区展示：
  1. 检查时间线：时间、医院、检查项目
  2. 关键指标跨报告变化：引用原始数值与单位，可跳转健康趋势
  3. 各医院结论**原文汇编**：标注来源报告，可跳转原图
  4. 医生叮嘱与用药汇总
  5. 未闭环项：报告或医嘱中提到需复查，但档案中没有对应后续记录，可一键转为提醒
  6. 同类检查记录：同一项检查在该时间范围内做过几次、结果分别如何
- 只汇总事实、只引用原文。**不得**综合多份报告得出新的医学结论，**不得**评价医生判断，**不得**判断某项检查是否必要。
- 固定提示：`小结仅汇总您的档案记录，不构成医学结论，请以医生意见为准。`
- 提供适合口头转述的简化版本，供用户向长辈说明情况。
- 记录不足时提示先归档报告，不得生成空洞或推测性内容。
- 小结结果必须落库缓存，并在范围内新增或修改已确认记录时失效重算，不允许每次查看都重复调用模型。

#### D. 独立健康模块：妈妈恢复与宝宝成长

- 健康模块是时间轴数据的另一种聚合与趋势视图，不建立第二套独立数据，不要求用户重复录入。
- 妈妈孕期可记录：体重、收缩压、舒张压、血糖、胎动次数、症状、用药和检查事件。
- 妈妈产后可记录：体重、血压、体温、恢复症状、用药、产后复查和相关报告。
- 宝宝 0-1 岁可记录：出生基线、体重、身高、头围、体检、筛查、疫苗、疾病就诊、用药和成长里程碑。
- 展示妈妈孕期、妈妈产后和宝宝成长的最新值、历史列表及基础趋势曲线。
- 已确认报告中的健康字段只能在用户勾选确认后同步为健康记录，并保留报告来源；同步后自动出现在健康趋势和时间轴中。
- 图表只展示用户输入的事实数据及变化，不做疾病预测或自动诊断。
- 不同单位不得静默换算；发生换算时必须保留原始值和原始单位。
- **居家监测快速录入**：支持用户自行测量的体重、血压、胎心等常见数据，入口不超过两步，单条录入在 30 秒内完成。居家数据与报告数据同源存储，在趋势中区分来源标记（手动 / 报告同步 / 居家监测）。

#### D2. 「此刻」与标准孕育日历

「此刻」是默认首页，必须始终回答三个问题：我在哪个节点、下一步做什么、下次带什么。

- 展示当前节点：备孕中、孕周或宝宝月龄/日龄。
- 展示下一步清单，来源分两层：
  1. **内置标准日历**（事实日程，非医疗建议）：孕期产检时刻表、0-1 岁国家免疫规划疫苗计划、产后 42 天复查等标准节点。仅凭预产期或出生日期即可匹配当前阶段，保证新建档用户首屏不为空。
  2. **个人记录**：用户创建的提醒、已确认报告中的复查建议、录音中抽取的下次检查。
- 展示下次就诊携带清单：既往结果 + **节点材料清单**（例如建档所需证件等非医疗材料）。
- 展示轨迹一瞥与最近一次就诊摘要。
- 标准日历与材料清单必须**内置为可控知识库数据**，来源为公开权威资料，每条标注`参考日程，以医生安排为准`。禁止由模型即时生成日程或材料清单。
- 标准日历条目可一键转为用户自己的提醒，转换后归用户所有，可修改或取消。
- 备孕阶段不提供标准日历，「此刻」以最近检查与用户提醒为主。
- 系统不得自动创建提醒，也不得把标准日程当作强制计划或医疗建议展示。

#### E. 提醒

- 支持用户手动创建产检、产后复查、宝宝体检、用药和疫苗提醒。
- 支持一次性提醒；重复提醒不属于首版。
- 开发版可使用本地通知；服务端保留提醒数据和触发状态。
- 用户可完成、修改或取消提醒。
- 不根据 OCR、录音或标准日历自动创建提醒，只能给出“建议添加”或“一键转为提醒”并由用户确认。
- 提醒不单独占据底部导航，统一并入「此刻 → 下一步」；不做打卡、催办和运营式通知轰炸。

#### F. 家庭协作

- `OWNER` 可生成邀请链接或邀请码。
- 邀请时指定关系（展示用）与权限：**可查看**或**可编辑**二选一。
- 成员可查看自己的关系与权限。
- 支持移除成员（二次确认）。
- 成员角色调整与审计日志属于 P1，MVP 不实现完整角色管理界面。

#### G. 隐私能力与信任承诺

- 查看当前收集的数据类别与授权状态。
- 导出家庭结构化数据为 JSON，并将原始附件（含录音音频）一并打包为 ZIP。
- 用户可以发起账号删除或家庭删除；MVP 可采用二次确认后异步删除。
- 记录敏感个人信息单独同意、家庭共享同意、AI 处理同意及撤回时间。
- **信任承诺必须在产品内明文展示**，作为用户可读条款而非仅存于隐私政策：
  1. 数据加密存储，敏感信息不进日志与公开链接
  2. 绝不用于模型训练，不向广告或画像平台提供
  3. 随时完整导出，删除即删除；即使服务终止，用户可带走全部数据

### 3.2 MVP 后优先级 P1

以下功能可以预留接口，但不得阻塞 MVP：

- **一页纸就诊摘要**：把近期指标、在用药和上次医嘱整理成可直接出示给医生的一页视图。
- 家庭成员角色调整界面与完整审计日志。
- 基于个人档案的自然语言查询，例如“上次超声是什么时候”。
- 服务端远程推送和重复提醒。
- PDF 版档案导出与打印排版。
- 基于国家或专业标准的孕期体重、宝宝生长百分位参考曲线。
- 发票识别与报销流程管理（MVP 只做事件级金额与说明）。
- 备孕与试管流程专门引导（MVP 备孕只做归档）。
- 更细的产后恢复量表和经专业审核的结构化评估。
- 多个孕期在客户端的切换管理。
- 弱网续传、离线草稿和跨设备冲突处理。

### 3.3 明确不做

- **AI 行动建议**：该补什么营养、该不该做某项检查、用什么药、去哪个科室。
- **AI 评判医生**：判断医生结论对错、判断是否属于过度医疗。
- 疾病诊断、风险预测、处方或治疗建议。
- 开放式医疗问答和基于互联网知识生成健康建议。
- 医生端、医院工作台或医疗机构管理后台。
- 医院 HIS、EMR、医保、保险系统对接。
- 挂号、排队、缴费等医院流程功能（用户已有医院小程序习惯，不重复建设）。
- 专家在线咨询、问诊或人工审核服务。
- 母婴社区、动态、评论、直播、课程或知识资讯流。
- 商城、广告、优惠券和会员付费系统。
- 打卡、签到、连续记录激励和运营式推送催办。
- 喂奶、挤奶、睡眠、排泄、尿布次数等高频生活记录。
- 老人端与多级权限体系。
- 宝宝照片人脸识别、自动影集或视频生成。
- 知识图谱、推荐系统、自训练医疗模型。
- 多胎妊娠的专用交互。
- Web 管理后台，除非只用于本地开发调试。

---

## 4. 信息架构与页面要求

### 4.1 底部导航

使用四个固定入口：

1. **此刻**：默认首页，展示当前节点、下一步、携带清单、轨迹一瞥与最近就诊。
2. **档案**：时间轴历史、筛选、搜索与阶段小结入口。
3. **健康**：妈妈孕期/产后健康、宝宝 0-1 岁成长、居家监测和趋势图。
4. **我的**：家庭成员、隐私授权、信任承诺、数据导出和账号设置。

提醒不单独占据入口，并入「此刻 → 下一步」。

使用一个全局“添加”主按钮，菜单按**出诊场景优先**排序：

1. 就诊录音
2. 上传检查报告
3. 记下医生叮嘱
4. 记录用药
5. 记居家监测（体重 / 血压 / 胎心）
6. 手动事件、提醒（次要）

### 4.2 页面清单

| 编号 | 页面 | 核心内容 | MVP |
|---|---|---|---:|
| P01 | 启动与登录 | 手机号、验证码、协议确认、一键体验示范 | 是 |
| P02 | 首次建档（极简） | 一张卡：备孕/怀孕中/已出生 + 一个日期 | 是 |
| P02b | 存量批量导入 | 连拍或多选、批量识别、列表式快速确认、可中断续传 | 是 |
| P03a | 此刻（默认首页） | 当前节点、下一步（标准日历+个人记录）、携带清单、轨迹一瞥、最近就诊 | 是 |
| P03 | 档案时间轴 | 妈妈/胎儿或宝宝与阶段筛选、事件列表、搜索、小结入口 | 是 |
| P03b | 阶段小结 | 时间范围选择、时间线、指标变化、结论原文汇编、叮嘱汇总、未闭环项、同类检查、简化版 | 是 |
| P04 | 事件详情 | 结构化内容、备注、附件、来源、费用、编辑 | 是 |
| P05 | 手动新增/编辑事件 | 类型、日期、标题、备注、附件、费用 | 是 |
| P06 | 上传报告 | 多图或多页文件、页面排序、所属主体、上传进度、失败重试 | 是 |
| P06b | 就诊录音 | 一键录音、导入音频、转写进度、要素抽取确认、音频回放 | 是 |
| P07 | 识别处理中 | 状态反馈，可退出后后台继续 | 是 |
| P08 | 通用报告确认 | 多页原图对照、类型与主体、动态字段、表格、低置信度提示、白话解读与出处、建议下一步、确认归档 | 是 |
| P09 | 健康总览 | 妈妈孕期/产后与宝宝分段切换、最近记录、趋势入口 | 是 |
| P10 | 妈妈健康详情 | 孕期/产后切换、指标趋势、检查与恢复记录、来源标记 | 是 |
| P11 | 新增妈妈健康记录 | 日期、阶段、指标、单位、症状、备注、来源；含居家监测快速录入 | 是 |
| P12 | 宝宝成长详情 | 0-1 岁月龄、身高体重头围、体检疫苗、里程碑 | 是 |
| P13 | 新增宝宝成长记录 | 日期、指标、体检/疫苗/里程碑、备注、来源 | 是 |
| P14 | 下一步与提醒 | 标准日历节点、待办、已完成、已取消；并入「此刻」呈现 | 是 |
| P15 | 新增/编辑提醒 | 类型、时间、关联事件、备注 | 是 |
| P16 | 家庭成员 | 成员列表、关系、可查看/可编辑、邀请、移除 | 是 |
| P17 | 隐私与数据 | 授权记录、信任承诺明文、导出、删除申请 | 是 |
| P18 | 档案自然语言查询 | 只查家庭已确认档案 | P1 |
| P19 | 一页纸就诊摘要 | 近期指标、在用药、上次医嘱，供出示医生 | P1 |

### 4.3 关键交互要求

- 「此刻」是第一视觉重点，首屏必须回答当前节点、下一步与携带什么；档案时间轴是完整历史的二级入口。不做资讯瀑布流或运营 Banner。
- 首屏禁止堆叠运营卡片、统计条矩阵和无关快捷入口；视觉气质为简洁、优雅、系统感强（详见 `docs/design-system.md`）。
- 录入速度是硬性交互指标：单份报告归档与单条叮嘱记录均按 30 秒内完成设计；批量导入按 20 份 10 分钟内完成设计。
- 报告确认页必须支持查看原图和编辑字段，不能只展示 AI 摘要。
- 白话解读区块必须与原始字段区块视觉分离，且每条解读可见出处；出处只允许指向知识库条目或报告原文位置。
- 就诊录音入口必须能在两次点击内开始录音，不得要求先填写表单。
- 图片报告支持旋转和裁切；iOS 选择的 HEIC/HEIF 图片在客户端转换为保留清晰度的 JPEG 后再上传。
- 档案时间轴和健康模块必须读取同一数据来源；从任一入口编辑后，另一入口立即一致更新。
- 标准日历条目在转为用户提醒之前，视觉上必须与用户自建提醒区分，并标注`参考日程，以医生安排为准`。
- 孕周、产后天数和宝宝月龄是事件上下文，不是用户需要重复填写的独立记录。
- 删除、撤回授权、移除成员、删除家庭需要二次确认。
- 按钮使用清晰的图标和动作名称；页面不堆叠大面积介绍性卡片。
- 所有触控区域不小于 44 x 44 pt，并支持系统字号增大。
- 中文文本不得截断关键日期、数值、单位和操作名称。
- 首版仅支持简体中文和竖屏；深色模式不是验收项。
- 所有日期按 `Asia/Shanghai` 展示，服务端存储 UTC 时间。

### 4.4 状态要求

每个数据页面至少包含：

- 首次空状态：提供唯一、明确的下一步操作。
- 骨架或加载状态。
- 网络失败状态和重试入口。
- 无权限状态，不泄露资源是否存在。
- 删除或失效状态。

「此刻」首页的空态要求特殊处理：已填写预产期或出生日期时，标准日历必须保证首屏有内容，不得出现空壳首页；空态只用于引导归档第一份报告。

报告额外包含：

- `UPLOADING`
- `UPLOADED`
- `PROCESSING`
- `NEEDS_REVIEW`
- `CONFIRMED`
- `FAILED`

就诊录音额外包含：

- `RECORDING`
- `UPLOADING`
- `TRANSCRIBING`
- `EXTRACTING`
- `NEEDS_REVIEW`
- `CONFIRMED`
- `FAILED`

批量导入批次额外包含：

- `IN_PROGRESS`
- `PARTIALLY_CONFIRMED`
- `COMPLETED`
- `ABANDONED`

阶段小结额外包含：

- `GENERATING`
- `READY`
- `STALE`（范围内记录发生变化，需要重算）
- `FAILED`

---

## 5. 核心业务流程与验收条件

### 5.1 首次建档

流程：验证码登录 -> 同意服务协议与隐私政策 -> 选择当前阶段 -> 填写一个关键日期 -> 进入「此刻」。

验收条件：

- 建档只允许一屏、一张卡；除阶段与一个日期外不得设置其他必填项。家庭名与关系可由系统默认生成。
- 备孕中用户无必填日期，建档后创建 `status = PLANNING` 的孕期记录。
- 怀孕中用户的末次月经日期和预产期至少填写一个；首次只强制询问预产期。
- 宝宝已出生用户的宝宝出生日期必填，且出生日期不得晚于当前日期、不得早于一年前；边界日期按自然日处理。
- 末次月经日期和预产期都填写时，若明显矛盾则提示用户确认，不自动覆盖。
- 中途退出后允许继续未完成建档。
- 建档成功后自动生成“建立孕育档案”系统事件；已出生用户同时生成宝宝出生基线事件。
- 建档完成后直接进入「此刻」；填写了预产期或出生日期时，「此刻」首屏必须由标准日历提供至少一条下一步内容。
- 备孕用户后续确认怀孕时，同一条孕期记录由 `PLANNING` 流转为 `PREGNANT` 并补充日期；备孕期已归档的报告与事件保持关联，不得丢失或需要重新归档。

### 5.1b 存量批量导入

流程：进入批量导入 -> 连拍或多选文件 -> 批量上传 -> 逐份粗识别 -> 列表式快速确认 -> 生成初始时间轴。

验收条件：

- 一次可提交多份报告；单份文件与总量限制沿用第 3.1 节 C 的规则，超限项被单独拒绝并明确提示，不影响其他项。
- 每份报告独立识别与独立确认；任意一份失败不得中断整个批次。
- 识别不到日期、医院或大类时留空并标记待补，不得猜测填充。
- 列表式确认允许仅核对日期与大类即完成归档，动态字段可留待以后补充。
- 批次进度必须持久化：退出应用或中断网络后重新进入，已确认项保持已确认，未确认项保持待确认。
- 重复提交同一批次不得产生重复报告或重复事件，需使用幂等键。
- 批量导入产生的报告与单份上传的报告在数据结构上完全一致，不建立第二套存储路径。

### 5.1c 就诊录音与转写

流程：一键开始录音（或导入音频）-> 结束 -> 上传 -> 转写 -> 抽取医嘱/用药/下次检查 -> 用户确认 -> 写入档案。

验收条件：

- 从添加菜单到开始录音不超过两次点击，且不要求任何前置表单填写。
- 录音界面与首次使用必须展示：`录音仅存入您自己的档案；请遵守就诊场所相关规定。`
- 录音过程中应用被切换到后台或来电中断时，已录制部分不得丢失。
- 支持导入手机中已有音频文件，与应用内录制走同一处理流程。
- 转写失败时保留原始音频，允许用户手动填写叮嘱与用药，不得阻断归档。
- 要素抽取失败或部分成功时，保留已成功部分，其余允许手动补录。
- 抽取结果必须逐项可编辑、可删除；未经确认不得写入正式档案，不得自动创建提醒。
- 确认后：叮嘱写入医生嘱咐事件、用药写入用药记录、下次检查可采纳为提醒或携带清单项，三者与来源录音保持可追溯关系。
- 原始音频与转写全文均可回放/查看；音频不得生成永久公开链接。
- 同一段录音重复请求转写具备幂等性，不重复计费、不重复创建事件。

### 5.1d 阶段小结

流程：选择时间范围 -> 基于已确认档案生成 -> 分区展示 -> 可跳转原始记录 -> 可一键处理未闭环项。

验收条件：

- 小结只读取 `CONFIRMED` 报告与已保存的正式事件；待确认内容不得进入小结。
- 六个分区（时间线、指标变化、结论原文汇编、叮嘱与用药汇总、未闭环项、同类检查记录）均可为空但必须如实呈现为空，不得填充推测内容。
- 每条结论必须标注来源报告并可跳转原图；每个数值必须引用原始值与单位。
- 不得出现综合多份报告产生的新判断、对医生的评价，或某项检查是否必要的结论。
- 固定展示：`小结仅汇总您的档案记录，不构成医学结论，请以医生意见为准。`
- 未闭环项可一键创建提醒，创建后归用户所有并可修改取消。
- 小结结果落库缓存；范围内新增或修改已确认记录后状态变为 `STALE`，再次查看时重算，不得每次查看都调用模型。
- 记录不足时明确提示先归档报告，不生成空洞小结。
- 简化版内容必须来自同一份小结数据，不得单独调用模型产生不一致结论。

### 5.1e 标准孕育日历

验收条件：

- 标准日历数据来自内置可控知识库，随代码版本管理；不得由模型即时生成。
- 每条日程标注`参考日程，以医生安排为准`，并可查看所属阶段依据（孕周区间或月龄）。
- 仅凭预产期或出生日期即可匹配当前阶段条目；填写了日期的用户「此刻」首屏不得为空。
- 标准日程在用户执行“转为提醒”前不得写入提醒表，也不得计入待办统计。
- 转为提醒后，该提醒归用户所有，可修改时间、备注或取消，且不再受知识库更新影响。
- 备孕阶段不展示标准日历条目。
- 材料清单同样来自知识库，明确区分医疗材料与非医疗材料（如证件），不得由模型生成。

### 5.2 手动记录事件

验收条件：

- 必填字段只有事件类型、发生时间和标题。
- 保存后立即出现在正确日期位置。
- 系统根据主体和日期自动展示孕周、产后天数或宝宝日龄/月龄；用户修正基础日期后重新计算展示值，但保留历史修改记录。
- 编辑保留 `updatedAt`，删除使用软删除。
- 附件上传失败不能导致已填写的文字丢失。

### 5.3 上传并归档报告

流程：选择多图或多页文件 -> 排序并选择所属主体 -> 上传私有存储 -> 创建通用报告草稿 -> OCR 与分类 -> 展示原图、全文和动态字段 -> 用户修改 -> 确认 -> 生成时间轴事件。

验收条件：

- OCR 重试具备幂等性，不重复创建报告和事件。
- 任意合规报告都能进入识别流程；未知类型自动归为 `OTHER`，不得阻断。
- 多页报告按用户确认的顺序处理并保持页码来源，单页失败不能导致其他页面结果丢失。
- 置信度低于可配置阈值的字段标记为待核对，但不得自动删除。
- 用户能在 OCR 完全失败时保留全部原件并手动完成通用报告。
- 确认前报告不参与健康趋势、阶段小结和正式搜索结果。
- 确认后仍保留 OCR 原始响应、用户修订值和原始附件之间的可追溯关系。
- 报告详情固定展示：`AI 整理结果仅供记录，请以原始报告和医生意见为准。`
- 白话解读的每一条都必须可追溯到报告原文位置或知识库条目 ID；无法追溯的解读不得展示。
- 解读中不得出现行动建议、风险判断或对医生的评价；出现越界表达视为 P1 缺陷。
- 建议下一步只允许提醒、携带清单、医生叮嘱三类，且必须由用户采纳后才产生数据。

### 5.4 健康趋势

验收条件：

- 健康首页可在妈妈孕期、妈妈产后和宝宝之间切换，并展示最近记录。
- 选择单个指标后显示日期和值；每条数据都能追溯到手动记录或已确认报告。
- 健康记录在时间轴自动形成或关联事件，时间轴和健康模块不得产生两份互不关联的数据。
- 报告提取的体重、血压、身高、头围等字段默认不自动同步，必须由用户选择并确认。
- 不同单位的数据不连接成同一条曲线，除非用户明确完成换算。
- 删除一条数据后图表与最新值同步更新。
- 居家监测记录与报告同步记录共用同一张健康记录表，通过来源标记区分，不建立第二套存储。
- 单条居家监测录入可在 30 秒内完成，且不要求填写与测量无关的字段。
- 不出现“高风险”“患病概率”“建议服药”等诊断性表达。

### 5.5 分娩、产后与宝宝 0-1 岁衔接

验收条件：

- 孕期用户记录分娩事件后，系统建议创建宝宝档案并带入出生日期，不得自动猜测宝宝信息。
- 妈妈产后记录继续归属妈妈档案，孕期结束后仍可查看完整历史。
- 宝宝事件以出生日期计算日龄或月龄；满 1 岁后历史仍可查看，但 MVP 不再提供新的 1 岁后专用结构化功能。
- 宝宝体检、筛查、疫苗、疾病就诊和里程碑均进入统一时间轴，并可在宝宝成长页聚合查看。
- 产品不自动生成诊疗建议或强制疫苗计划；报告或用户提供明确日期时，只能建议创建提醒并等待确认。

### 5.6 家庭邀请

验收条件：

- 邀请令牌默认 24 小时失效且只能使用一次。
- 未登录用户登录后可继续接受邀请。
- 接受前明确展示家庭名称、邀请人、关系和将获得的权限。
- `VIEWER` 调用写接口必须返回 403。
- 最后一个 `OWNER` 不能退出、被移除或降级。

### 5.7 数据导出与删除

验收条件：

- 导出任务生成带过期时间的私有下载地址。
- 导出包包含结构化 JSON、附件清单和原始附件。
- 导出任务、下载行为和删除行为写入审计日志。
- 删除前再次验证用户身份。
- 删除任务执行后，用户不能继续访问数据；备份清理周期在隐私政策中明确，不宣称即时物理擦除。

---

## 6. AI 能力、边界与 Provider

本节同时约束能做什么（6.1–6.2）、绝不能做什么（6.3）、可信来源从哪来（6.4）以及如何接入（6.5）。

### 6.1 AI 能力四层边界

这是产品最重要的红线，由用户亲自划定，与医疗合规要求重合。所有 AI 功能都必须落在前两层。

| 层 | 内容 | 是否实现 |
|---|---|---|
| ① 解释 | 报告项目、数值、医院结论、病历术语的白话解释（例如说明“先兆流产”是病历中的通用写法） | **实现** |
| ② 事实提示 | 基于完整档案的客观提示：某指标连续多次变化、报告中建议的复查尚无后续记录、同类检查在该期间做过几次、标准节点将至 | **实现** |
| ③ 行动建议 | 该补什么营养、该不该做某项检查、用什么药、挂哪个科 | **不实现** |
| ④ 医生评判 | 判断医生结论对错、判断是否属于过度医疗 | **不实现** |

设计依据：产品的价值是让用户**带着完整事实去见医生**，而不是替代医生做判断。第三、四层一旦出错，代价由用户家庭承担，因此在架构上就不提供该能力，而不是依赖提示词约束。

### 6.2 AI 允许做的事情

- 从用户上传的任意合规医疗报告中识别多页文字、普通键值、文本段落和表格。
- 根据报告原文建议报告大类和所属主体；无法判断时返回 `OTHER`，不得拒绝处理。
- 提取报告中明确存在的日期、医院、标题、项目、数值、单位、参考范围、原文标记和结论。
- 对报告原文进行忠实压缩，生成不增加外部医学知识的摘要。
- 生成白话解读：解释报告原文中出现的项目与术语，每条标注出处（报告原文位置或知识库条目）。
- 将就诊录音转写为文本，并抽取医嘱、用药、下次检查三类要素。
- 生成阶段小结：跨报告的**事实汇总**，包括时间线、指标变化、结论原文汇编、叮嘱与用药汇总、未闭环复查项、同类检查记录。
- 提出三类建议下一步：建议添加提醒、建议加入携带清单、建议记录为医生叮嘱。
- 根据报告本身的标题和内容建议事件类型。
- 在 P1 阶段，从用户自己的已确认档案中检索答案。

### 6.3 AI 禁止做的事情

- 推断疾病、胎儿风险、预后或是否需要治疗。
- 根据单项指标给出医学结论。
- 综合多份报告得出新的医学结论；阶段小结只能汇总与引用，不能推断。
- 推荐药品、剂量、检查项目或就医科室；判断某项检查是否必要。
- 评价医生的判断是否正确，或提示是否属于过度医疗。
- 将模型常识混入“报告摘要”“白话解读”或“阶段小结”。
- **自由生成指南名称、条款编号、文献或链接作为出处。** 出处只能来自内置知识库条目或用户报告原文。
- 生成标准产检时刻表、疫苗计划或材料清单内容；这些一律来自内置知识库。
- 未经确认自动更改孕周、预产期、提醒或正式健康指标；未经确认自动创建提醒。
- 将用户数据用于模型训练或第三方广告画像。

### 6.4 内置知识库

为了在不依赖模型自由发挥的前提下提供可信解释与日程，项目自建一个小型、可控、随代码版本管理的知识库。

内容范围：

| 类别 | 内容 | 用途 |
|---|---|---|
| 术语解释 | 常见产检项目、检验缩写、病历通用表述的白话说明 | 白话解读的出处来源 |
| 标准孕育日历 | 孕期产检时刻表、0-1 岁国家免疫规划疫苗计划、产后 42 天复查等节点 | 「此刻」下一步 |
| 材料清单 | 各关键节点建议携带的医疗资料与非医疗材料（证件等） | 携带清单 |

实现要求：

- 知识库以结构化数据文件形式存放于仓库（建议 `fixtures/knowledge/`），每条包含：ID、标题、白话说明、适用阶段或孕周区间、来源说明、版本号。
- 来源说明必须为人工整理时核对的公开权威资料名称，由维护者填写，**不由模型生成**。
- 模型只能在给定的知识库候选条目中选择与引用，不得输出候选之外的出处。
- 知识库条目更新不得回溯改变用户已采纳的提醒与已确认的档案内容。
- 知识库不包含任何诊疗建议、用药方案或风险判断内容。
- 客户端展示知识库内容时统一标注：`参考资料，以医生意见为准。`

### 6.5 Provider 接口

后端必须定义三个可替换接口，业务层不得直接依赖具体云厂商或模型厂商 SDK：

| 接口 | 职责 | 首版实现 |
|---|---|---|
| `OcrProvider` | 版面文字识别与字段定位 | 国内 OCR 服务或多模态模型；Mock 必备 |
| `LlmProvider` | 结构化抽取、白话解读、要素抽取、阶段小结 | 国内大模型 API（按量计费 Key）；Mock 必备 |
| `AsrProvider` | 就诊录音转写 | 国内语音识别服务；Mock 必备 |

三者相互独立，允许由同一个多模态模型同时实现 `OcrProvider` 与 `LlmProvider`，但业务层调用点必须分开，便于单独替换与单独降级。

#### OcrProvider

```ts
interface OcrProvider {
  recognize(input: {
    reportId: string;
    sources: Array<{
      attachmentId: string;
      signedReadUrl: string;
      mimeType: string;
      pageOrder: number;
    }>;
  }): Promise<OcrResult>;
}

interface OcrResult {
  provider: string;
  providerRequestId?: string;
  suggestedCategory: ExtractedField<ReportCategory>;
  suggestedSubject?: ExtractedField<"MOTHER" | "BABY">;
  reportTitle?: ExtractedField<string>;
  rawText: string;
  pages: Array<{
    pageNumber: number;
    rawText: string;
    success: boolean;
    errorCode?: string;
  }>;
  reportDate?: ExtractedField<string>;
  institution?: ExtractedField<string>;
  conclusion?: ExtractedField<string>;
  fields: OcrField[];
  tables: OcrTable[];
}

type ReportCategory =
  | "IMAGING"
  | "LAB"
  | "PRENATAL_SPECIAL"
  | "OUTPATIENT_RECORD"
  | "PRESCRIPTION"
  | "INPATIENT_DISCHARGE"
  | "DELIVERY"
  | "POSTPARTUM_CHECK"
  | "NEWBORN_SCREENING"
  | "CHILD_CHECKUP"
  | "VACCINATION"
  | "OTHER";

interface OcrField {
  section?: string;
  label: ExtractedField<string>;
  value?: ExtractedField<string>;
  unit?: ExtractedField<string>;
  referenceRange?: ExtractedField<string>;
  sourceFlag?: ExtractedField<string>;
  fieldType: "KEY_VALUE" | "MEASUREMENT" | "TEXT";
}

interface OcrTable {
  title?: ExtractedField<string>;
  headers: string[];
  rows: Array<Array<ExtractedField<string>>>;
}

interface ExtractedField<T> {
  value: T;
  confidence: number;
  sourceText?: string;
  pageNumber?: number;
  boundingBox?: [number, number, number, number];
}
```

#### LlmProvider

```ts
interface LlmProvider {
  /** 报告结构化抽取：在 OCR 文本或原图基础上产出与 OcrResult 兼容的字段集 */
  extractReport(input: {
    reportId: string;
    rawText?: string;
    sources?: Array<{ signedReadUrl: string; mimeType: string; pageOrder: number }>;
  }): Promise<OcrResult>;

  /** 白话解读：只允许引用报告原文与给定知识库候选 */
  explainReport(input: {
    reportId: string;
    rawText: string;
    fields: OcrField[];
    knowledgeCandidates: KnowledgeEntryRef[];
  }): Promise<PlainExplanation>;

  /** 录音要素抽取 */
  extractVisitNotes(input: {
    recordingId: string;
    transcript: string;
  }): Promise<VisitNoteExtraction>;

  /** 阶段小结：输入为已确认档案的事实集合，输出只允许汇总与引用 */
  summarizeStage(input: {
    familyId: string;
    range: { from: string; to: string };
    facts: StageFactBundle;
  }): Promise<StageSummaryResult>;
}

interface PlainExplanation {
  items: Array<{
    text: string;
    /** 出处二选一，缺失则不得展示该条 */
    sourceReportRef?: { pageNumber: number; sourceText: string };
    knowledgeEntryId?: string;
    confidence: number;
  }>;
  /** 无法解释的项目必须显式列出，不得静默省略 */
  unresolvedLabels: string[];
}

interface VisitNoteExtraction {
  doctorNotes: ExtractedField<string>[];
  medications: Array<{
    name: ExtractedField<string>;
    dosage?: ExtractedField<string>;
    frequency?: ExtractedField<string>;
  }>;
  nextVisit?: {
    scheduledAt?: ExtractedField<string>;
    items?: ExtractedField<string>[];
  };
}

interface StageSummaryResult {
  timeline: Array<{ occurredAt: string; institution?: string; title: string; reportId?: string }>;
  metricTrends: Array<{
    label: string;
    unit?: string;
    points: Array<{ recordedAt: string; value: string; reportId?: string }>;
  }>;
  /** 结论原文汇编，必须逐条标注来源报告 */
  conclusionQuotes: Array<{ reportId: string; quote: string }>;
  doctorNoteDigest: Array<{ eventId: string; text: string }>;
  medicationDigest: Array<{ eventId: string; text: string }>;
  openFollowUps: Array<{ sourceReportId?: string; sourceEventId?: string; description: string }>;
  repeatedExams: Array<{ label: string; count: number; occurrences: string[] }>;
  simplifiedText: string;
}
```

`StageFactBundle` 由后端从数据库组装，只包含已确认记录。模型不得访问数据库，也不得接收待确认内容。

#### AsrProvider

```ts
interface AsrProvider {
  transcribe(input: {
    recordingId: string;
    signedReadUrl: string;
    mimeType: string;
    durationSeconds?: number;
  }): Promise<{
    provider: string;
    providerRequestId?: string;
    transcript: string;
    segments?: Array<{ startMs: number; endMs: number; text: string; confidence?: number }>;
    success: boolean;
    errorCode?: string;
  }>;
}
```

#### 实现要求

- `MockOcrProvider`：至少提供超声、检验、出院记录、宝宝体检和未知类型五类脱敏样本，用于本地开发和测试。
- `MockLlmProvider` 与 `MockAsrProvider`：提供固定脱敏输出，保证无任何密钥时报告归档、录音转写与阶段小结三条流程都能完整演示。
- 云端 Provider 通过环境变量配置，未配置密钥时自动降级到 Mock，不得导致应用无法启动。
- 通用版面识别是必经能力；针对特定报告的增强解析只能作为后处理，失败时必须退回通用结果。
- 每页独立记录识别成功或失败状态，部分页面失败时仍返回其他页面结果。
- 保存原始厂商响应时先去除不需要的身份信息，并限制只有后端服务可访问。
- 同一个报告、同一段录音、同一个小结范围的任务均使用幂等键，避免重复计费。
- 置信度阈值使用配置项，默认 `0.85`，不要散落硬编码。
- **结构化输出必须用共享 Zod Schema 校验**；模型返回不符合 Schema 时按失败处理并重试有限次，不得把非结构化文本直接写入数据库。
- 解读与小结的结果必须落库，作为缓存与可追溯依据；同一输入不得重复调用模型。
- 所有 Provider 调用记录 token 或计费用量、耗时与错误码，便于成本观测。
- 关于 `boundingBox`：多模态模型通常无法给出可靠坐标。首版原图对照精度定为**页级**（点击字段跳转到对应页），`boundingBox` 为可选字段；若接入具备坐标能力的 OCR 服务则可升级为区域高亮，业务逻辑不得依赖其必然存在。

---

## 7. 数据模型

使用 UUID 作为业务主键；所有核心表包含 `createdAt`、`updatedAt`，需要软删除的表增加 `deletedAt`。

### 7.1 核心实体

#### User

- `id`
- `mobileEncrypted`
- `mobileHash`：用于唯一性查找，不保存可逆明文索引
- `displayName`
- `status`
- `lastLoginAt`

#### Family

- `id`
- `name`
- `activePregnancyId?`
- `createdByUserId`
- `deletedAt?`

#### MotherProfile

- `id`
- `familyId`
- `linkedUserId?`：妈妈本人注册后可关联；不得假设创建家庭的人就是妈妈
- `displayName?`
- `dateOfBirth?`
- `deletedAt?`

#### FamilyMember

- `id`
- `familyId`
- `userId`
- `relation`
- `role`
- `status`
- 唯一约束：`familyId + userId`

#### FamilyInvite

- `id`
- `familyId`
- `invitedByUserId`
- `tokenHash`
- `relation`
- `role`
- `expiresAt`
- `acceptedAt?`
- `revokedAt?`

#### Pregnancy

- `id`
- `familyId`
- `motherProfileId`
- `lastMenstrualDate?`
- `dueDate?`
- `deliveryDate?`
- `status`：`PLANNING | PREGNANT | DELIVERED | CLOSED`
- `planningStartedAt?`：备孕开始时间，可选
- `notes?`

数据层支持一个家庭多个孕期；MVP 客户端展示当前母婴生命周期及与当前宝宝关联的历史孕期，不提供多个独立孕期档案的主动切换入口。

备孕阶段复用同一实体：建档选择“备孕中”时创建 `status = PLANNING` 记录；确认怀孕后同一条记录流转为 `PREGNANT` 并补充日期，备孕期归档的报告与事件通过 `pregnancyId` 保持关联，不得重建记录或断开关系。

#### Baby

- `id`
- `familyId`
- `pregnancyId?`
- `motherProfileId`
- `nickname?`
- `birthDate`：宝宝档案创建后必填；胎儿阶段信息保存在孕期档案，不提前创建缺少出生日期的宝宝档案
- `sex?`：可选，允许未知或不填写

#### Event

- `id`
- `familyId`
- `pregnancyId?`
- `motherProfileId?`
- `babyId?`
- `stage`：`PRECONCEPTION | PREGNANCY | DELIVERY | POSTPARTUM | BABY_0_1 | FAMILY`
- `type`：`PRENATAL_CHECK | MEDICAL_REPORT | SYMPTOM | MEDICATION | DOCTOR_NOTE | VISIT_RECORDING | DELIVERY | POSTPARTUM_CHECK | BABY_CHECKUP | NEWBORN_SCREENING | VACCINATION | ILLNESS_VISIT | MILESTONE | OTHER`
- `title`
- `occurredAt`
- `location?`
- `notes?`
- `costAmount?`：就诊花费金额，可选
- `costNote?`：费用说明，可选
- `source`：`MANUAL | REPORT_IMPORT | BULK_IMPORT | VOICE_IMPORT | HEALTH_RECORD | SYSTEM`
- `createdByUserId`
- `deletedAt?`

费用字段只做轻量留档，服务用户报销备查。不实现发票识别、报销状态流转和账目统计报表。

#### Attachment

- `id`
- `familyId`
- `eventId?`
- `storageKey`
- `originalFileName`
- `mimeType`
- `sizeBytes`
- `sha256`
- `status`
- `uploadedByUserId`
- `deletedAt?`

#### Report

- `id`
- `familyId`
- `pregnancyId?`
- `motherProfileId?`
- `babyId?`
- `eventId?`
- `status`
- `category?`：使用 `ReportCategory`，无法分类时为 `OTHER`
- `title?`
- `reportDate?`
- `institution?`
- `conclusion?`
- `rawText?`
- `ocrProvider?`
- `ocrRequestId?`
- `confirmedAt?`
- `confirmedByUserId?`
- `importBatchId?`：来自存量批量导入时关联批次
- `explanationJson?`：白话解读结果（含每条出处引用），落库缓存
- `explanationGeneratedAt?`
- `revision`

#### ReportAttachment

- `id`
- `reportId`
- `attachmentId`
- `pageOrder`
- 唯一约束：`reportId + attachmentId`

一个报告可以关联多张图片或一个多页 PDF；`pageOrder` 保存用户确认的顺序。

#### ReportField

- `id`
- `reportId`
- `section?`
- `label`
- `value?`
- `unit?`
- `referenceRange?`
- `sourceFlag?`：只保留原报告中的高、低、异常标记
- `fieldType`：`KEY_VALUE | MEASUREMENT | TEXT | TABLE_CELL`
- `tableName?`
- `rowIndex?`
- `columnIndex?`
- `columnLabel?`
- `confidence?`
- `sourceText?`
- `pageNumber?`
- `boundingBox?`
- `verifiedByUser`
- `syncedHealthRecordType?`
- `syncedHealthRecordId?`
- `sortOrder`

报告字段采用动态结构，不为每一种医院报告建立独立数据表。只有用户确认同步的测量字段才写入健康记录，并通过同步字段防止重复写入。

#### ImportBatch

- `id`
- `familyId`
- `status`：`IN_PROGRESS | PARTIALLY_CONFIRMED | COMPLETED | ABANDONED`
- `totalCount`
- `confirmedCount`
- `failedCount`
- `startedAt`
- `finishedAt?`
- `createdByUserId`

批次只记录进度，报告本体仍存于 `Report`。批次被放弃时已确认的报告保持有效，不做级联删除。

#### VisitRecording

- `id`
- `familyId`
- `pregnancyId?`
- `motherProfileId?`
- `babyId?`
- `eventId?`：确认后关联的正式事件
- `attachmentId`：音频文件
- `status`：`RECORDING | UPLOADING | TRANSCRIBING | EXTRACTING | NEEDS_REVIEW | CONFIRMED | FAILED`
- `source`：`IN_APP | IMPORTED`
- `durationSeconds?`
- `recordedAt`
- `transcript?`：转写全文
- `transcriptSegmentsJson?`
- `extractionJson?`：医嘱、用药、下次检查的抽取结果与置信度
- `asrProvider?`
- `asrRequestId?`
- `llmProvider?`
- `llmRequestId?`
- `confirmedAt?`
- `confirmedByUserId?`
- `deletedAt?`

音频与转写文本均属最高敏感级：私有存储、短时签名访问、禁止进入日志、禁止用于训练。确认后抽取出的叮嘱、用药与下次检查通过事件、用药记录和提醒承载，并保留对本条录音的来源引用。

#### StageSummary

- `id`
- `familyId`
- `rangeFrom`
- `rangeTo`
- `rangePreset?`：`LAST_1M | LAST_3M | LAST_6M | WHOLE_PREGNANCY | SINCE_BIRTH | CUSTOM`
- `status`：`GENERATING | READY | STALE | FAILED`
- `resultJson?`：六个分区的结构化结果
- `simplifiedText?`：供口头转述的简化版
- `sourceFingerprint`：参与生成的已确认记录集合指纹，用于判断是否需要重算
- `llmProvider?`
- `llmRequestId?`
- `generatedAt?`
- `createdByUserId`

小结只读取已确认记录。范围内的已确认记录发生新增、修改或删除时，通过指纹比对将状态置为 `STALE`，下次查看时重算，不得每次查看都调用模型。

#### KnowledgeEntry

内置知识库条目，随代码版本管理，不由用户创建，也不由模型生成。

- `id`：稳定业务 ID，供解读引用
- `category`：`TERM | CALENDAR_ITEM | CHECKLIST_ITEM`
- `title`
- `plainText`：白话说明
- `stage?`：适用阶段
- `gestationalWeekFrom?` / `gestationalWeekTo?`：适用孕周区间
- `babyMonthAge?`：适用月龄
- `checklistKind?`：`MEDICAL | DOCUMENT`
- `sourceNote`：人工整理时核对的公开权威资料名称
- `version`

可以以数据文件形式随应用分发或在启动时载入数据库，但必须版本化且可追溯。知识库更新不得回溯改变用户已采纳的提醒和已确认的档案内容。

#### MotherHealthRecord

- `id`
- `familyId`
- `motherProfileId`
- `pregnancyId?`
- `eventId`
- `sourceReportId?`
- `sourceRecordingId?`
- `measurementSource`：`MANUAL | REPORT_SYNC | HOME_MONITOR`
- `stage`：`PREGNANCY | POSTPARTUM`
- `recordType`：`MEASUREMENT | SYMPTOM | CHECKUP`
- `recordedAt`
- `weightValue?`
- `weightUnit?`
- `systolic?`
- `diastolic?`
- `bloodGlucoseValue?`
- `bloodGlucoseUnit?`
- `fetalMovementCount?`
- `fetalHeartRate?`：居家或产检记录的胎心值
- `temperatureValue?`
- `temperatureUnit?`
- `symptoms?`
- `createdByUserId`

`eventId` 对单条妈妈健康记录唯一。创建、编辑和删除健康记录时同步维护关联事件，不能复制同一组数值到事件表。

居家监测（体重、血压、胎心等用户自行测量的数据）复用本表，通过 `measurementSource = HOME_MONITOR` 区分，**不建立第二套居家数据表**。趋势图按来源标记区分展示，但属于同一条数据链。

#### BabyGrowthRecord

- `id`
- `familyId`
- `babyId`
- `eventId`
- `sourceReportId?`
- `recordType`：`BIRTH | MEASUREMENT | CHECKUP | MILESTONE`
- `recordedAt`
- `weightValue?`
- `weightUnit?`
- `heightValue?`
- `heightUnit?`
- `headCircumferenceValue?`
- `headCircumferenceUnit?`
- `milestoneType?`
- `notes?`
- `createdByUserId`

`eventId` 对单条宝宝成长记录唯一。事件只保存索引和展示信息，结构化数值以 `BabyGrowthRecord` 为唯一来源。

#### VaccinationRecord

- `id`
- `familyId`
- `babyId`
- `eventId`
- `sourceReportId?`
- `vaccineName`
- `doseNumber?`
- `vaccinatedAt`
- `institution?`
- `batchNumber?`
- `nextDueAt?`
- `notes?`
- `createdByUserId`

疫苗记录以用户输入或已确认资料为准。`nextDueAt` 只能来自用户输入或报告明确日期，不由系统自行推断接种计划。
`eventId` 对单条疫苗记录唯一，结构化接种信息以 `VaccinationRecord` 为唯一来源。

#### Reminder

- `id`
- `familyId`
- `pregnancyId?`
- `motherProfileId?`
- `babyId?`
- `relatedEventId?`
- `type`
- `title`
- `scheduledAt`
- `status`：`PENDING | COMPLETED | CANCELLED`
- `completedAt?`
- `createdByUserId`

#### ConsentRecord

- `id`
- `userId`
- `familyId?`
- `consentType`
- `documentVersion`
- `grantedAt`
- `withdrawnAt?`
- `ipMasked?`
- `userAgentSummary?`

#### AuditLog

- `id`
- `familyId?`
- `actorUserId?`
- `action`
- `resourceType`
- `resourceId?`
- `metadataSanitized?`
- `createdAt`

审计日志不得保存报告正文、手机号、文件内容和完整健康指标。

---

## 8. API 约定

### 8.1 基础规则

- API 前缀：`/api/v1`
- JSON 字段使用 `camelCase`。
- 时间使用 ISO 8601 UTC 字符串。
- 列表统一使用游标分页：`cursor`、`limit`、`nextCursor`。
- 错误结构统一：

```json
{
  "error": {
    "code": "REPORT_NOT_READY",
    "message": "报告仍在识别中",
    "requestId": "req_xxx",
    "fieldErrors": []
  }
}
```

- 服务端必须校验资源所属家庭和当前成员角色。
- 创建类请求支持 `Idempotency-Key`。
- 删除默认软删除；导出和账号删除任务除外。

### 8.2 MVP 接口清单

#### 认证与用户

- `POST /auth/request-code`
- `POST /auth/verify-code`
- `POST /auth/dev-login`：仅非生产环境
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /me`
- `PATCH /me`

#### 家庭与成员

- `POST /families`
- `GET /families`
- `GET /families/:familyId`
- `PATCH /families/:familyId`
- `GET /families/:familyId/members`
- `POST /families/:familyId/invites`
- `POST /invites/:token/accept`
- `PATCH /families/:familyId/members/:memberId`
- `DELETE /families/:familyId/members/:memberId`

#### 孕期与宝宝

- `POST /families/:familyId/mother-profiles`
- `GET /families/:familyId/mother-profiles`
- `GET /mother-profiles/:motherProfileId`
- `PATCH /mother-profiles/:motherProfileId`
- `POST /families/:familyId/pregnancies`
- `GET /families/:familyId/pregnancies`
- `GET /pregnancies/:pregnancyId`
- `PATCH /pregnancies/:pregnancyId`
- `POST /families/:familyId/babies`
- `GET /babies/:babyId`
- `PATCH /babies/:babyId`

#### 时间轴事件

- `POST /families/:familyId/events`
- `GET /families/:familyId/events`
- `GET /events/:eventId`
- `PATCH /events/:eventId`
- `DELETE /events/:eventId`
- `GET /families/:familyId/search`

#### 附件与报告

- `POST /families/:familyId/attachments/presign-upload`
- `POST /families/:familyId/attachments/complete`
- `POST /families/:familyId/reports`
- `POST /reports/:reportId/recognize`
- `GET /reports/:reportId`
- `PATCH /reports/:reportId/draft`
- `POST /reports/:reportId/confirm`
- `POST /reports/:reportId/retry`
- `GET /reports/:reportId/explanation`：白话解读及每条出处；结果落库缓存，不重复调用模型

#### 存量批量导入

- `POST /families/:familyId/import-batches`
- `GET /families/:familyId/import-batches`
- `GET /import-batches/:batchId`：批次进度与逐份状态
- `POST /import-batches/:batchId/reports`：向批次追加报告，支持 `Idempotency-Key`
- `POST /import-batches/:batchId/abandon`

#### 就诊录音

- `POST /families/:familyId/visit-recordings`：创建录音记录并取得上传凭证
- `POST /visit-recordings/:recordingId/transcribe`
- `GET /visit-recordings/:recordingId`
- `PATCH /visit-recordings/:recordingId/draft`：修订抽取出的医嘱、用药与下次检查
- `POST /visit-recordings/:recordingId/confirm`
- `POST /visit-recordings/:recordingId/retry`
- `DELETE /visit-recordings/:recordingId`

`POST /visit-recordings/:recordingId/confirm` 在同一事务中完成：录音确认、医生嘱咐事件创建、用药记录写入，以及用户采纳的提醒或携带清单项创建。

#### 阶段小结

- `POST /families/:familyId/stage-summaries`：按时间范围生成，命中未失效缓存时直接返回
- `GET /families/:familyId/stage-summaries`
- `GET /stage-summaries/:summaryId`
- `POST /stage-summaries/:summaryId/refresh`：状态为 `STALE` 时重算

#### 「此刻」与标准日历

- `GET /families/:familyId/now`：当前节点、下一步（合并标准日历与个人记录）、携带清单、轨迹一瞥、最近就诊
- `GET /families/:familyId/care-calendar`：匹配当前阶段的标准日程与材料清单条目
- `POST /families/:familyId/care-calendar/:entryId/adopt`：把标准日程转为用户自己的提醒
- `GET /knowledge-entries/:entryId`：知识库条目详情，供解读出处跳转

#### 健康与成长

- `GET /families/:familyId/health-overview`
- `POST /mother-profiles/:motherProfileId/health-records`
- `GET /mother-profiles/:motherProfileId/health-records`：支持 `stage=PREGNANCY|POSTPARTUM`
- `PATCH /mother-health-records/:recordId`
- `DELETE /mother-health-records/:recordId`
- `POST /babies/:babyId/growth-records`
- `GET /babies/:babyId/growth-records`
- `PATCH /baby-growth-records/:recordId`
- `DELETE /baby-growth-records/:recordId`
- `POST /babies/:babyId/vaccination-records`
- `GET /babies/:babyId/vaccination-records`
- `PATCH /vaccination-records/:recordId`
- `DELETE /vaccination-records/:recordId`

`POST /reports/:reportId/confirm` 的请求体同时携带所属主体、事件信息和需要同步到健康记录的已确认字段 ID；服务端在同一事务中完成报告确认、事件关联和健康记录同步，避免重复数据。

#### 提醒

- `POST /families/:familyId/reminders`
- `GET /families/:familyId/reminders`
- `PATCH /reminders/:reminderId`
- `POST /reminders/:reminderId/complete`
- `POST /reminders/:reminderId/cancel`

#### 隐私与数据

- `GET /me/consents`
- `POST /me/consents`
- `POST /families/:familyId/exports`
- `GET /exports/:exportId`
- `POST /me/deletion-requests`
- `POST /families/:familyId/deletion-requests`

---

## 9. 技术方案

### 9.1 固定技术栈

为降低多端切换成本，MVP 使用 TypeScript 全栈：

- 移动端：React Native + Expo + TypeScript。
- 导航：Expo Router。
- 服务端状态：TanStack Query。
- 本地表单：React Hook Form + Zod。
- API：NestJS + TypeScript。
- ORM 与迁移：Prisma。
- 数据库：PostgreSQL。
- 对象存储：本地 MinIO，生产使用兼容 S3 API 的国内对象存储。
- 智能能力：通过 `OcrProvider` / `LlmProvider` / `AsrProvider` 接入。**首版使用国内大模型与语音服务的 API Key（按量计费）**，不接入境外服务，避免健康数据跨境传输；不自训练医疗模型。
- 录音：Expo 音频能力录制，编码选择在移动端稳定且体积可控的格式；上传前不做有损再压缩。
- API 契约：共享 Zod Schema，并生成 OpenAPI 文档；模型的结构化输出同样用 Zod 校验。
- 图表：选择支持 React Native 的稳定图表库，封装在单独组件中。
- 测试：Vitest/Jest、React Native Testing Library、Supertest。
- 代码规范：ESLint + Prettier + TypeScript strict mode。

初始化时使用当前稳定版本并提交锁文件，不在业务代码中依赖实验性 API。

### 9.2 Monorepo 结构

```text
芽纪/
  apps/
    mobile/                 # Expo React Native
    api/                    # NestJS API
  packages/
    contracts/              # Zod schema、DTO、共享枚举
    config/                 # ESLint、TypeScript 等共享配置
    ui/                     # 少量通用移动端 UI 组件
  prisma/
    schema.prisma
    migrations/
    seed.ts
  infra/
    docker-compose.yml      # PostgreSQL、MinIO
  fixtures/
    ocr/                    # 脱敏 OCR 测试样本和固定响应
    asr/                    # 脱敏录音转写样本和固定响应
    knowledge/              # 内置知识库：术语解释、标准孕育日历、材料清单
  docs/
    product-baseline.md
    ux-spec.md
    architecture.md
    openapi.yaml
    privacy-data-map.md
    traceability-matrix.md
    test-report.md
    release-checklist.md
    deployment-runbook.md
    rollback-and-recovery.md
    backlog.md
  PROJECT_PLAN.md
  .env.example
  package.json
  pnpm-workspace.yaml
  README.md
```

### 9.3 本地运行要求

README 必须提供可以直接执行的流程，目标命令如下：

```bash
pnpm install
docker compose -f infra/docker-compose.yml up -d
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

至少提供这些环境变量：

```dotenv
NODE_ENV=development
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
STORAGE_ENDPOINT=
STORAGE_REGION=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_FORCE_PATH_STYLE=true
OCR_PROVIDER=mock
OCR_CONFIDENCE_THRESHOLD=0.85
LLM_PROVIDER=mock
LLM_API_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
LLM_MAX_OUTPUT_TOKENS=
ASR_PROVIDER=mock
ASR_API_BASE_URL=
ASR_API_KEY=
ASR_MODEL=
AI_DAILY_COST_LIMIT=
KNOWLEDGE_PACK_VERSION=
SMS_PROVIDER=mock
DEV_SMS_CODE=123456
APP_TIMEZONE=Asia/Shanghai
```

生产环境启动时如果检测到 `SMS_PROVIDER=mock`、弱 JWT 密钥或开发登录开启，必须直接失败并输出明确错误。

`LLM_PROVIDER` 或 `ASR_PROVIDER` 为 `mock` 时应用仍可完整运行，但客户端必须明确标示当前为演示模式，不得让用户误以为得到了真实解读。

### 9.4 搜索实现

MVP 不引入 Elasticsearch。使用 PostgreSQL 完成：

- 事件类型、阶段和日期使用普通索引筛选。
- 标题、备注、医院、报告标题、原文结论和已确认 OCR 全文使用 PostgreSQL 全文检索或 `pg_trgm`。
- 搜索结果只返回 `CONFIRMED` 报告。

### 9.5 异步任务

MVP 可使用数据库任务表和单独 Worker 处理 OCR、录音转写、要素抽取、阶段小结、导出与删除任务，不强制引入 Redis。

任务必须包含：状态、尝试次数、下次重试时间、幂等键、最后错误码。第三方服务超时采用有限次数指数退避，不能无限重试。

### 9.6 AI 调用成本与缓存

用户对模型使用成本敏感，且批量导入与阶段小结是 token 密集操作，必须在设计阶段就控制：

- **结果一律落库**：报告抽取结果、白话解读、录音转写与要素抽取、阶段小结都持久化，相同输入不重复调用。
- **小结按指纹缓存**：`StageSummary.sourceFingerprint` 由参与生成的已确认记录集合计算；指纹未变时直接返回缓存。
- **批量导入分级处理**：批量导入默认只做基础字段粗识别，白话解读按需触发（用户打开某份报告时才生成），不在导入时对全部报告生成解读。
- **转写与抽取分离**：录音转写成功后单独触发要素抽取，避免转写重试导致重复抽取计费。
- **用量可观测**：每次 Provider 调用记录 token 或计费用量、耗时与错误码；提供按日汇总，便于发现异常消耗。
- **成本上限保护**：通过 `AI_DAILY_COST_LIMIT` 配置日调用上限；触达上限时降级为“仅归档不解读”，并明确提示用户，不得静默失败。
- **失败不重复计费**：所有模型调用使用幂等键；结构化校验失败的重试次数有限且计入用量统计。

---

## 10. 安全、隐私与合规要求

这些要求是产品和工程底线，但不能仅凭代码完成就宣称产品已经通过法律合规审查。

### 10.1 数据安全

- 全部网络请求使用 TLS；生产环境拒绝明文 HTTP。
- 手机号和可识别身份字段使用应用层加密，另存不可逆哈希用于查找。
- 对象存储 Bucket 必须私有，查看附件使用短时签名 URL。
- 数据库备份加密，并限制运维人员访问。
- 不在日志中记录访问令牌、验证码、手机号、报告原文、OCR 原文、录音音频、转写文本和健康指标。
- 错误上报只携带错误码、请求 ID 和脱敏上下文。
- 上传文件检查 MIME、文件头、扩展名和大小；预留恶意文件扫描接口。
- 就诊录音音频与转写文本按最高敏感级处理：私有存储、短时签名访问、导出时包含在用户数据内、删除时一并清理。

### 10.2 用户授权

- 登录协议同意、敏感健康信息处理、AI 处理、家庭共享分别记录，不能合并为一个不可区分的布尔值。
- OCR、LLM 或 ASR 服务首次处理报告或录音前，明确告知处理目的和服务类型，并取得单独同意。
- 用户撤回家庭共享后停止新的共享访问，但依法需要保留的审计记录除外。
- 未经用户主动操作，不向家庭外人员、广告平台或训练平台传输健康数据。

### 10.2b 数据出境与模型选择

- **首版只接入境内模型与语音服务**，健康数据不出境。这是范围内的硬性约束，不是可选优化。
- 若将来需要接入境外模型，必须先完成合规评估并取得用户单独授权，且通过 Provider 配置切换实现，业务代码不得改动。
- 与模型服务商的约定必须明确不使用用户数据训练；无法获得该保证的服务不得接入生产环境。
- 传给模型的内容遵循最小必要：只发送当前任务所需的报告文本、字段或已确认事实集合，不发送整库档案、手机号和家庭成员身份信息。
- 阶段小结传入的事实集合在服务端组装，模型不得直接访问数据库。

### 10.2c 产品内信任承诺

以下三条必须在产品内以用户可读的明文条款展示，并与实际实现一致：

1. 数据加密存储，敏感信息不进日志与公开链接。
2. 绝不用于模型训练，不向广告或画像平台提供。
3. 随时完整导出，删除即删除；即使服务终止，用户可带走全部数据。

不得在产品内宣称超出实现的安全能力，例如不得宣称即时物理擦除备份。

### 10.3 医疗边界

- 产品定位为记录与整理工具，不是医疗器械或诊疗服务。
- 任何“异常”标记只能来自原报告明确标记，并展示来源。
- 所有 AI 摘要附近显示固定提示：`AI 整理结果仅供记录，请以原始报告和医生意见为准。`
- 阶段小结固定提示：`小结仅汇总您的档案记录，不构成医学结论，请以医生意见为准。`
- 标准日历与材料清单固定提示：`参考日程，以医生安排为准。`
- 当字段无法确认时显示“不确定，请核对原报告”，不得猜测补全。
- 白话解读、要素抽取和阶段小结的输出必须经过越界表达检查；出现诊断性、建议性或评价医生的措辞按 P1 缺陷处理。

---

## 11. 非功能要求

### 11.1 性能

- 普通 API 在本地基准环境下，排除上传、OCR、转写和模型调用后，P95 响应时间目标小于 500 ms。
- 「此刻」首页接口必须在一次请求内返回节点、下一步、携带清单与轨迹一瞥，不要求客户端串行多次请求。
- 档案时间轴首屏默认加载 20 条，滚动分页，不一次性加载全部附件。
- 图片上传前生成客户端预览图；原图不被有损覆盖。
- 签名下载 URL 默认 10 分钟失效。
- 模型相关操作（解读、转写、抽取、小结）一律异步执行并可后台继续，不得阻塞界面；缓存命中时直接返回。
- 阶段小结在缓存命中时应即时返回；需要重算时明确展示生成中状态。

### 11.2 可靠性

- 创建事件、确认报告、确认录音、追加导入批次、接受邀请、完成提醒必须具备幂等保护。
- OCR、转写、抽取、小结、导出和删除任务可在进程重启后继续。
- 数据库迁移支持从空库完整执行。
- 附件上传完成前不创建可见的正式事件。
- 录音在应用切后台或来电中断时不得丢失已录制部分。
- 批量导入批次进度必须持久化，中断后可续。

### 11.3 可观测性

- 每个请求生成 `requestId`。
- 记录接口耗时、错误码、OCR / 转写 / 抽取 / 小结成功率、任务积压和重试次数。
- 记录模型调用用量（token 或计费单位）、耗时与按日成本汇总。
- 业务分析只使用匿名事件，例如 `report_confirmed`，不携带报告字段、转写文本和健康数值。

### 11.4 可访问性

- 表单控件有明确标签，不能只靠占位文字。
- 颜色不作为错误和状态的唯一表达方式。
- 图表同时提供数值列表，方便辅助技术读取。

---

## 12. 项目执行总计划

### 12.1 总体原则

项目只划分为四个大步骤：

```text
整体设计与可复用原型
        -> 全量开发
        -> 系统测试与集中修复
        -> 发布验收与交付
```

四个步骤的目的不是重复制作多个版本，而是在高成本工作开始前确认关键决策。具体原则如下：

- 只维护一套最终代码库、一套数据模型和一套 API 契约。
- 原型直接在最终 Expo 移动端工程中实现，后续替换数据源和补充业务逻辑，不重新搭建界面。
- 全量开发是一个连续大步骤。内部功能包仅按依赖顺序完成，不分别立项、不分别设计、不创建互不兼容的临时方案。
- 自动化测试伴随开发同步编写；第三个大步骤用于系统级验证、集中回归和缺陷修复，不是第一次开始测试。
- 只有一个强制产品确认点：大步骤一结束时确认全部页面、流程和字段。确认后，除安全或阻塞问题外，不反复询问普通实现细节。
- 新想法先进入 P1 待办，不在开发中途改变 MVP；确需变更时执行第 12.7 节的变更控制。

### 12.2 大步骤一：整体设计与可复用原型

#### 目标

在正式业务开发前，一次性确认用户看到什么、如何操作、系统保存什么、接口如何交换数据。此步骤产出的原型和工程骨架必须被后续直接复用，不能做成一次性演示项目。

#### 工作内容

1. **需求基线整理**
   - 以本文第 1-11 节为唯一需求来源。
   - 建立需求编号，例如 `AUTH-001`、`EVENT-001`、`REPORT-001`。
   - 创建需求追踪矩阵：每项需求对应页面、接口、数据实体、权限和测试用例。

2. **信息架构与完整交互原型**
   - 在最终 `apps/mobile` 中建立正式路由、设计 Token 和通用组件。
   - 使用脱敏 Fixture 数据完成第 4.2 节全部 MVP 页面。
   - 走通第 13.2 节全部主流程，含三阶段极简建档、存量批量导入、就诊录音与转写确认、报告确认与白话解读、阶段小结、标准日历转提醒、居家监测、分娩衔接、产后与宝宝记录、伴侣共享、导出删除。
   - 每个页面同时设计加载、空数据、失败、无权限和删除失效状态。
   - 重点确认报告原图对照、低置信度字段修订、时间轴信息密度和家庭权限提示。

3. **技术总体设计**
   - 创建 monorepo、Expo、NestJS、Prisma 和共享契约骨架。
   - 完成最终版 Prisma 核心实体及关系设计。
   - 完成 OpenAPI 初始契约，覆盖第 8.2 节全部接口。
   - 确定认证、权限、对象存储、OCR Provider、异步任务、导出和删除的处理方式。
   - 输出架构图、数据流图、权限校验流程和敏感数据地图。

4. **测试设计**
   - 将第 5 节验收条件和第 13 节测试要求转成可执行测试清单。
   - 准备超声、检验、出院/分娩、宝宝体检、未知类型、多页部分失败等 Mock OCR 样本，Mock ASR 录音样本，以及低置信度样本和权限测试账号。
   - 建立内置知识库初始条目（术语解释、标准孕育日历、材料清单），并确认每条来源说明由人工填写。
   - 确定 P0、P1、P2、P3 缺陷等级和发布阻断规则。

#### 必须交付

- 可在 Android 和 iOS 模拟器打开的完整交互原型，代码位于最终 `apps/mobile`。
- `docs/product-baseline.md`：需求编号和范围基线。
- `docs/ux-spec.md`：页面、流程、组件、字段和状态说明。
- `docs/architecture.md`：系统结构、关键技术决策和数据流。
- `docs/openapi.yaml` 或由代码生成的同等 OpenAPI 契约。
- `docs/privacy-data-map.md`：敏感数据、用途、存储位置和访问者。
- `docs/traceability-matrix.md`：需求到页面、接口、数据、测试的映射。
- Prisma Schema 初稿、共享枚举与 Zod Schema。
- `PROJECT_PLAN.md`：全项目唯一执行清单和当前状态。

#### 唯一的产品确认点

进入全量开发前，由用户一次性确认：

- 底部导航、全部页面和主流程是否符合预期。
- 「此刻」首页、报告确认页（含白话解读与出处）、阶段小结页和健康趋势页的信息是否足够清晰。
- 极简建档、存量批量导入与就诊录音的流程是否足够轻、足够顺。
- 表单字段、费用记录、家庭权限选项是否正确。
- AI 四层边界（只做解释与事实提示）是否继续保持。
- 明确不做与 P1 功能是否继续保持排除。

此确认只针对产品和交互，不要求用户判断底层技术。确认后锁定页面结构、字段语义、权限矩阵、数据实体和 API 主路径。

#### 完成标准

- 所有 MVP 页面都能在真实最终工程中点击走通，没有断路或假按钮。
- 页面、API、数据实体和测试之间不存在无归属项。
- 技术方案能覆盖全部需求，没有等开发到一半才决定的核心架构问题。
- 原型通过一次产品确认，并记录冻结日期和允许调整的例外项。

### 12.3 大步骤二：全量开发

#### 目标

在已确认的原型和契约上，一次性完成全部 MVP 的真实业务能力。开发过程中持续保持应用可启动、迁移可执行和测试可运行。

#### 工作方式

- 不采用“先写完全部前端，再写全部后端”的方式。
- 每个功能包同时完成移动端、API、数据库、权限、错误状态和自动化测试，再继续下一个功能包。
- 原型组件直接接入真实 API，不重新制作第二套页面。
- Prisma Schema 和 OpenAPI 已在大步骤一确定；开发中以向后兼容、增量迁移为主。
- `packages/contracts` 是前后端字段和枚举的唯一来源，禁止复制两套 DTO。
- 每完成一个功能包就运行相关测试，但不把它包装成独立版本或要求用户重复验收。

#### 内部执行顺序

以下是依赖顺序，不是七个项目阶段：

1. **公共基础**
   - 工作区脚本、环境配置、PostgreSQL、MinIO、迁移和种子数据。
   - 统一错误、日志脱敏、请求 ID、鉴权、权限守卫和审计框架。
   - Mock SMS、Mock OCR、Mock LLM、Mock ASR、任务 Worker 和对象存储适配层。
   - 知识库载入机制与版本管理。

2. **账号与家庭主线**
   - 登录、令牌刷新、退出、三阶段极简建档（备孕 / 怀孕中 / 已出生）。
   - 家庭、成员、妈妈档案、孕期（含 `PLANNING` 流转）、分娩衔接和宝宝基础数据。
   - 服务端权限校验；邀请只暴露可查看 / 可编辑。

3. **档案主闭环**
   - 档案时间轴、手动事件、费用字段、附件上传、筛选和搜索。
   - 任意报告草稿、通用 OCR、多页状态、动态字段、未知类型回退、逐项确认、失败重试和正式归档。
   - 存量批量导入：批次管理、逐份粗识别、列表式确认、中断续传。
   - 白话解读与出处引用、建议下一步的采纳流程。
   - 原始附件、OCR 原文、修订字段和正式事件的可追溯关系。

4. **就诊录音闭环**
   - 一键录音、音频导入、上传、转写、要素抽取、确认入档。
   - 确认事务：叮嘱事件、用药记录、提醒或携带清单项与来源录音的关联。
   - 转写与抽取失败的降级与手动补录。

5. **「此刻」与持续使用能力**
   - 「此刻」聚合接口：节点、下一步、携带清单、轨迹一瞥、最近就诊。
   - 标准孕育日历与材料清单匹配、一键转提醒。
   - 妈妈孕期及产后健康、居家监测录入、宝宝 0-1 岁成长、体检、疫苗、里程碑、图表和数值列表。
   - 健康记录与时间轴单一数据源及报告字段确认同步。
   - 一次性提醒、本地通知、完成和取消。

6. **阶段小结**
   - 事实集合组装、模型汇总、六分区结果、简化版。
   - 指纹缓存与 `STALE` 失效重算、未闭环项转提醒。

7. **家庭协作与隐私闭环**
   - 邀请、接受、移除和最后所有者保护。
   - 授权记录（含 AI 处理同意）、信任承诺页、JSON 与附件 ZIP 导出（含录音）、账号和家庭删除任务。
   - 审计日志和私有下载链接。

8. **全功能连接检查**
   - 移除仅供原型使用的 Fixture 数据入口。
   - 检查所有可见按钮都有真实行为或被明确标记为 P1 且不展示。
   - 检查 Android 与 iOS 的路由、权限、录音、上传和通知行为。
   - 检查 AI 输出的越界表达与出处完整性。

#### 必须交付

- 第 3.1 节全部 MVP 功能的可运行实现。
- 可从空数据库执行的完整迁移和脱敏种子数据。
- Mock Provider 下无需任何付费密钥即可运行的完整环境。
- 实际接口与 OpenAPI 一致。
- 单元测试、API 集成测试和关键组件测试随代码完成。
- README、`.env.example`、本地启动和故障排查说明。

#### 完成标准

- 第 5 节所有核心业务流程可使用真实 API 完整走通。
- 移动端、API、数据库、对象存储、Worker 和 Mock OCR 不依赖手工修改数据。
- `pnpm lint`、`pnpm typecheck`、相关自动化测试和构建通过。
- 需求追踪矩阵中所有 MVP 项都标记为“已实现”或有明确阻塞记录。
- 不存在为赶进度写入正式分支、却计划以后整体重写的临时代码路径。

### 12.4 大步骤三：系统测试与集中修复

#### 目标

从完整产品而不是单个功能角度验证业务正确性、数据安全、跨端一致性和可发布性，并在同一轮中完成缺陷修复与回归。

#### 工作内容

1. **自动化全量验证**
   - 运行 lint、类型检查、单元测试、API 集成测试、契约测试和构建。
   - 从空库重新执行迁移和种子脚本。
   - 验证 OCR、导出和删除任务重试及进程重启恢复。

2. **端到端业务测试**
   - 在 Android 和 iOS 模拟器逐条执行第 13.2 节场景。
   - 补充跨家庭隔离、邀请过期、附件失败、OCR 失败和网络中断场景。
   - 验证每个页面的加载、空数据、失败、无权限和失效状态。

3. **安全与隐私测试**
   - 检查越权访问、令牌失效、签名 URL 过期和最后所有者保护。
   - 扫描日志、错误报告、测试快照和分析事件中的敏感数据。
   - 验证生产环境不能启用 Mock SMS、开发登录和弱密钥。
   - 检查报告未经确认不会出现在正式档案或趋势中。

4. **性能与稳定性测试**
   - 验证时间轴分页、妈妈/宝宝筛选、搜索、多页报告上传和图片列表内存占用。
   - 验证普通 API P95 目标及任务积压监控。
   - 至少执行一次备份与恢复演练。

5. **集中修复与完整回归**
   - P0：数据泄露、数据损坏、核心流程完全不可用，立即阻断。
   - P1：核心流程错误、权限错误、频繁崩溃，发布前必须清零。
   - P2：有替代路径的功能或明显体验问题，原则上发布前修复；未修复必须登记。
   - P3：轻微视觉或文案问题，可进入发布后清单。
   - 每次修复增加对应回归测试，避免同类问题再次出现。

#### 必须交付

- `docs/test-report.md`：测试范围、环境、结果和失败证据。
- 缺陷清单及关闭状态。
- Android、iOS 关键页面与主流程截图。
- 权限、安全、敏感日志和备份恢复检查结果。
- 最新需求追踪矩阵，每项都有测试结论。

#### 完成标准

- P0、P1 缺陷为 0。
- P2 缺陷已修复，或由用户明确接受并记录影响和替代路径。
- 全量自动化检查通过，第 13.2 节全部人工主流程通过。
- Android 与 iOS 均无阻断性差异。
- 满足第 14 节除发布材料外的全部 Definition of Done。

### 12.5 大步骤四：发布验收与交付

#### 目标

把通过测试的完整 MVP 整理成可部署、可维护、可追溯的发布候选版本。此步骤不增加新功能。

#### 工作内容

- 冻结功能，只处理发布阻断问题。
- 核对生产配置、密钥注入、域名、TLS、数据库、对象存储和备份策略。
- 关闭开发登录和 Mock SMS；OCR 未配置生产 Provider 时明确阻断生产发布。
- 配置 Android 与 iOS 的正式应用标识、构建配置和版本号；签名证书、EAS/Apple/Google 账号由用户提供。
- 在账号和签名条件具备时生成 Android 与 iOS 发布候选构建；条件不具备时完成可复现的构建配置，生成当前环境可完成的预览构建，并把外部阻塞记录清楚，不得虚报已发布。
- 准备隐私政策、用户协议、敏感个人信息单独同意文案，并提交法务审核。
- 准备部署、回滚、监控告警、数据恢复和日常运维手册。
- 按第 14 节执行最终验收，记录版本号和构建信息。

#### 必须交付

- 可复现的构建配置、构建命令，以及现有账号和签名条件允许生成的发布候选包。
- `docs/release-checklist.md`。
- `docs/deployment-runbook.md`。
- `docs/rollback-and-recovery.md`。
- OpenAPI、架构、隐私数据地图和测试报告最终版。
- 已知限制、P1 待办和外部依赖清单。

#### 完成标准

- 第 14 节 Definition of Done 全部满足。
- 发布候选版本与通过测试的代码提交完全对应。
- 生产配置不存在 Mock 服务、默认密码、弱密钥或公开附件。
- 用户完成最终验收；法务、应用商店账号和真实第三方服务等外部事项有明确负责人和状态。

### 12.6 建议周期与人员分工

以下为 1 名全职技术负责人使用 Cursor、产品负责人及时确认、设计和测试兼职参与的参考周期，不是强制承诺：

| 大步骤 | 参考时间 | 主要责任人 | 占整体工作量 |
|---|---:|---|---:|
| 整体设计与可复用原型 | 2-3 周 | 产品负责人、技术负责人、设计复核 | 16% |
| 全量开发 | 10-13 周 | 技术负责人、Cursor Agent | 62% |
| 系统测试与集中修复 | 3 周 | 测试、技术负责人、安全复核 | 20% |
| 发布验收与交付 | 1 周 | 产品负责人、技术负责人、运维/法务 | 2% |

预计总周期约 16-20 周。v2.0 相对 v1.2 增加了就诊录音与转写、存量批量导入、阶段小结、标准日历与知识库、居家监测与费用记录，工期已相应上调。范围包含备孕归档、孕期、妈妈产后、宝宝 0-1 岁以及各类报告通用识别，不能按纯孕期工具估算。若只有非技术用户独立操作 Cursor、缺少测试和安全复核，应增加缓冲，不应为了压缩时间跳过权限、隐私和数据恢复验证。

知识库内容整理属于人工工作，不由模型代劳，需单独预留时间；建议在大步骤一完成初始条目，大步骤二逐步补齐。

责任边界：

| 角色 | 主要职责 |
|---|---|
| 产品负责人（用户） | 确认范围、原型、关键文案和最终验收；提供商店及第三方服务账号 |
| Cursor Agent | 按规格产出代码、迁移、测试和技术文档；如实报告验证结果 |
| 技术负责人 | 审核架构、安全、代码和发布配置；对生产质量负责 |
| 设计复核 | 检查移动端视觉、一致性、信息层级和可访问性 |
| 测试/安全复核 | 执行独立测试、越权检查、敏感数据检查和回归 |
| 法务/合规 | 审核隐私政策、授权文案、第三方数据处理和发布资质 |

Cursor 可以显著提高实现效率，但涉及真实家庭健康数据时，生产发布仍需要人工技术、安全和合规复核。

### 12.7 防返工与需求变更规则

以下机制用于避免开发中途推倒重来：

1. **单一需求源**：本文是产品与技术规格唯一基线，其他想法进入 `docs/backlog.md`。
2. **可复用原型**：原型必须位于最终 Expo 工程，正式开发只替换数据源、补齐逻辑和测试。
3. **契约先行**：页面字段、Zod Schema、OpenAPI 和 Prisma 实体在全量开发前对齐。
4. **全链路追踪**：每个需求必须对应页面、接口、数据实体、权限和测试；任何孤立实现都应删除或补齐归属。
5. **适配层隔离**：短信、OCR、存储和通知通过 Provider 接口接入，避免更换厂商时改动业务逻辑。
6. **增量迁移**：数据库只通过版本化迁移修改，不手工改生产结构；破坏性变更必须附数据迁移方案。
7. **同步测试**：功能开发时同步补测试，系统测试只做全局验证和补漏。
8. **控制临时方案**：需要临时实现时必须在 `PROJECT_PLAN.md` 登记移除条件和截止点，禁止隐藏技术债。
9. **变更评估**：大步骤一确认后的新需求，先记录变更原因、影响页面、接口、数据、测试、工期和隐私风险。
10. **范围处理**：不影响首发目标的变更进入 P1；必须纳入 MVP 的变更要先更新本文和追踪矩阵，再修改代码。

任何变更都不得只改前端文案或数据库其中一层而忽略其余关联项。

---

## 13. 测试要求

### 13.1 最低自动化测试

- 权限矩阵：`OWNER`、`EDITOR`、`VIEWER` 的读写边界。
- 登录令牌刷新、退出和开发入口生产禁用。
- 备孕中、怀孕中与宝宝已出生三种首次建档路径。
- 备孕孕期记录由 `PLANNING` 流转为 `PREGNANT` 后，备孕期报告与事件的关联不丢失。
- 孕周、产后天数、宝宝日龄/月龄计算及基础日期修订后的重新计算。
- 事件 CRUD、软删除、分页、费用字段和家庭隔离。
- 附件类型、大小和家庭归属校验。
- 通用 OCR 的多种报告分类、`OTHER` 回退、多页部分失败、低置信度、重试和重复请求。
- 报告确认的事务一致性：报告与事件要么同时成功，要么同时失败。
- 报告字段同步健康记录的用户确认、幂等性和来源追溯。
- **批量导入**：批次进度持久化、单份失败不影响整批、重复提交幂等、放弃批次不删除已确认报告。
- **就诊录音**：转写失败降级、抽取部分成功、确认事务（叮嘱 / 用药 / 提醒同时成功或同时失败）、重复转写幂等、音频不产生公开链接。
- **白话解读**：每条必须带出处；缺少出处的条目不得输出；结构化校验失败按失败处理。
- **阶段小结**：只读取已确认记录、指纹缓存命中不重复调用、记录变化后置为 `STALE`、空分区如实为空、未闭环项转提醒。
- **标准日历**：按预产期/出生日期匹配阶段、未采纳前不写入提醒表、采纳后归用户所有且不受知识库更新影响、备孕阶段不展示。
- **AI 越界检查**：解读、抽取与小结输出不含诊断性、建议性或评价医生的措辞。
- 居家监测与报告同步记录共用同一张表，来源标记正确且不产生重复健康记录。
- 妈妈孕期/产后、宝宝成长和疫苗记录的单位、日期排序及时间轴一致性。
- 分娩事件到宝宝建档的衔接，不自动猜测宝宝信息。
- 邀请过期、重复接受和最后所有者保护；邀请只能选择可查看或可编辑。
- 导出只能由 `OWNER` 发起，包含录音音频，下载链接会过期。
- AI 成本上限触达后降级为“仅归档不解读”并提示用户，不静默失败。

### 13.2 必须手动走通的场景

1. 怀孕中用户登录，只填预产期完成建档，进入「此刻」并看到标准日历提供的下一步。
2. 备孕中用户登录建档，归档一份备孕期检查报告；随后确认怀孕，验证该报告仍在档案中且关联未断。
3. 宝宝已出生用户登录，跳过孕期补录并创建 0-1 岁宝宝档案。
4. 执行存量批量导入：一次提交多份报告，中途退出再进入，验证进度保留并完成剩余确认。
5. 手动创建一条产检事件并上传附件，填写费用，从档案搜索并打开原件。
6. 分别上传超声、检验、出院/分娩、宝宝体检和未知类型样本，确认都能进入通用报告流程。
7. 上传多页报告，模拟其中一页失败，调整页序并完成剩余结果确认。
8. 阅读某份报告的白话解读，逐条检查出处可跳转到报告原文或知识库条目。
9. 采纳报告的建议下一步，验证提醒或携带清单项被创建，且未采纳项不产生数据。
10. 修改低置信度动态字段，选择部分测量值同步到健康趋势，验证不会重复生成数据。
11. 进行一次就诊录音（或导入音频），验证转写、医嘱/用药/下次检查抽取、逐项修订与确认入档，并可回放音频。
12. 模拟转写失败，验证音频保留且可手动补录叮嘱，不阻断归档。
13. 生成近 3 个月阶段小结，检查六个分区、结论出处跳转、未闭环项转提醒和简化版内容。
14. 在小结范围内新增一条已确认报告，验证小结状态变为需重算并可刷新。
15. 把一条标准日历节点转为提醒，修改其时间，验证不受知识库影响且出现在「此刻」。
16. 录入居家监测的体重与血压，验证健康趋势更新且来源标记正确。
17. 记录分娩事件，确认后创建宝宝档案，并继续添加妈妈产后复查记录。
18. 添加两条妈妈产后体重数据，验证健康趋势和档案时间轴同步更新。
19. 添加宝宝身高、体重、头围、体检和成长里程碑，查看按月龄聚合结果。
20. 创建宝宝疫苗记录和下次提醒，收到本地通知并标记完成。
21. 邀请一名“可查看”成员，验证其可以查看档案但不能修改。
22. 查看信任承诺页，导出家庭数据，检查孕期、产后、宝宝记录、报告字段、疫苗、录音音频与转写文本、原始附件均包含在 ZIP 中。

测试数据必须脱敏，不提交真实医疗报告、真实就诊录音、手机号或云服务密钥。Mock ASR 样本使用自行录制的无个人信息音频。

---

## 14. Definition of Done

只有同时满足以下条件，MVP 才算完成：

- Android 和 iOS 开发环境均能启动，不是只有 Web 页面。
- 大步骤一的完整交互原型已经确认，后续实现复用同一套页面、路由和组件。
- 移动端、API、PostgreSQL、对象存储、OCR / LLM / ASR 模拟服务形成真实闭环。
- 从空数据库运行全部迁移和种子脚本成功。
- `pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm build` 全部通过。
- 核心流程没有依赖手工修改数据库或硬编码用户 ID。
- 所有写操作都有服务端权限校验和输入校验。
- 报告与录音未经确认不会进入正式时间轴和健康数据。
- 超声、检验、出院/分娩、宝宝体检和未知类型报告均可归档；未知类型不会被拒绝。
- 存量批量导入可在中断后续传，20 份报告可在 10 分钟内完成粗归档。
- 就诊录音可完成录制、转写、要素抽取与确认入档；失败时可降级手动补录。
- 阶段小结六个分区可正常生成，每条结论可追溯来源，缓存与失效机制生效。
- 标准日历在只填一个日期时即可让「此刻」首屏有内容；未采纳前不写入提醒。
- 白话解读的每一条都带出处；不存在模型自由生成的指南名称或链接。
- AI 输出不含行动建议、风险判断和对医生的评价。
- 备孕、孕期、妈妈产后和宝宝 0-1 岁记录形成连续时间轴，阶段流转前后历史不会断开。
- 健康模块与档案时间轴使用同一数据来源；居家监测、报告同步和重复提交不会产生重复健康记录。
- 私有附件与录音音频不存在永久公开 URL。
- 日志和错误上报中没有敏感原文、转写文本或健康数值。
- 生产环境未接入境外模型服务；模型服务商不使用用户数据训练已确认。
- 产品内明文展示的信任承诺与实际实现一致，不存在夸大表述。
- README 包含环境要求、启动命令、测试命令、架构说明和已知限制。
- OpenAPI 文档与实际接口一致。
- `PROJECT_PLAN.md` 与需求追踪矩阵覆盖全部 MVP 要求，且不存在未说明的缺口。
- 测试报告、隐私数据地图、发布检查表、部署与恢复手册已经更新为最终版本。
- 发布构建状态与外部账号、签名、法务和第三方服务依赖如实记录，没有把未完成事项写成完成。
- 明确列出尚未实现的 P1 和非目标功能，不用假按钮冒充已实现能力。

---

## 15. 产品决策记录

以下决定已经确定，项目执行期间无需再次讨论：

1. 芽纪是家庭孕育档案与解读助手，不是内容社区或互联网医院。
2. **「此刻」是默认首页**；档案时间轴是完整历史与数据主线，作为二级入口。（v2.0 修订，取代 v1.2 的“时间轴是首页”）
3. OCR、LLM 与 ASR 都是录入与理解助手，用户确认是进入正式档案的必要条件。
4. 首版不做医疗诊断、风险预测和开放式健康问答。
5. **AI 只做四层边界中的前两层**：术语与报告解释、档案事实提示。不做行动建议，不评判医生。
6. **白话解读的出处只能指向内置知识库条目或报告原文**；标准日历与材料清单一律来自知识库，禁止模型自由生成出处或日程。
7. 家庭关系与权限角色分离；首版邀请只提供可查看与可编辑两种选择，角色调整与审计日志属于 P1。
8. 数据导出和删除属于基础隐私能力，不作为付费权益。
9. 首版使用 PostgreSQL 搜索，不引入 Elasticsearch。
10. 首版使用可替换的 OCR / LLM / ASR Provider，不绑定单一厂商；**首版只接入境内服务，健康数据不出境**。
11. 模型调用结果一律落库缓存，同一输入不重复调用；提供日成本上限与降级策略。
12. 数据层支持多个孕期；首版客户端展示当前母婴生命周期及当前宝宝关联的历史孕期，不提供多个独立孕期的主动切换入口。
13. 首版优先完成可运行闭环，不建设微服务、Kubernetes 或知识图谱。
14. 项目只设置四个大步骤；原型代码直接复用，全量开发作为一个连续步骤完成。
15. 大步骤一结束后只进行一次产品与交互确认，后续普通实现细节不反复要求用户决策。
16. **MVP 覆盖备孕（仅归档）、孕期、妈妈产后恢复和宝宝 0-1 岁**；宝宝成长记录属于核心功能。
17. 健康模块作为档案数据的趋势视图保留，不单独维护第二份数据；居家监测复用同一张健康记录表。
18. 所有合规报告均可上传和归档；未知类型使用通用识别与手动补录，不限制为少数报告模板。
19. **就诊录音与转写属于 MVP 核心录入方式**（v2.0 修订，原为 P1）；音频按最高敏感级处理。
20. **存量批量导入属于 MVP**，是首次使用体验的成败点。
21. **阶段小结属于 MVP**，只汇总事实与引用原文，不产生新的医学结论。
22. 事件级费用记录属于 MVP 轻量能力；发票识别与报销流程属于 P1。
23. 首版不加入喂奶、睡眠、排泄和尿布等高频生活记录。
24. 首版不做老人端、挂号缴费、广告和打卡催办类功能。
25. 独立 App 优先，不做小程序版本；商业倾向为买断制，但不影响 MVP 开发范围。

---

## 16. 交付时的汇报格式

Cursor Agent 在每个项目大步骤完成后按以下格式汇报；全量开发内部功能包只更新 `PROJECT_PLAN.md`，不要把它们包装成多个项目阶段：

```text
已完成
- 本大步骤实际完成的工作和交付物

关键文件
- 新增或修改的主要文件及用途

验证结果
- 启动、类型检查、测试和构建结果

已知限制
- 尚未实现但不会阻塞下一大步骤的内容

下一步
- 将要开始的下一大步骤或发布动作
```

不要只回复“已完成”，也不要把尚未运行的测试写成通过。
