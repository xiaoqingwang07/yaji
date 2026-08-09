# 芽纪架构说明（大步骤一）

## 系统结构

```text
apps/mobile (Expo + Expo Router)
        |  HTTPS /api/v1
apps/api (NestJS)
        |-- Prisma --> PostgreSQL
        |-- S3 SDK --> MinIO（本地）/ 兼容对象存储（生产）
        |-- OcrProvider (Mock | Cloud)
        |-- SmsProvider (Mock | Cloud)
        \-- Job Worker（OCR / 导出 / 删除）
packages/contracts  Zod + 枚举 + DTO
packages/ui         少量通用移动组件
packages/config     ESLint / TS 共享配置
```

## 关键决策

| 决策 | 选择 | 原因 |
|---|---|---|
| 全栈语言 | TypeScript | 契约共享、降低切换成本 |
| 导航 | Expo Router | 文件路由，便于原型即终稿 |
| 状态 | TanStack Query | 服务端状态缓存与失效 |
| 搜索 | PostgreSQL + pg_trgm | MVP 不引入 ES |
| OCR | 可替换 Provider | 无密钥用 Mock，业务不绑厂商 |
| 任务 | DB 任务表 | 不强制 Redis |
| 鉴权 | JWT access+refresh | 家庭成员角色服务端校验 |

## 认证与权限

1. 验证码登录签发 Token。  
2. 每个需家庭上下文的请求解析 `familyId` 与成员 `role`。  
3. OWNER / EDITOR / VIEWER 按矩阵鉴权；前端隐藏不等于安全。  
4. 关系（MOTHER/FATHER…）仅展示，不参与鉴权。

## 报告与 OCR 数据流

```text
客户端选图校验 → presign 上传私有桶 → complete
→ 创建 Report(UPLOADING/UPLOADED)
→ 入队 recognize 任务
→ OcrProvider.recognize
→ NEEDS_REVIEW（字段+置信度）
→ 用户修订 → confirm（事务：报告确认 + 事件 + 可选健康同步）
```

确认前不进正式搜索与健康趋势。

## 健康与时间轴

`MotherHealthRecord` / `BabyGrowthRecord` / `VaccinationRecord` 与 `Event` 一对一关联。  
健康模块只聚合同一数据源；禁止复制第二套数值表。

## 敏感数据

手机号应用层加密 + hash 查找；附件私有；日志禁止正文/手机号/健康值；错误上报仅错误码与 requestId。详见 `privacy-data-map.md`。

## 原型阶段数据源

`apps/mobile` 使用 `src/fixtures` 内存仓库模拟主流程；大步骤二替换为真实 API，路由与组件复用。

## 产品主线（与定位文档一致）

默认首页为「此刻」驾驶舱（节点 / 下一步 / 携带清单 / 轨迹），档案时间轴为二级。  
AI 白话解读与建议下一步仅基于用户报告原文与已确认档案，确认前不入库；不做诊断开药。

产品与交互细节见：

- [product-positioning.md](./product-positioning.md)
- [ux-spec.md](./ux-spec.md)
- [design-system.md](./design-system.md)
