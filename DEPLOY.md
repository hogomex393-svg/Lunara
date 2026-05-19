# 部署 Lunara 到公网（Render.com 免费版）

> 目标：让任何人点一个 URL 就能用你的 Lunara，包括 HR 和面试官。
>
> 预计耗时：**15-20 分钟**（其中 8-10 分钟是等 Render 自动 build）。
>
> 花费：**¥0**。Render 免费版完全够用，唯一代价是闲置 15 分钟会休眠，下次访问唤醒要 30 秒。

---

## 准备工作（5 分钟）

### 1. 仓库要先推到 GitHub

如果还没推，先按 `PUSH_INSTRUCTIONS.md` 把代码推到 https://github.com/hogomex393-svg/Lunara。Render 是从 GitHub 拉代码部署的。

### 2. 拿一个 OpenRouter API Key

1. 打开 https://openrouter.ai/keys
2. 用 GitHub 或 Google 登录
3. 点 "Create Key"，复制（形如 `sk-or-v1-xxxxxxxx...`）
4. **不要把这个 key 提交进 git**——只准备好放在剪贴板里，等下贴到 Render 的环境变量页

### 3. 注册 Render 账号

1. 打开 https://render.com → Get Started
2. 用 GitHub 账号登录（推荐——授权时勾选 `hogomex393-svg/Lunara` 仓库的读取权限）

---

## 部署（10 分钟）

### 方式 A：Blueprint 一键部署（推荐）

我已经在仓库根目录写好了 `render.yaml`，Render 看到它会自动配置好一切。

1. 登录 Render，左侧菜单点 **"Blueprints"**
2. 点右上角 **"New Blueprint Instance"**
3. 选择你的 GitHub 仓库 `hogomex393-svg/Lunara` → "Connect"
4. Render 会读取 `render.yaml`，显示要创建的服务（`lunara` web service）
5. 在 **Environment Variables** 区域：
   - 找到 `OPENROUTER_API_KEY` 这一项（标记为"required"）
   - 把你的 OpenRouter key 粘贴进去
   - 其他变量都已经在 yaml 里设好，不用动
6. 点 **"Apply"**
7. Render 开始 build，等 5-10 分钟。日志里依次看到：
   - `npm install` 完成
   - `cd server && npm install` 完成
   - `npm run build` 完成（React 编译）
   - `[Lunara BFF] listening on :10000` ← 成功
8. 顶部会显示一个 URL，类似 `https://lunara-xxxx.onrender.com`

### 方式 B：手动配置（如果 Blueprint 出问题）

1. Render 主页 → **"New +"** → **"Web Service"**
2. 选你的 `hogomex393-svg/Lunara` 仓库
3. 配置：
   - **Name**: `lunara`
   - **Region**: Oregon（或离你 HR 最近的）
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm run render-start`
   - **Plan**: Free
4. 滚到 **Environment Variables**，加这几条：
   | Key | Value |
   |---|---|
   | `NODE_VERSION` | `20` |
   | `NODE_ENV` | `production` |
   | `OPENROUTER_API_KEY` | 你的 key |
   | `LLM_MODEL` | `meta-llama/llama-3.3-70b-instruct` |
   | `ADMIN_PASSWORD` | 自己起一个，例如 `lunara-admin-2026` |
5. 点 **"Create Web Service"**
6. 等 build 完成

---

## 验证（2 分钟）

打开 Render 给你的 URL（`https://lunara-xxxx.onrender.com`）：

1. **`/health`** → 应该返回 `{"ok":true, "ts":...}` ✅ 后端起来了
2. **根路径** → 看到 Lunara onboarding 界面 ✅ 前端 build 也起来了
3. **走一遍 onboarding，进 Luna AI 聊天 → 发"I have cramps"** → 应该有 LLM 回复 ✅ 整个链路通了
4. **`/#/admin`** → 输你设的 `ADMIN_PASSWORD` → 看到 templates / call log / token usage 三个 tab ✅ Admin 工作

如果某一步失败，看 Render 后台 → 你的服务 → **Logs** tab，把报错粘给我，我帮你 debug。

---

## 部署后必做的 3 件事

### 1. 把 URL 加到 README 顶部

在 `README.md` 第一行的标题下面加一行：

```markdown
**🌐 Live demo:** https://lunara-xxxx.onrender.com  ·  admin: `/#/admin`
```

commit + push 一下，GitHub 上就能直接点了。

### 2. 把 URL 加进投递材料

- 简历项目栏：项目名后面加 "(live demo: lunara-xxxx.onrender.com)"
- `PROJECT_STATEMENT.md` 简历版那段最后加一句"线上 Demo：lunara-xxxx.onrender.com"
- 投递邮件正文里写一句"代码 GitHub: ... · 在线 Demo: ..."

### 3. 给 HR 一个友好提示

因为免费版会休眠，第一次访问要等 30 秒。建议在 README 的 Live Demo 一栏后面加一句：

> First visit may take ~30 seconds — the demo uses Render's free tier which sleeps when idle.

---

## 常见问题速查

| 现象 | 原因 | 解决 |
|---|---|---|
| Build 阶段 `better-sqlite3` 编译失败 | Node 版本不对 | 确认环境变量 `NODE_VERSION=20`（不是 16/18） |
| Build 报 "Treating warnings as errors" | CRA 默认把 ESLint warning 当 error | render-build 脚本里已经加了 `CI=false`，应该不会触发；如果还遇到，去 Render env vars 加一条 `CI=false` |
| 部署成功但访问页面白屏 | 前端 build 没产出 build/ 目录 | 看 build 日志确认 `npm run build` 跑过；最简单办法是手动触发一次 redeploy |
| Luna AI 回复 "offline fallback" | OPENROUTER_API_KEY 没设或额度用完 | 检查 Render env vars 里 key 是否正确；上 https://openrouter.ai/activity 看额度 |
| Admin 后台输密码后转圈 | ADMIN_PASSWORD env var 没设 | 检查 Render env vars，确保有这一条 |
| /api/chat 返回 401 | （上面那条） | 同上 |
| `/health` 也访问不到 | 服务还没起来 / 在睡眠 | 等 30 秒刷新；查 Logs tab 看是否有崩溃 |

## 关于 SQLite 在 Render 上的限制

**Render 免费版的文件系统是 ephemeral 的**——每次重启或重新部署，`server/db/lunara.db` 会被重置，所有用户日志和聊天历史会清空。对于一个**只是给 HR 看的 demo**，这完全可以接受（HR 不会真的连续用一周）。

如果以后想做真正的多用户产品：
- 升级到 Render 付费版（$7/月），加 persistent disk
- 或者换成 PostgreSQL（Render 也提供托管 Postgres 免费版，但要改 db.js）

面试被问到时的标准答案：
> "现阶段用 SQLite + 本地文件系统是为了零运维快速上线。下一步要换成 Postgres + S3 持久化日志，迁移成本主要在 `server/lib/db.js` 这一个文件。"

---

## 完成后你的项目长这样

- ✅ GitHub 代码仓库：https://github.com/hogomex393-svg/Lunara
- ✅ 在线 Demo URL：https://lunara-xxxx.onrender.com
- ✅ README 顶部 Live demo 链接
- ✅ 案例研究 PDF
- ✅ 项目自述（简历版 + STAR 版）
- ✅ 18 用例评估报告
- ✅ 投递材料里都有 demo 链接

HR 点开 URL，30 秒后能看到一个真实的、能交互的 AI 应用——这是同岗位其他候选人**很少**能做到的事。

加油！部署完成把 URL 发我，我帮你检查 README 文案和最终交付清单。
