# Lunara 作品集改造计划（12 天）

> 目标：把 Lunara 从"接了 LLM 的前端 prototype"改造成能完整对应 AI 应用开发岗 JD 的作品集案例。
>
> 产出三件套：GitHub 仓库 + 案例 PDF + 2-3 分钟 Demo 视频。

---

## 总体架构（改造后）

```
┌──────────────┐      ┌─────────────────┐      ┌──────────────┐
│  React 前端  │ ───▶ │  BFF (Express)  │ ───▶ │  OpenRouter  │
│  (现有 UI)   │      │                 │      │   (LLM)      │
└──────────────┘      │  - /api/chat    │      └──────────────┘
                      │  - /api/advice  │
        ┌─────────────│  - /admin/*     │
        │             │                 │
        │             │  Tools:         │
        │             │  - get_cycle    │
        │             │  - get_logs     │
        │             │  - get_profile  │
        │             └────────┬────────┘
        │                      │
        │              ┌───────▼────────┐
        │              │  SQLite        │
        │              │  - users       │
        │              │  - logs        │
        │              │  - chat_history│
        │              │  - llm_calls   │
        │              └────────────────┘
        │
        ▼
   /admin 管理后台
   (Prompt 模板切换 / 日志查看 / Token 用量)
```

---

## Week 1: 后端 + Agent 基础（Day 1-6）

### Day 1: BFF 基础搭建
**做什么**
- 在仓库根目录新建 `server/` 文件夹，初始化 Node + Express
- 抽离 `AIChat.js` 里的 OpenRouter 调用到 `server/routes/chat.js`
- 用 `dotenv` 把 API key 移到 `.env`（前端不再持有）
- 加 CORS、错误处理中间件

**交付**
- `POST /api/chat` 接口可用
- 前端 `AIChat.js` 改成 fetch 本地 BFF
- `.env.example` 文件

**自我检查**：删掉 localStorage 里的 key，前端依然能聊天

---

### Day 2: 日志系统 + 配置化
**做什么**
- 引入 `pino`（轻量日志库），每次 LLM 调用写一条结构化日志：timestamp / userId / prompt / response / tokens / latency / model
- 新建 `server/prompts/` 目录，把 system prompt 抽成 JSON 配置（支持多模板：`luna_default`、`luna_coach`、`luna_data_analyst`）
- `POST /api/chat` 接受 `templateId` 参数

**交付**
- 日志写入 `logs/llm-calls.jsonl`
- `prompts/templates.json` 至少包含 3 个模板
- 接口能根据 `templateId` 切换 prompt

---

### Day 3: 数据持久化（SQLite）
**做什么**
- 引入 `better-sqlite3`（零配置，文件型数据库）
- 建表：`users`、`daily_logs`、`chat_messages`、`llm_calls`
- 把前端原本存 `useState` 的 mood/symptom log 改成调 `POST /api/logs`
- 把 chat 历史改成走后端

**交付**
- `server/db/schema.sql`
- 数据持久化，刷新页面不丢
- API：`GET /api/logs`、`POST /api/logs`、`GET /api/chat/history`

---

### Day 4: Admin 管理后台
**做什么**
- 前端加 `/admin` 路由（简单密码保护）
- 三个面板：
  1. **Prompt 模板管理**：列出所有模板，能编辑保存
  2. **调用日志**：表格展示最近 100 条 LLM 调用，能看完整 prompt/response
  3. **Token 用量统计**：按天聚合的折线图（用现成的 recharts）

**交付**
- `/admin` 页面可访问，三个 tab 都有内容
- 截图至少 3 张（后面写文档要用）

---

### Day 5: 上下文注入（半个 Agent）
**做什么**
- 在 `server/routes/chat.js` 里，调 LLM 前先：
  1. 查用户最近 7 天 logs
  2. 算当前 cycle 阶段（用 `lastPeriodStart` + 周期长度）
  3. 把这些信息拼成结构化 context 注入 system prompt
- 写一个 `buildContext(userId)` 函数

**测试用例**：问 "我今天为什么这么累？"，Luna 应该能引用具体的最近 log（不再是泛泛而谈）

**交付**
- `server/lib/context.js`
- 前后对比截图（无上下文 vs 有上下文）

---

### Day 6: Function Calling / 真 Agent
**做什么**
- 切到支持 function calling 的模型（`meta-llama/llama-3.3-70b-instruct` 或 `gpt-4o-mini` 走 OpenRouter）
- 定义 4 个工具：
  - `get_cycle_phase(userId)`
  - `get_recent_symptoms(userId, days)`
  - `get_user_profile(userId)`
  - `suggest_advice_card(category)`
