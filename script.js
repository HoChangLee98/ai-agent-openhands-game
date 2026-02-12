const CHOICES = ["가위", "바위", "보"];

const SCORE_KEY = "rps-score-v1";
const HISTORY_KEY = "rps-history-v1";
const MODE_KEY = "rps-mode-v1";
const MAX_HISTORY = 30;

const dtf = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "short",
  timeStyle: "medium",
});

function byId(id) {
  return document.getElementById(id);
}

function getCpuChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function decide(player, opponent) {
  if (player === opponent) return "무승부";

  const win =
    (player === "가위" && opponent === "보") ||
    (player === "바위" && opponent === "가위") ||
    (player === "보" && opponent === "바위");

  return win ? "승리" : "패배";
}

function formatTime(ts) {
  try {
    return dtf.format(new Date(ts));
  } catch {
    return "";
  }
}

function normalizeMode(value) {
  return value === "duo" ? "duo" : "solo";
}

function loadMode() {
  try {
    return normalizeMode(localStorage.getItem(MODE_KEY));
  } catch {
    return "solo";
  }
}

function saveMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // ignore
  }
}

function loadScore() {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return { wins: 0, losses: 0, draws: 0 };

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { wins: 0, losses: 0, draws: 0 };

    return {
      wins: Number(parsed.wins) || 0,
      losses: Number(parsed.losses) || 0,
      draws: Number(parsed.draws) || 0,
    };
  } catch {
    return { wins: 0, losses: 0, draws: 0 };
  }
}

function saveScore(score) {
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(score));
  } catch {
    // ignore
  }
}

function totalGames(score) {
  return (score.wins || 0) + (score.losses || 0) + (score.draws || 0);
}

function renderScore(score) {
  byId("wins").textContent = String(score.wins);
  byId("losses").textContent = String(score.losses);
  byId("draws").textContent = String(score.draws);
}

function rateText(numerator, denominator) {
  if (!denominator) return "-";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function renderStats(score, mode) {
  const total = totalGames(score);
  const wins = score.wins || 0;
  const losses = score.losses || 0;
  const draws = score.draws || 0;

  byId("total-games").textContent = String(total);
  byId("participants").textContent = mode === "duo" ? "2명" : "1명";

  byId("p1-winrate-label").textContent = mode === "duo" ? "플레이어 1 승률" : "나 승률";
  byId("p2-winrate-label").textContent = mode === "duo" ? "플레이어 2 승률" : "컴퓨터 승률";

  byId("p1-winrate").textContent = rateText(wins, total);
  byId("p2-winrate").textContent = rateText(losses, total);
  byId("draw-rate").textContent = rateText(draws, total);
}

function setRound(player, opponent, result) {
  byId("player-choice").textContent = player;
  byId("opponent-choice").textContent = opponent;
  byId("result").textContent = result;
}

function setLabels(mode) {
  byId("player-label").textContent = mode === "duo" ? "플레이어 1" : "나";
  byId("opponent-label").textContent = mode === "duo" ? "플레이어 2" : "컴퓨터";
}

function setHint(mode, text) {
  if (text) {
    byId("turn-hint").textContent = text;
    return;
  }

  byId("turn-hint").textContent =
    mode === "duo" ? "2명 모드: 플레이어 1부터 선택하세요." : "1명 모드: 나 vs 컴퓨터";
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => {
        const mode = normalizeMode(x.mode);
        const p1 = String(x.p1 ?? x.player ?? "-");
        const p2 = String(x.p2 ?? x.opponent ?? x.cpu ?? "-");
        const result = String(x.result || "-");

        return {
          ts: Number(x.ts) || Date.now(),
          mode,
          p1,
          p2,
          result,
        };
      });
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function historyText(h) {
  if (h.mode === "duo") return `P1: ${h.p1} / P2: ${h.p2}`;
  return `나: ${h.p1} / 컴퓨터: ${h.p2}`;
}

function renderHistory(history) {
  const list = byId("history");
  const empty = byId("history-empty");

  list.innerHTML = "";
  empty.hidden = history.length > 0;

  for (const h of history) {
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = `${formatTime(h.ts)} · ${h.mode === "duo" ? "2명" : "1명"}`;

    const main = document.createElement("div");
    main.className = "history-main";

    const text = document.createElement("div");
    text.className = "history-text";
    text.textContent = historyText(h);

    const result = document.createElement("div");
    result.className = "history-result";
    result.textContent = h.result;

    main.append(text, result);
    li.append(meta, main);
    list.append(li);
  }
}

function main() {
  let mode = loadMode();
  let score = loadScore();
  let history = loadHistory();
  let pendingP1 = null;

  const modeSelect = byId("mode");
  const cancelTurn = byId("cancel-turn");

  function cancelPending() {
    pendingP1 = null;
    cancelTurn.hidden = true;
    setRound("-", "-", "-");
    setHint(mode);
  }

  function applyMode(nextMode) {
    mode = normalizeMode(nextMode);
    modeSelect.value = mode;
    saveMode(mode);

    setLabels(mode);
    renderStats(score, mode);

    cancelPending();
    setHint(mode);
  }

  renderScore(score);
  renderStats(score, mode);
  renderHistory(history);
  setLabels(mode);
  setHint(mode);

  applyMode(mode);

  modeSelect.addEventListener("change", () => {
    const next = normalizeMode(modeSelect.value);
    if (next === mode) return;

    score = { wins: 0, losses: 0, draws: 0 };
    history = [];
    saveScore(score);
    saveHistory(history);

    renderScore(score);
    renderHistory(history);

    applyMode(next);
  });

  for (const button of document.querySelectorAll("button.choice")) {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;
      if (!choice) return;

      if (mode === "solo") {
        const cpu = getCpuChoice();
        const result = decide(choice, cpu);

        setRound(choice, cpu, result);

        if (result === "승리") score.wins += 1;
        else if (result === "패배") score.losses += 1;
        else score.draws += 1;

        history = [{ ts: Date.now(), mode, p1: choice, p2: cpu, result }, ...history].slice(
          0,
          MAX_HISTORY,
        );

        saveScore(score);
        saveHistory(history);

        renderScore(score);
        renderStats(score, mode);
        renderHistory(history);
        setHint(mode);
        return;
      }

      if (!pendingP1) {
        pendingP1 = choice;
        cancelTurn.hidden = false;
        setRound("선택 완료", "-", "플레이어 2 차례");
        setHint(mode, "플레이어 2가 선택하세요.");
        return;
      }

      const p1 = pendingP1;
      const p2 = choice;
      pendingP1 = null;
      cancelTurn.hidden = true;

      const result = decide(p1, p2);
      setRound(p1, p2, result);

      if (result === "승리") score.wins += 1;
      else if (result === "패배") score.losses += 1;
      else score.draws += 1;

      history = [{ ts: Date.now(), mode, p1, p2, result }, ...history].slice(0, MAX_HISTORY);

      saveScore(score);
      saveHistory(history);

      renderScore(score);
      renderStats(score, mode);
      renderHistory(history);
      setHint(mode);
    });
  }

  cancelTurn.addEventListener("click", cancelPending);

  byId("reset").addEventListener("click", () => {
    score = { wins: 0, losses: 0, draws: 0 };
    saveScore(score);
    renderScore(score);
    renderStats(score, mode);
    cancelPending();
  });

  byId("clear-history").addEventListener("click", () => {
    history = [];
    saveHistory(history);
    renderHistory(history);
  });
}

main();
