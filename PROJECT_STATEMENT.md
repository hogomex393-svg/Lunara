# Lunara · 项目自述（两版）

## 简历版（200 字内，关键词踩满 JD）

> **Lunara — 女性健康 AI Agent 应用**（个人项目，React + Node + LLM）
>
> 把自研的女性健康追踪 prototype 改造为完整的 AI 应用案例。**封装 LLM 能力**为内部 REST API（BFF 模式），实现 OpenRouter 调用网关、API Key 服务端托管、请求审计、降级链路。**Prompt 工程**：用 JSON 配置 4 个 Prompt 模板（默认/教练/数据分析/基线），支持运行时热改，工具白名单按模板隔离；编写 18 用例评估集 + 三变体对比 harness 输出 Markdown 报告。**Agent 工作流**：实现 80 行 tool-calling 循环（最多 4 轮），4 个 function-calling 工具读 SQLite 真实业务数据。**系统集成**：buildContext() 将 cycle 阶段 + 7 天 logs 注入 system prompt；前端 11 个业务模块共享 BFF。**工程化**：pino JSONL + SQLite 双写日志、bearer-token 鉴权的内部 admin 后台（模板编辑 / 调用日志 / Token 用量图）。
>
> 仓库：github.com/hogomex393-svg/Lunara

---

## 面试讲稿版（3 分钟口述）

> 我做了一个叫 Lunara 的项目，最初是我自己写的女性健康追踪 App 的前端 prototype——周期日历、情绪日志、社区，里面接了个 OpenRouter 的聊天框。但我意识到这只是"接了 API"，不是"AI 应用"。所以为了对应 AI 应用开发的岗位，我用了大概两周时间把它彻底重构了一遍。
>
> 我做了三件事。
>
> **第一件，加了一层 BFF 后端。** 原来浏览器直接调 OpenRouter，API key 暴露在 localStorage 里，没有任何审计。我用 Express 起了一个网关，把所有 LLM 调用收进来。这一步看起来简单，但它解锁了三个东西：API Key 服务端托管、Prompt 模板可以做版本管理、每次调用可以写日志和入库审计。我用 pino 写 JSONL 日志文件，同时把每次调用的 prompt token / completion token / 延迟 / 调用的工具 / 状态都写进 SQLite。后台有个管理页面把这些可视化出来。
>
> **第二件，把 Luna 从聊天框升级成 Agent。** 我做了两层：先是"半 Agent"——每次调 LLM 之前，BFF 自动读用户的 profile、算当前 cycle 阶段、汇总过去 7 天日志，拼进 system prompt。这样大约 40% 的问题不需要工具调用就能回答。剩下的长窗口、原始数据型问题——比如"过去 14 天我哪几天记录了痛经"——会触发真正的 function calling 循环。我定义了 4 个工具：get_cycle_phase、get_recent_symptoms、get_user_profile、suggest_advice_card，每个都从 SQLite 真读，不是 mock。Agent 循环我没用 LangChain，原生写了 80 行——最多 4 轮，可控、可单步追溯。
>
> **第三件，做了一套 Prompt 评估流程。** 4 个模板都共享同一份 Agent 代码，区别只在 system 文本、温度和工具白名单——比如"数据分析师"模板被强制只能调数据类工具。我写了 18 个测试用例，覆盖情绪、数据、模式识别、边界场景四类，每个用例标注期望命中点，再用 harness 在三个模板上跑一遍，自动生成对比 Markdown 报告。最有意思的发现是：加了 context 和 tools 之后，token 成本是基线的 2.2 倍，但 pattern detection 类问题的命中率从 0 跳到 100%——这是个清晰的成本/能力权衡，可以指导生产环境的查询分流策略。
>
> 关键词复盘：JD 里说的封装大模型、Prompt 调优、Agent 工作流、系统集成、日志/配置/权限、AI 不确定性的验证——每一条我都在项目里有对应的文件可以打开。这是个 prototype 但工程姿势是按生产去做的。

---

## 投递时的一句话推荐语

> Lunara 是一个把"接了 LLM 的前端 App"系统性改造为"对接业务数据、可观测、可配置、可治理的内部 AI 服务"的实战项目。它最大的价值不在功能，而在 AI Ops 工程化的完整度——岗位 JD 的每一条职责都有对应的代码或文档。

---

## 项目交付物清单（投递时一并附上）

1. **GitHub 仓库**：https://github.com/hogomex393-svg/Lunara
2. **案例研究 PDF**：`Lunara_Case_Study.pdf`（仓库根目录）
3. **架构图**：内嵌在 README.md 顶部（Mermaid）
4. **评估报告**：`server/evals/RESULTS.md`
5. **项目自述**：本文件（`PROJECT_STATEMENT.md`）

---

## 投递邮件/表单填写建议

**自我介绍栏（500 字）建议结构：**

> 你好，我是 Frannie，[本科院校 + 专业]。我对 AI 在企业内部场景的落地很感兴趣，最近做了一个完整的 AI 应用项目 Lunara——把一个女性健康前端 prototype 改造为带 BFF、Prompt 模板系统、Function Calling Agent、Prompt 评估流程、内部管理后台的完整 AI 应用。技术栈是 React + Node/Express + SQLite + OpenRouter。整个项目对照贵司 JD 的每一条职责都有对应的实现，我也写了一份 3-5 页的案例研究 PDF 介绍背景、架构和关键决策。如果有机会聊聊我很期待。
>
> 仓库：https://github.com/hogomex393-svg/Lunara
> 案例研究：见仓库根目录 Lunara_Case_Study.pdf

**项目经历栏建议格式（STAR）：**

- **S (Situation)** — 自研 Lunara 女性健康 App，最初是 React 前端 + 一个直连 OpenRouter 的聊天框，没有工程化能力。
- **T (Task)** — 对照 AI 应用开发岗位 JD，把项目改造为完整 AI 应用，覆盖 LLM 封装、Prompt 工程、Agent、系统集成、日志/配置/权限。
- **A (Action)** — 设计并实现 BFF 网关（Express）、4 模板 Prompt 配置系统、Function Calling Agent 循环（4 个工具读 SQLite）、上下文注入、18 用例 Prompt 评估 harness、bearer-token 鉴权的管理后台。
- **R (Result)** — 评估结果显示带 context + tools 的模板在 pattern detection 类问题命中率从 0% → 100%，token 成本仅增加 2.2 倍。每条 JD 职责都有对应的代码与文档证据。
