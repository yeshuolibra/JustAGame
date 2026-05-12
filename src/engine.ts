import type { GameEvent } from "./events";

export type GamePhase = "playing" | "gameover";

export type PendingChoice = {
  eventId: string;
  prompt: string;
  options: ReadonlyArray<{
    id: string;
    label: string;
    survivalDelta: number;
    resolution: string;
  }>;
};

export interface GameState {
  phase: GamePhase;
  survival: number;
  maxSurvival: number;
  day: number;
  log: readonly string[];
  pendingChoice: PendingChoice | null;
}

const LOG_MAX = 10;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function createInitialState(maxSurvival = 100, survival?: number): GameState {
  const max = maxSurvival;
  const start = survival ?? max;
  return {
    phase: "playing",
    survival: clamp(start, 0, max),
    maxSurvival: max,
    day: 0,
    log: [],
    pendingChoice: null,
  };
}

export function canAdvanceDay(state: GameState): boolean {
  return state.phase === "playing" && state.pendingChoice === null;
}

export function pickWeighted<T extends { weight: number }>(items: readonly T[], rng: () => number): T {
  const sum = items.reduce((a, b) => a + b.weight, 0);
  if (sum <= 0) {
    throw new Error("pickWeighted: total weight must be positive");
  }
  let r = rng() * sum;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1]!;
}

function appendLog(state: GameState, line: string): GameState {
  const log = [...state.log, line].slice(-LOG_MAX);
  return { ...state, log };
}

function formatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : String(delta);
}

export function advanceDay(state: GameState, rng: () => number, catalog: readonly GameEvent[]): GameState {
  if (!canAdvanceDay(state)) return state;

  const event = pickWeighted(catalog, rng);

  if (event.type === "choice") {
    const pending: PendingChoice = {
      eventId: event.id,
      prompt: event.prompt,
      options: event.options,
    };
    let next: GameState = { ...state, pendingChoice: pending };
    next = appendLog(next, `${event.prompt}（请选择下方选项）`);
    return next;
  }

  const survival = clamp(state.survival + event.survivalDelta, 0, state.maxSurvival);
  let next: GameState = { ...state, survival };
  next = appendLog(
    next,
    `${event.description}（生存值 ${formatDelta(event.survivalDelta)}）`,
  );

  if (survival <= 0) {
    return { ...next, phase: "gameover" };
  }

  return { ...next, day: state.day + 1 };
}

export function resolveChoice(state: GameState, optionId: string): GameState {
  if (state.phase !== "playing" || !state.pendingChoice) return state;

  const opt = state.pendingChoice.options.find((o) => o.id === optionId);
  if (!opt) return state;

  const survival = clamp(state.survival + opt.survivalDelta, 0, state.maxSurvival);
  let next: GameState = {
    ...state,
    pendingChoice: null,
    survival,
  };
  next = appendLog(next, `${opt.resolution}（生存值 ${formatDelta(opt.survivalDelta)}）`);

  if (survival <= 0) {
    return { ...next, phase: "gameover" };
  }

  return { ...next, day: state.day + 1 };
}
