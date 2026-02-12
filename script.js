const CHOICES = ["가위", "바위", "보"];
const STORAGE_KEY = "rps-score-v1";

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

function loadScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
}

function renderScore(score) {
  document.getElementById("wins").textContent = String(score.wins);
  document.getElementById("losses").textContent = String(score.losses);
  document.getElementById("draws").textContent = String(score.draws);
}

function setRound(player, cpu, result) {
  document.getElementById("player-choice").textContent = player;
  document.getElementById("cpu-choice").textContent = cpu;
  document.getElementById("result").textContent = result;
}

function main() {
  let score = loadScore();
  renderScore(score);

  for (const button of document.querySelectorAll("button.choice")) {
    button.addEventListener("click", () => {
      const player = button.dataset.choice;
      const cpu = getCpuChoice();
      const result = decide(player, cpu);

      setRound(player, cpu, result);

      if (result === "승리") score.wins += 1;
      else if (result === "패배") score.losses += 1;
      else score.draws += 1;

      saveScore(score);
      renderScore(score);
    });
  }

  document.getElementById("reset").addEventListener("click", () => {
    score = { wins: 0, losses: 0, draws: 0 };
    saveScore(score);
    renderScore(score);
    setRound("-", "-", "-");
  });
}

main();
