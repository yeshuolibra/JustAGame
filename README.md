# JustAGame · 荒野求生

浏览器里的**极简生存向 Roguelite**：单一「生存值」、按天触发的随机中文事件，部分事件需要二选一。无后端、无局外养成，刷新即新局。

## 技术栈

- [Vite](https://vitejs.dev/) 6 + [TypeScript](https://www.typescriptlang.org/)
- 原生 DOM（无 UI 框架）
- [Vitest](https://vitest.dev/) 单测（`src/engine.ts` 纯逻辑）

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端里提示的本地地址即可游玩。

### 其他命令

| 命令 | 说明 |
|------|------|
| `npm run build` | 生产构建，输出到 `dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm test` | 运行 Vitest（引擎规则） |

## 玩法说明

1. **生存值**：初始 100 / 100；事件会增减，夹在 `[0, 上限]` 之间。
2. **进行下一天**：从事件池加权随机一条；若为**自动事件**，直接结算；若为**抉择事件**，需先点选项，不能再点「进行下一天」直到选完。
3. **天数与分数**：本步结算后若仍存活，**天数 +1**；若本步后生存值 ≤ 0，**游戏结束且天数不增加**。分数 = 当前天数。
4. **再来一局**：重置状态；不读写本地存档。

事件与数值定义见 `src/events.ts`（约 10 条：自动 + 抉择）。

## 仓库结构

```
├── docs/superpowers/specs/   # 产品设计说明
├── docs/superpowers/plans/   # 实现计划
├── src/
│   ├── events.ts    # 事件表
│   ├── engine.ts    # 状态机与推进逻辑
│   ├── engine.test.ts
│   ├── main.ts      # 页面与交互
│   └── style.css
├── index.html
├── vite.config.ts
└── package.json
```

## 设计文档

- 规格：[docs/superpowers/specs/2026-05-12-survival-roguelite-design.md](docs/superpowers/specs/2026-05-12-survival-roguelite-design.md)
- 实现计划：[docs/superpowers/plans/2026-05-12-survival-roguelite.md](docs/superpowers/plans/2026-05-12-survival-roguelite.md)

## 依赖安装排障

若 `npm install` 报证书错误（如 `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`），可尝试换官方源（仅作本机排障）：

```bash
npm install --registry https://registry.npmjs.org/ --strict-ssl false
```

长期建议修复本机/代理的根证书或网络策略，而不是永久关闭 TLS 校验。

## 许可

私有项目或未声明许可时，默认保留所有权利；若需开源请自行补充 `LICENSE`。
