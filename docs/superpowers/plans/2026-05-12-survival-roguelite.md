# Survival Roguelite Web Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a minimal Vite + TypeScript browser survival roguelite: one survival meter, weighted random daily events (8–12, Chinese copy), choice events that block advancement until resolved, day/score rules per spec, Vitest for engine logic, vanilla DOM UI.

**Architecture:** Immutable `GameState` in `engine.ts`; event definitions in `events.ts`; UI in `main.ts` reads state and calls pure engine functions. Injectable `() => number` RNG and injectable event catalog for tests. No backend, no meta progression.

**Tech Stack:** Vite 6, TypeScript 5, Vitest (via `vite.config.ts` test pool), vanilla DOM.

**Spec reference:** `docs/superpowers/specs/2026-05-12-survival-roguelite-design.md`

---

## File map

| Path | Responsibility |
|------|----------------|
| `package.json` | Scripts: `dev`, `build`, `preview`, `test`; deps: `vite`, `typescript`, `vitest` |
| `vite.config.ts` | Vite + `test: { environment: "node", globals: true }` |
| `tsconfig.json` | `strict`, `moduleResolution: "bundler"`, `types: ["vitest/globals"]` for tests |
| `index.html` | Root page, `#app` mount, script `src/main.ts` module |
| `src/events.ts` | `EVENTS` catalog: 10 items (auto + choice), Chinese strings, weights |
| `src/engine.ts` | `GameState`, `createInitialState`, `pickWeighted`, `advanceDay`, `resolveChoice`, `canAdvanceDay`, `clampSurvival` |
| `src/main.ts` | Wire DOM: stats, log, next-day button, choice buttons, game-over panel, restart |
| `src/style.css` | Minimal readable layout |
| `src/engine.test.ts` | Engine tests with tiny injected catalogs |
| `.gitignore` | `node_modules`, `dist` |

---

### Task 1: Scaffold Vite + TypeScript + Vitest

**Files:**

- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`

- [ ] **Step 1: Add `package.json`**

```json
{
  "name": "justagame",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "~5.6.3",
    "vite": "^6.0.1",
    "vitest": "^2.1.6"
  }
}
```

- [ ] **Step 2: Add `vite.config.ts`**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 3: Add `tsconfig.json`** (include `src` and `vitest` types)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Add root `index.html`** with `<div id="app"></div>` and `<script type="module" src="/src/main.ts"></script>`.

- [ ] **Step 5: Install and smoke-compile**

Run: `cd /Users/charlie/CursorProjects/JustAGame && npm install`  
Expected: `node_modules` created, no errors.

Run: `npm run build` (after sources exist; may skip until Task 4 adds `main.ts`).

- [ ] **Step 6: Commit scaffold**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html .gitignore
git commit -m "chore: scaffold Vite TypeScript project with Vitest"
```

---

### Task 2: Event catalog (`src/events.ts`)

**Files:**

- Create: `src/events.ts`

- [ ] **Step 1: Define discriminated union and export `EVENTS`**

Implement `GameEvent` as either `{ type: "auto"; id; weight; description; survivalDelta }` or `{ type: "choice"; id; weight; prompt; options: [{ id; label; survivalDelta; resolution }] }` with **exactly 10** events, Chinese copy, weights positive integers (simple variety). Include at least **2** `choice` events.

- [ ] **Step 2: Lint/sanity**

Run: `npx tsc --noEmit`  
Expected: no TS errors.

---

### Task 3: Engine + unit tests

**Files:**

- Create: `src/engine.ts`, `src/engine.test.ts`

- [ ] **Step 1: Write failing test `surviving auto day increments day`**

```ts
import { describe, it, expect } from "vitest";
import { createInitialState, advanceDay, type GameState } from "./engine";

const healAuto = {
  type: "auto" as const,
  id: "test-heal",
  weight: 1,
  description: "测试治疗",
  survivalDelta: 5,
};

it("increments day after auto event when still alive", () => {
  const s0 = createInitialState(100, 100);
  const s1 = advanceDay(s0, () => 0.5, [healAuto]);
  expect(s1.phase).toBe("playing");
  expect(s1.day).toBe(1);
  expect(s1.survival).toBe(100);
});
```

Run: `npm test`  
Expected: FAIL (engine missing).

- [ ] **Step 2: Implement `engine.ts`**

Rules from spec:

- `advanceDay` only when `phase === "playing"` and `pendingChoice === null`; otherwise return `state` unchanged (UI must disable; engine stays safe).
- Weighted pick via `pickWeighted(catalog, rng)`.
- Auto: append log line, apply `survivalDelta`, `clamp` to `[0, maxSurvival]`; if `survival > 0` then `day += 1`; else `phase = "gameover"`.
- Choice: set `pendingChoice` with prompt + options, append log for prompt, **do not** increment `day`.
- `resolveChoice(state, optionId, catalog?)`: apply chosen delta + resolution log, clear `pending`, clamp; if dead `gameover` else `day += 1`.
- Log cap **10** lines (slice tail).

- [ ] **Step 3: Add tests** for: lethal auto does not increment day; choice sets pending and blocks day until `resolveChoice`; clamp never exceeds max.

Run: `npm test`  
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add src/engine.ts src/engine.test.ts
git commit -m "feat: add game engine and unit tests"
```

---

### Task 4: UI (`src/main.ts`, `src/style.css`)

**Files:**

- Create: `src/main.ts`, `src/style.css`

- [ ] **Step 1: Render structure inside `#app`**

Elements: survival text + bar, day, log `<ul>`, primary button「进行下一天」, `#choices` container for dynamic buttons, `#gameover` hidden panel with score and「再来一局」.

- [ ] **Step 2: Wire behavior**

- On load: `createInitialState()` with default max 100, render.
- `next day` click: if `canAdvanceDay(state)` call `advanceDay(state, Math.random, EVENTS)` then render; if `pendingChoice` render option buttons.
- Option click: `resolveChoice` with selected option id, re-render, clear choice buttons.
- Game over: hide next-day or show disabled + show panel;「再来一局」 resets with fresh `createInitialState()`.
- While `pendingChoice`: disable「进行下一天」.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev` — play until Game Over, then restart.  
Expected: state clean, Chinese text visible.

- [ ] **Step 4: Production build**

Run: `npm run build`  
Expected: `dist/` output succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/main.ts src/style.css
git commit -m "feat: add survival roguelite UI"
```

---

### Task 5: Spec self-review (plan vs spec)

- [ ] Confirm: 8–12 events, Chinese, single survival, day/score rule, clamp, gameover gating, Vitest on engine, Vite stack — all covered above.

---

## Execution note

User requested **inline execution**: implement all tasks in sequence in the same session after this plan is saved; use `npm test` and `npm run build` before claiming done.
