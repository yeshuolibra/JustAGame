import "./style.css";
import { EVENTS } from "./events";
import {
  advanceDay,
  canAdvanceDay,
  createInitialState,
  resolveChoice,
  type GameState,
} from "./engine";

let state: GameState = createInitialState();

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <h1>荒野求生</h1>
  <p class="sub">单资源生存 · 随机事件 · 能撑几天？</p>
  <div class="stats">
    <div class="stat-row">
      <span>生存值</span>
      <strong id="survival-text"></strong>
    </div>
    <div class="bar" aria-hidden="true"><span id="survival-bar"></span></div>
    <div class="stat-row">
      <span>已存活天数（分数）</span>
      <strong id="day-text"></strong>
    </div>
  </div>
  <div class="actions">
    <button type="button" class="primary" id="btn-next">进行下一天</button>
  </div>
  <div class="log">
    <h2>日志</h2>
    <ul id="log-list"></ul>
    <div class="choices" id="choices"></div>
  </div>
  <div class="panel hidden" id="gameover">
    <h2>游戏结束</h2>
    <p id="gameover-msg"></p>
    <button type="button" class="primary" id="btn-restart">再来一局</button>
  </div>
`;

const survivalText = document.querySelector<HTMLElement>("#survival-text")!;
const survivalBar = document.querySelector<HTMLElement>("#survival-bar")!;
const dayText = document.querySelector<HTMLElement>("#day-text")!;
const logList = document.querySelector<HTMLUListElement>("#log-list")!;
const choicesEl = document.querySelector<HTMLDivElement>("#choices")!;
const btnNext = document.querySelector<HTMLButtonElement>("#btn-next")!;
const gameoverPanel = document.querySelector<HTMLDivElement>("#gameover")!;
const gameoverMsg = document.querySelector<HTMLElement>("#gameover-msg")!;
const btnRestart = document.querySelector<HTMLButtonElement>("#btn-restart")!;

function render() {
  survivalText.textContent = `${state.survival} / ${state.maxSurvival}`;
  const pct = state.maxSurvival > 0 ? (state.survival / state.maxSurvival) * 100 : 0;
  survivalBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  dayText.textContent = String(state.day);

  logList.replaceChildren();
  for (const line of state.log) {
    const li = document.createElement("li");
    li.textContent = line;
    logList.appendChild(li);
  }

  choicesEl.replaceChildren();
  if (state.pendingChoice) {
    for (const opt of state.pendingChoice.options) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = opt.label;
      b.addEventListener("click", () => {
        state = resolveChoice(state, opt.id);
        render();
      });
      choicesEl.appendChild(b);
    }
  }

  const playing = state.phase === "playing";
  gameoverPanel.classList.toggle("hidden", playing);
  btnNext.disabled = !playing || !canAdvanceDay(state);

  if (!playing) {
    gameoverMsg.textContent = `你坚持了 ${state.day} 天。再试一次？`;
  }
}

btnNext.addEventListener("click", () => {
  if (!canAdvanceDay(state)) return;
  state = advanceDay(state, Math.random, EVENTS);
  render();
});

btnRestart.addEventListener("click", () => {
  state = createInitialState();
  render();
});

render();