- 实现工具执行循环（LLM → 工具 → LLM）
- 在前端 chat 气泡里加个小标签显示 Luna 调用了哪些工具

**交付**
- `server/lib/tools.js`
- 一段对话录屏：用户问问题 → 看到 "🔧 调用了 get_recent_symptoms" → Luna 给出基于数据的答案

---

## Week 2: 评估 + 包装（Day 7-12）

### Day 7: Prompt 评估 + 优化记录
**做什么**
- 写一个 `evals/` 文件夹，包含 15-20 个测试 query（涵盖痛经、情绪、睡眠、数据询问等场景）
- 写脚本批量跑这些 query，对比 3 个版本的输出：
  1. 原始 prompt（无 context、无 tools）
  2. + Context 注入
  3. + Function calling
- 用 markdown 表格记录效果差异

**交付**
- `evals/test-cases.json`
- `evals/RESULTS.md`（这是简历里"Prompt 调试与优化"最有力的证据）

---

### Day 8: README + 架构图
**做什么**
- 重写 `README.md`：
  - 顶部一句话定位 + 一张架构图（用 Mermaid 或者 Excalidraw 画）
  - 技术栈 / 主要功能 / 快速启动
  - 章节：AI 能力封装、Agent 设计、工程化考虑（日志/配置/权限）
- 关键模块的代码 walkthrough（贴关键代码 + 解释）

**交付**
- 一个能让面试官 1 分钟看懂的 README

---

### Day 9: 案例文档 PDF（3-5 页）
**做什么**
- 用 docx skill 生成专业排版文档：
  1. 项目背景与目标（1 段）
  2. 技术架构图 + 说明（1 页）
  3. 关键设计决策（为什么加 BFF / 怎么设计 prompt / Agent 工具如何选）（1 页）
  4. Prompt 演进对比（截图 + 评估结果）（0.5 页）
  5. 工程化亮点（日志/配置/权限）（0.5 页）
  6. 踩坑与反思（0.5 页）
- 导出为 PDF

**交付**
- `Lunara_Case_Study.pdf`

---

### Day 10: 200 字项目自述（STAR 结构）
**做什么**
- 写两版：
  - **简历版**：≤ 200 字，关键词踩满 JD（大模型封装、Prompt 工程、Agent、系统集成、日志/配置/权限）
  - **面试讲稿版**：3 分钟口述版本，可背诵

**交付**
- `PROJECT_STATEMENT.md`（含两版）

---

### Day 11: Demo 视频
**做什么**
- 录 2.5 - 3 分钟视频，结构：
  - 0-20s：用户视角，演示聊天问"我今天为什么这么累" → Luna 调用工具 → 给出基于数据的回答
  - 20-50s：切到 admin 后台，演示 prompt 模板切换、看日志、看 token 用量
  - 50-90s：代码视角，给一张架构图，讲技术决策
  - 90s-end：评估对比表，强调 prompt 优化过程
- 用 OBS 或 Loom 录屏，导出 mp4

**交付**
- `demo.mp4`（或上传到 B 站/YouTube 给链接）

---

### Day 12: Buffer + 提交
**做什么**
- 最后一遍跑通所有流程
- 把 GitHub 仓库设为 public，加好 topics（`llm`、`agent`、`prompt-engineering`）
- 整理交付包：GitHub 链接 + PDF + 视频链接 + 自述文本
- 投递到官网

---

## 风险与备选

- **如果时间紧（只有 1 周）**：砍掉 Day 7（评估）、Day 6（function calling 改为简单 if-else 工具路由），最少保留 Day 1-5 + Day 8-10
- **如果 OpenRouter 免费额度不够**：Day 6 可以 mock function calling 协议（手写解析 JSON 工具调用），LLM 用最便宜的 Haiku 或免费 Llama
- **如果不会画架构图**：用 Mermaid 写在 README 里就行，GitHub 会自动渲染

---

## 关键词清单（写文档/简历时要踩到的）

JD 原文里出现的，必须在你的材料里出现：

- 大模型能力封装 → 你的 `/api/chat` BFF 就是
- Prompt 编写、调试与优化 → `prompts/templates.json` + `evals/RESULTS.md`
- Agent / 工作流式 AI 应用 → function calling + 工具循环
- 系统集成 → BFF 把 LLM 接进现有 React 业务系统
- AI 工具、后台服务、管理界面 → `/admin` 后台
- 日志、配置、权限 → pino 日志 + templates.json 配置 + admin 密码保护
- AI 输出的不确定性、调试与验证 → evals 评估对比

---

## 立即开始

确认计划后，我可以直接帮你做 Day 1（搭 BFF）。回复"开始 Day 1"即可。
