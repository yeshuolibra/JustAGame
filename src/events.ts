/** 事件池：10 条（8 自动 + 2 选择），中文文案 */

export type AutoEvent = {
  type: "auto";
  id: string;
  weight: number;
  description: string;
  survivalDelta: number;
};

export type ChoiceEvent = {
  type: "choice";
  id: string;
  weight: number;
  prompt: string;
  options: ReadonlyArray<{
    id: string;
    label: string;
    survivalDelta: number;
    resolution: string;
  }>;
};

export type GameEvent = AutoEvent | ChoiceEvent;

export const EVENTS: readonly GameEvent[] = [
  {
    type: "auto",
    id: "calm",
    weight: 3,
    description: "平静的一天，你好好休息了一下。",
    survivalDelta: 6,
  },
  {
    type: "auto",
    id: "rain",
    weight: 2,
    description: "一场冷雨把你浇透，体温流失。",
    survivalDelta: -10,
  },
  {
    type: "auto",
    id: "can",
    weight: 2,
    description: "你在废墟里捡到一罐未过期的食物。",
    survivalDelta: 14,
  },
  {
    type: "auto",
    id: "fall",
    weight: 2,
    description: "碎石坡上一滑，膝盖磕出了血。",
    survivalDelta: -12,
  },
  {
    type: "auto",
    id: "sleep",
    weight: 2,
    description: "你找到背风处，睡了个难得安稳的觉。",
    survivalDelta: 9,
  },
  {
    type: "auto",
    id: "nothing",
    weight: 3,
    description: "今天什么都没发生，只是又熬过去了一天。",
    survivalDelta: 0,
  },
  {
    type: "auto",
    id: "coldwind",
    weight: 2,
    description: "寒风整夜呼啸，你只能抱紧自己取暖。",
    survivalDelta: -14,
  },
  {
    type: "auto",
    id: "water",
    weight: 2,
    description: "你发现一处看起来还算干净的水源。",
    survivalDelta: 11,
  },
  {
    type: "choice",
    id: "fork-path",
    weight: 2,
    prompt: "岔路口：一条近路穿过峡谷，一条远路绕过山脊。",
    options: [
      {
        id: "short",
        label: "走近路",
        survivalDelta: -22,
        resolution: "近路发生小塌方，你被落石擦伤。",
      },
      {
        id: "long",
        label: "绕远路",
        survivalDelta: 4,
        resolution: "多花了力气，但避开了危险。",
      },
    ],
  },
  {
    type: "choice",
    id: "fire-night",
    weight: 2,
    prompt: "夜色里远处有火光与人声：靠近可能得到帮助，也可能遇到麻烦。",
    options: [
      {
        id: "approach",
        label: "靠近火堆",
        survivalDelta: 18,
        resolution: "旅人分给你热汤和干粮，你缓了过来。",
      },
      {
        id: "avoid",
        label: "悄悄绕开",
        survivalDelta: -8,
        resolution: "你在黑暗里深一脚浅一脚，又冷又累。",
      },
    ],
  },
] as const;
