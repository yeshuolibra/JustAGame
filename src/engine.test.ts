import { describe, it, expect } from "vitest";
import { createInitialState, advanceDay, resolveChoice, canAdvanceDay, pickWeighted } from "./engine";
import type { GameEvent } from "./events";

const healAuto: GameEvent = {
  type: "auto",
  id: "test-heal",
  weight: 1,
  description: "测试治疗。",
  survivalDelta: 5,
};

const lethalAuto: GameEvent = {
  type: "auto",
  id: "test-lethal",
  weight: 1,
  description: "测试致命伤害。",
  survivalDelta: -100,
};

const choiceEvent: GameEvent = {
  type: "choice",
  id: "test-choice",
  weight: 1,
  prompt: "测试抉择。",
  options: [
    { id: "a", label: "选项甲", survivalDelta: -3, resolution: "你选了甲。" },
    { id: "b", label: "选项乙", survivalDelta: 4, resolution: "你选了乙。" },
  ],
};

describe("pickWeighted", () => {
  it("returns the only item when one entry", () => {
    const only = [{ weight: 1, id: "x" }];
    expect(pickWeighted(only, () => 0.99)).toEqual(only[0]);
  });
});

describe("advanceDay", () => {
  it("increments day after auto event when still alive", () => {
    const s0 = createInitialState(100, 100);
    const s1 = advanceDay(s0, () => 0.5, [healAuto]);
    expect(s1.phase).toBe("playing");
    expect(s1.day).toBe(1);
    expect(s1.survival).toBe(100);
    expect(s1.log.length).toBeGreaterThan(0);
  });

  it("does not increment day on lethal auto", () => {
    const s0 = createInitialState(100, 50);
    const s1 = advanceDay(s0, () => 0.5, [lethalAuto]);
    expect(s1.phase).toBe("gameover");
    expect(s1.day).toBe(0);
    expect(s1.survival).toBe(0);
  });

  it("sets pending choice without incrementing day", () => {
    const s0 = createInitialState(100, 100);
    const s1 = advanceDay(s0, () => 0.5, [choiceEvent]);
    expect(s1.pendingChoice).not.toBeNull();
    expect(s1.day).toBe(0);
    expect(canAdvanceDay(s1)).toBe(false);
  });

  it("returns unchanged when pending choice blocks", () => {
    const s0 = createInitialState(100, 100);
    const s1 = advanceDay(s0, () => 0.5, [choiceEvent]);
    const s2 = advanceDay(s1, () => 0.5, [healAuto]);
    expect(s2).toEqual(s1);
  });
});

describe("resolveChoice", () => {
  it("applies option, clears pending, increments day when alive", () => {
    const s0 = createInitialState(100, 100);
    const s1 = advanceDay(s0, () => 0.5, [choiceEvent]);
    const s2 = resolveChoice(s1, "b");
    expect(s2.pendingChoice).toBeNull();
    expect(s2.phase).toBe("playing");
    expect(s2.day).toBe(1);
    expect(s2.survival).toBe(100);
  });

  it("game over on lethal choice does not increment day", () => {
    const s0 = createInitialState(100, 2);
    const s1 = advanceDay(s0, () => 0.5, [choiceEvent]);
    const s2 = resolveChoice(s1, "a");
    expect(s2.phase).toBe("gameover");
    expect(s2.day).toBe(0);
  });

  it("clamps survival to max", () => {
    const bigHeal: GameEvent = {
      type: "auto",
      id: "big",
      weight: 1,
      description: "大补。",
      survivalDelta: 500,
    };
    const s0 = createInitialState(100, 99);
    const s1 = advanceDay(s0, () => 0.5, [bigHeal]);
    expect(s1.survival).toBe(100);
  });
});
