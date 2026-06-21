# 项目工作方式

## 默认开发流程（轻量模式）

对纯前端组件改动、已知 Puppeteer 自动化测试覆盖不到的任务（如依赖 React 合成事件的交互：长按、拖拽、PointerEvent 等），采用以下流程以节省 Token：

1. **Read** 原文件（理解上下文）
2. **Edit / Write** 改动
3. **`npm run build`** 一次验证（TS 编译 + Vite 打包）
4. **commit + push**（用 `git -c http.version=HTTP/1.1 push` 避免 HTTP/2 framing 问题）
5. **一句话总结**，不强制使用表格

仅在以下情况才启动 dev server + Puppeteer 验证：
- 路由 / 数据流 / 状态管理相关，需要实际跑通业务逻辑
- 用户明确要求验证
- 改动影响布局/样式且需要视觉确认

## 已知测试限制（避免重复踩坑）

- 合成 `PointerEvent.dispatchEvent` 无法触发 React 的 `onPointerDown` / `onPointerMove` 等合成事件处理器。涉及 pointer / touch 交互的代码不要尝试用 evaluate 模拟。
- 合成 setter（`Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(...)`）在 headless 下会抛 `Illegal invocation`。需要填写输入框时直接用 `puppeteer_fill` 工具。
- Puppeteer `.click()` 后 React 状态更新是异步的，立即查询 DOM 会拿到旧值，需要 `await sleep` 或Promise+setTimeout 延迟查询。

## 交互约定

- 不要每轮都贴 markdown 表格做总结，简单改动用一两句话。
- 不重复读已经读过的文件（除非有外部改动）。
- 提交信息保持简洁，heredoc 多行格式仅在变更较多时使用。

## Git

- 默认分支：`master`
- push 命令：`git -c http.version=HTTP/1.1 push`（直接 `git push` 偶发 HTTP/2 framing 错误）
- commit 需以 `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` 结尾

## 部署

- 仓库：`banzheshenghuo/schedule-record-web`
- 线上：https://banzheshenghuo.github.io/schedule-record-web/
- master 分支 push 自动触发 GitHub Actions 部署到 Pages
- Workflow 文件：`.github/workflows/deploy.yml`
