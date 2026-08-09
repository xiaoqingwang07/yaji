# 芽纪视觉系统换代说明 (2026-08-09)

## Art Direction

**晨光雾气里的温柔精准** — 安静、有呼吸、有仪式感，但主路径极短。品牌气质可归纳为三句话：

1. **暖纸质感，不是数字工具** — 奶油棉纸底色 + 衬线中文标题 + 无衬线数字，产生杂志级排版张力
2. **克制的光与呼吸** — 顶部暖光氛围层 + 叶芽标识缓慢呼吸 + 确认归档仪式弹性动画，3 处有意图的动效
3. **一屏一主角** — Hero 数字 64px 超轻字重独占视线；次要信息折叠；CTA 精准唯一

## 色彩系统变更

| Token | 旧值 | 新值 | 意图 |
|-------|------|------|------|
| bg | #FDF7F2 | #FDFAF6 | 更中性，减少偏红 |
| brand | #7EB8A8 | #5A9E88 | 沉稳一阶，更有品质 |
| brandDeep | — | #2C5F4D | 按钮主色，深邃不刺眼 |
| text | #3A312C | #2C2420 | 提高对比度 |
| heroNumber | 56px/600wt | 64px/300wt | 超轻字重 = 杂志感 |

## 字体策略

- **中文标题**：Web 端加载 Noto Serif SC（衬线），native 使用系统字体
- **数字/正文**：DM Sans / Inter 无衬线，配合 PingFang SC
- 字号阶梯拉大：Hero 64 → Title 24 → Body 16 → Caption 12，层次更强

## 组件级变更

| 组件 | 变更 |
|------|------|
| Screen | 保持结构，更新色值 |
| Card | 新增 `elevated` prop + 温和阴影 |
| Group | 自带 sm 阴影，有浮起感 |
| Row | 行高 56px，字体切无衬线 |
| Button | 主按钮用 brandDeep，圆角 22px |
| Chip | 胶囊形 (pill radius)，active 用 brandDeep |
| CollapsibleSection | 去掉 ∧∨ 符号，改为文字"收起/展开" |
| SectionHeader | 使用 overline 样式（11px 加粗字母间距） |
| SproutMark | 叶片形状改为不规则自然弧线，呼吸动效更缓（2.2s 周期） |
| TabBar | 高度 76px，更薄分割线，图标精细化 |

## 页面级跃迁

### 此刻 (Now)
- Hero 卡片：64px 超轻数字 + 衬线阶段名 + 进度条，自带中号阴影
- "收下报告" 改为胶囊按钮居中，品牌绿底 + 白字提示
- 动效：Hero 淡入 + 上移 (600ms cubic)

### 档案 (Timeline)
- "收下报告" 按钮升级为实心深绿胶囊 (brandDark + 白字)
- 列表改为时间轴样式：左侧圆点 + 连接线，右侧卡片带阴影
- 事件卡类型标签字号缩小但加粗

### 健康 (Health)
- 页面标题改用衬线体 22px，产生文学感
- 趋势卡加 sm 阴影，融入整体浮层语言

### 我的 (Me)
- Hero 卡增加 md 阴影，更有存在感
- 减少工具设置感：用 softLine + aiLine 分层呈现家庭信息

### 报告确认 (Review)
- 引入步骤标签："理解 → 核对 → 采纳 → 归档"（overline 样式）
- 成功动画改为 spring 弹性缩放 + 淡入
- AI 帮读标识只出现一次，带精致边框

## 改动文件清单

```
apps/mobile/constants/theme.ts          — 全量重写
apps/mobile/components/ui.tsx           — 全量重写
apps/mobile/components/YajiMark.tsx     — 重写
apps/mobile/components/MetricVisual.tsx — 重写
apps/mobile/components/TabIcons.tsx     — 重写
apps/mobile/app/(tabs)/_layout.tsx      — 更新
apps/mobile/app/(tabs)/now.tsx          — 全量重写
apps/mobile/app/(tabs)/timeline.tsx     — 全量重写
apps/mobile/app/(tabs)/health.tsx       — 更新
apps/mobile/app/(tabs)/me.tsx           — 更新
apps/mobile/app/add-menu.tsx            — 更新
apps/mobile/app/report/review.tsx       — 全量重写
```

## 刷新预览

```bash
cd apps/mobile && npx expo start --web
```

打开 `http://localhost:8081`（或控制台显示的端口），查看此刻/档案/健康/我的四个 Tab 及报告确认流程。

## 已知技术债

- Web 端字体依赖 Google Fonts CDN 加载 Noto Serif SC，首屏可能闪烁
- 阴影在 Android 上通过 elevation 近似，无法完全一致
- 时间轴连接线在仅一条数据时不够优雅（待设计空状态）
- 动效使用 Animated API 而非 Reanimated（原型阶段够用，正式版应迁移）
