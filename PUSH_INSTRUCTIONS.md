# 推送到 GitHub — 60 秒搞定

你的所有代码、文档、案例 PDF 都已经准备好在这个文件夹里。我在沙盒里没有你的 GitHub 凭证，所以最后一步推送需要你来执行——但我把它做成了一行命令。

---

## 方式 A（最推荐，2 个命令）：用准备好的 bundle

我已经把整个仓库（含 commit 信息）打包成 `lunara-prepared.bundle`。在 `F:\Lunara` 打开 PowerShell 或 Git Bash，跑：

```bash
# 1. 先清掉之前可能残留的 .git 文件夹（如果存在）
rm -rf .git    # Git Bash
# 或 PowerShell: Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# 2. 从 bundle 恢复整个仓库（含 commit）
git clone lunara-prepared.bundle . --branch main
# 这一步会临时报告 "destination not empty" — 用下面这条代替：
```

如果 `git clone` 报"目录非空"，用这两条更稳妥的：

```bash
git init -b main
git remote add origin https://github.com/hogomex393-svg/Lunara.git
git fetch lunara-prepared.bundle main:main
git checkout main
git push -u origin main
```

第一次推送 GitHub 会弹窗让你登录——直接登录就行，或者用 Personal Access Token（见下面方式 B）。

---

## 方式 B（保险，凭证用 PAT）

如果方式 A 弹不出登录窗，或者你想用 Personal Access Token：

**1. 生成一个 GitHub Personal Access Token：**
- 打开 https://github.com/settings/tokens
- 点 "Generate new token (classic)"
- 勾选 `repo` 权限
- 复制生成的 token（形如 `ghp_xxxxxxxxxxxxx`）

**2. 在 `F:\Lunara` 打开 PowerShell / Git Bash，执行：**

```bash
# 清掉残留 .git（如果有）
rm -rf .git

# 重新初始化并提交
git init -b main
git config user.email "hogomex393@gmail.com"
git config user.name "Frannie"

# 加 .gitignore 防止 node_modules 上去
# (我已经在 .gitignore 里加好了，这一步不用做)

git add -A
git commit -m "Lunara: full-stack AI app — BFF + Prompt templates + Function Calling Agent + eval harness + admin dashboard"

# 把 PAT 嵌进 URL 一次性推送
git remote add origin https://hogomex393-svg:你的TOKEN@github.com/hogomex393-svg/Lunara.git
git push -u origin main
```

---

## 方式 C（GUI 工具，零命令行）

如果你装了 **GitHub Desktop**：
1. 打开 GitHub Desktop
2. File → Add Local Repository → 选 `F:\Lunara`
3. 它会提示初始化为仓库 — 同意
4. 在底部填一条 commit message，点 "Commit to main"
5. 顶部 "Publish repository" — 选你的 hogomex393-svg/Lunara 远程
6. 完成

---

## 推送成功后验证

打开 https://github.com/hogomex393-svg/Lunara 应该能看到：
- README 顶部有 Mermaid 架构图
- `server/` 目录里有所有 BFF 代码
- `Lunara_Case_Study.pdf` 在根目录
- `server/evals/RESULTS.md` 在 server/evals/ 里

---

## 推送之后该做的事

1. **把仓库设为 Public**：Settings → 滚到最底 → "Change visibility" → Public（如果还不是的话）
2. **加 Topics 标签**：在仓库主页点设置图标旁的齿轮，加 `llm`、`agent`、`prompt-engineering`、`react`、`function-calling`
3. **测试 Clone 走一遍**：找一个临时目录 `git clone https://github.com/hogomex393-svg/Lunara.git`，跑一遍 README 里的 Quick Start，确认 BFF 和前端都能起来
4. **填写投递材料**：用 `PROJECT_STATEMENT.md` 里的简历版和 STAR 格式直接复制粘贴
5. **附件**：投递时把 `Lunara_Case_Study.pdf` 一并附上

---

## 文件清单（投递时附上的东西）

| 文件 | 用途 |
| --- | --- |
| GitHub 链接 | 主要展示，HR 会点开看 README |
| `Lunara_Case_Study.pdf` | 邮件 / 表单附件 |
| `PROJECT_STATEMENT.md` 简历版那段 | 简历项目栏 / 自我介绍栏直接用 |
| `PROJECT_STATEMENT.md` STAR 那段 | 项目经历详细描述栏 |
| `server/evals/RESULTS.md` | 面试时被问"怎么调 Prompt"可以直接打开给面试官看 |

加油！💪
