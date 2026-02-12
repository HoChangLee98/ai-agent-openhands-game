const CHOICES = ["가위", "바위", "보"];

const SCORE_KEY = "rps-score-v1";
const HISTORY_KEY = "rps-history-v1";
const MAX_HISTORY = 30;

const dtf = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "short",
  timeStyle: "medium",
});

function getCpuChoice() {
  return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function decide(player, cpu) {
  if (player === cpu) return "무승부";

  const win =
    (player === "가위" && cpu === "보") ||
    (player === "바위" && cpu === "가위") ||
    (player === "보" && cpu === "바위");

  return win ? "승리" : "패배";
}

function formatTime(ts) {
  try {
    return dtf.format(new Date(ts));
  } catch {
    return "";
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
  document.getElementById("wins").textContent = String(score.wins);
  document.getElementById("losses").textContent = String(score.losses);
  document.getElementById("draws").textContent = String(score.draws);
}

function renderStats(score) {
  document.getElementById("total-games").textContent = String(totalGames(score));
  document.getElementById("participants").textContent = "2명";
}

function setRound(player, cpu, result) {
  document.getElementById("player-choice").textContent = player;
  document.getElementById("cpu-choice").textContent = cpu;
  document.getElementById("result").textContent = result;
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        ts: Number(x.ts) || Date.now(),
        player: String(x.player || "-"),
        cpu: String(x.cpu || "-"),
        result: String(x.result || "-"),
      }));
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

function renderHistory(history) {
  const list = document.getElementById("history");
  const empty = document.getElementById("history-empty");

  list.innerHTML = "";
  empty.hidden = history.length > 0;

  for (const h of history) {
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = formatTime(h.ts);

    const main = document.createElement("div");
    main.className = "history-main";

    const text = document.createElement("div");
    text.className = "history-text";
    text.textContent = `나: ${h.player} / 컴퓨터: ${h.cpu}`;

    const result = document.createElement("div");
    result.className = "history-result";
    result.textContent = h.result;

    main.append(text, result);
    li.append(meta, main);
    list.append(li);
  }
}

function main() {
  let score = loadScore();
  let history = loadHistory();

  renderScore(score);
  renderStats(score);
  renderHistory(history);

  for (const button of document.querySelectorAll("button.choice")) {
    button.addEventListener("click", () => {
      const player = button.dataset.choice;
      const cpu = getCpuChoice();
      const result = decide(player, cpu);

      setRound(player, cpu, result);

      if (result === "승리") score.wins += 1;
      else if (result === "패배") score.losses += 1;
      else score.draws += 1;

      history = [{ ts: Date.now(), player, cpu, result }, ...history].slice(0, MAX_HISTORY);

      saveScore(score);
      saveHistory(history);

      renderScore(score);
      renderStats(score);
      renderHistory(history);
    });
  }

  document.getElementById("reset").addEventListener("click", () => {
    score = { wins: 0, losses: 0, draws: 0 };
    saveScore(score);
    renderScore(score);
    renderStats(score);
    setRound("-", "-", "-");
  });

  document.getElementById("clear-history").addEventListener("click", () => {
    history = [];
    saveHistory(history);
    renderHistory(history);
  });
}

main();
