const moodTip = document.getElementById("moodTip");
const ageBandSelect = document.getElementById("ageBandSelect");
const moodButtons = document.querySelectorAll(".mood");
const breathBtn = document.getElementById("breathBtn");
const breathCircle = document.getElementById("breathCircle");
const breathText = document.getElementById("breathText");
const timerDisplay = document.getElementById("timerDisplay");
const timerBtn = document.getElementById("timerBtn");
const quickCalmBtn = document.getElementById("quickCalmBtn");
const choiceBtn = document.getElementById("choiceBtn");
const choiceText = document.getElementById("choiceText");
const starBtn = document.getElementById("starBtn");
const starsEl = document.getElementById("stars");
const timerPresetButtons = document.querySelectorAll("[data-mins]");
const soundButtons = document.querySelectorAll(".sound-btn");
const soundStopBtn = document.getElementById("soundStopBtn");
const soundVolume = document.getElementById("soundVolume");
const energyButtons = document.querySelectorAll(".energy-btn");
const energyPlan = document.getElementById("energyPlan");
const pathwayButtons = document.querySelectorAll(".pathway-btn");
const pathwayPlan = document.getElementById("pathwayPlan");
const routineInput = document.getElementById("routineInput");
const addRoutineBtn = document.getElementById("addRoutineBtn");
const startRoutineBtn = document.getElementById("startRoutineBtn");
const clearRoutineBtn = document.getElementById("clearRoutineBtn");
const routineList = document.getElementById("routineList");
const routineNow = document.getElementById("routineNow");
const coregScript = document.getElementById("coregScript");
const nextScriptBtn = document.getElementById("nextScriptBtn");
const actionsTodayEl = document.getElementById("actionsToday");
const streakCountEl = document.getElementById("streakCount");
const totalActionsEl = document.getElementById("totalActions");
const lastActionEl = document.getElementById("lastAction");
const resetProgressBtn = document.getElementById("resetProgressBtn");
const pinInput = document.getElementById("pinInput");
const savePinBtn = document.getElementById("savePinBtn");
const pinUnlockInput = document.getElementById("pinUnlockInput");
const unlockBtn = document.getElementById("unlockBtn");
const pinStatus = document.getElementById("pinStatus");
const triggerInput = document.getElementById("triggerInput");
const supportInput = document.getElementById("supportInput");
const outcomeInput = document.getElementById("outcomeInput");
const saveDebriefBtn = document.getElementById("saveDebriefBtn");
const clearDebriefBtn = document.getElementById("clearDebriefBtn");
const debriefTrend = document.getElementById("debriefTrend");
const debriefList = document.getElementById("debriefList");

let breathActive = false;
let breathPhase = 0;
let breathInterval = null;

let currentSeconds = 5 * 60;
let timerRunning = false;
let timerInterval = null;
let quickCalmInterval = null;

let stars = Number(localStorage.getItem("calmStars") || 0);
let customRoutine = JSON.parse(localStorage.getItem("customRoutine") || "[]");
let routineIndex = 0;
let activeOscillator = null;
let activeGain = null;
let audioContext = null;
let coregIndex = 0;
let parentUnlocked = false;
let pinCode = localStorage.getItem("parentPin") || "";
let ageBand = localStorage.getItem("ageBand") || "8-10";
let debriefEntries = JSON.parse(localStorage.getItem("debriefEntries") || "[]");

const progress = JSON.parse(
  localStorage.getItem("calmProgress") ||
    JSON.stringify({
      totalActions: 0,
      todayDate: "",
      todayCount: 0,
      lastDate: "",
      streak: 0,
      lastActionLabel: "",
    })
);

const ageContent = {
  "5-7": {
    calmIdeas: [
      "Squeeze your hands like lemons, then let go.",
      "Smell the flower, blow the candle for 5 breaths.",
      "Hug your pillow and count to 10 slowly.",
      "Do 10 wall pushes like a superhero.",
      "Name 3 colors you can see right now.",
    ],
    moodTips: {
      stormy: "Big feelings are okay. I am here. Let's do one slow belly breath.",
      wiggly: "Your body needs a move break. Jump 10 times, then pause.",
      okay: "Nice work. Let's keep calm with one balloon breath.",
    },
    coregScripts: [
      "You are safe with me. We can calm your body together.",
      "You are having a hard time, not giving me a hard time.",
      "Let's make your body feel cozy first, then we can talk.",
    ],
  },
  "8-10": {
    calmIdeas: [
      "Give your hands a tight squeeze and release.",
      "Take a sip of water and count 5 slow breaths.",
      "Push your palms together for 10 seconds.",
      "Name 3 things you can see, 2 you can hear, and 1 you can feel.",
      "Do 10 wall pushes to move extra energy safely.",
      "Hug a pillow and breathe like a balloon.",
    ],
    moodTips: {
      stormy: "You're safe. Put one hand on your chest and breathe out slowly.",
      wiggly: "Let's move then settle. Do 10 jumps, then 3 slow breaths.",
      okay: "Great work. Keep your calm with one balloon breath.",
    },
    coregScripts: [
      "I can see this is hard right now. You are safe. I will stay with you while your body calms.",
      "Your feelings are real. We can do this together, one breath at a time.",
      "You are not in trouble. Your body is asking for help, and we can help it.",
      "Let's make your body feel safe first, then we can solve the problem.",
      "Thank you for trying. Small calm steps count and I am proud of you.",
    ],
  },
  "11-13": {
    calmIdeas: [
      "Do 60 seconds of wall push-ups to discharge stress energy.",
      "Try box breathing: in 4, hold 4, out 4, hold 4.",
      "Name the feeling and rate it 1-10, then breathe.",
      "Cold water on wrists for 30 seconds, then exhale slowly.",
      "Grounding scan: 5 sights, 4 touches, 3 sounds.",
    ],
    moodTips: {
      stormy: "Your nervous system is overloaded, not broken. Slow the exhale first.",
      wiggly: "Channel the energy safely: 1 minute movement, then reset breathing.",
      okay: "Good regulation window. Start a short focus sprint now.",
    },
    coregScripts: [
      "I can see your system is overloaded. Let's regulate first and talk second.",
      "You're safe and not alone. We can lower this wave together.",
      "This moment does not define you. Let's take one stabilizing step now.",
    ],
  },
};

let calmIdeas = ageContent[ageBand].calmIdeas;
let moodTips = ageContent[ageBand].moodTips;
let coregScripts = ageContent[ageBand].coregScripts;

const energyPlans = {
  1: "Energy 1: Keep it gentle. Try one long exhale and a cozy squeeze.",
  2: "Energy 2: You are almost regulated. Do 3 slow balloon breaths.",
  3: "Energy 3: Balanced zone. Start a 5-minute focus timer.",
  4: "Energy 4: Use heavy work first: 10 wall pushes, then breathing.",
  5: "Energy 5: Big energy. Move safely for 60 seconds, then quick calm.",
};

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function diffInDays(fromDateStr, toDateStr) {
  const from = new Date(`${fromDateStr}T00:00:00`);
  const to = new Date(`${toDateStr}T00:00:00`);
  const ms = to.getTime() - from.getTime();
  return Math.round(ms / 86400000);
}

function updateProgress(actionLabel) {
  const today = getTodayKey();
  if (progress.todayDate !== today) {
    progress.todayDate = today;
    progress.todayCount = 0;
  }

  if (progress.lastDate) {
    const gap = diffInDays(progress.lastDate, today);
    if (gap === 1) {
      progress.streak += 1;
    } else if (gap > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }

  progress.lastDate = today;
  progress.todayCount += 1;
  progress.totalActions += 1;
  progress.lastActionLabel = `${actionLabel} at ${new Date().toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;
  localStorage.setItem("calmProgress", JSON.stringify(progress));
  renderProgress();
}

function renderProgress() {
  actionsTodayEl.textContent = String(progress.todayCount);
  streakCountEl.textContent = `${progress.streak} day${progress.streak === 1 ? "" : "s"}`;
  totalActionsEl.textContent = String(progress.totalActions);
  lastActionEl.textContent = progress.lastActionLabel
    ? `Last: ${progress.lastActionLabel}`
    : "No calm activity recorded yet.";
}

function refreshParentLockUI() {
  if (!pinCode) {
    parentUnlocked = true;
    pinStatus.textContent = "No PIN set. Parent controls are open.";
    return;
  }
  if (parentUnlocked) {
    pinStatus.textContent = "Parent controls unlocked.";
  } else {
    pinStatus.textContent = "Parent controls locked. Enter PIN to unlock.";
  }
}

function canUseParentControl() {
  if (!pinCode || parentUnlocked) {
    return true;
  }
  pinStatus.textContent = "Enter parent PIN to continue.";
  return false;
}

function renderStars() {
  const full = "★".repeat(Math.min(stars, 5));
  const empty = "☆".repeat(Math.max(0, 5 - stars));
  starsEl.textContent = full + empty;
}

function renderRoutine() {
  routineList.innerHTML = "";
  if (!customRoutine.length) {
    const li = document.createElement("li");
    li.textContent = "No custom steps yet.";
    routineList.appendChild(li);
    return;
  }
  customRoutine.forEach((step, idx) => {
    const li = document.createElement("li");
    li.textContent = `${idx + 1}. ${step}`;
    routineList.appendChild(li);
  });
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function setTimerSeconds(seconds) {
  currentSeconds = seconds;
  timerDisplay.textContent = formatTime(currentSeconds);
}

function cycleBreathingPrompt() {
  const phases = [
    { text: "Breathe In (4)", in: true },
    { text: "Hold (2)", in: true },
    { text: "Breathe Out (6)", in: false },
  ];

  const phase = phases[breathPhase % phases.length];
  breathText.textContent = phase.text;

  if (phase.in) {
    breathCircle.classList.add("breathe-in");
  } else {
    breathCircle.classList.remove("breathe-in");
  }

  breathPhase += 1;
}

function startBreathing() {
  if (breathActive) {
    clearInterval(breathInterval);
    breathActive = false;
    breathBtn.textContent = "Start Breathing";
    breathText.textContent = "Tap Start";
    breathCircle.classList.remove("breathe-in");
    return;
  }

  breathActive = true;
  breathBtn.textContent = "Stop Breathing";
  breathPhase = 0;
  cycleBreathingPrompt();
  breathInterval = setInterval(cycleBreathingPrompt, 4000);
}

function startOrStopTimer() {
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    timerBtn.textContent = "Start Timer";
    return;
  }

  timerRunning = true;
  timerBtn.textContent = "Pause Timer";
  timerInterval = setInterval(() => {
    currentSeconds -= 1;
    timerDisplay.textContent = formatTime(currentSeconds);
    if (currentSeconds <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerBtn.textContent = "Start Timer";
      timerDisplay.textContent = "Done!";
      stars = Math.min(5, stars + 1);
      localStorage.setItem("calmStars", String(stars));
      renderStars();
      updateProgress("Focus timer complete");
    }
  }, 1000);
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function stopSound() {
  if (activeOscillator) {
    activeOscillator.stop();
    activeOscillator.disconnect();
    activeGain.disconnect();
    activeOscillator = null;
    activeGain = null;
  }
}

function playCalmTone(kind) {
  stopSound();
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (kind === "rain") {
    osc.type = "sine";
    osc.frequency.value = 196;
  } else if (kind === "waves") {
    osc.type = "triangle";
    osc.frequency.value = 174;
  } else {
    osc.type = "sawtooth";
    osc.frequency.value = 130;
  }

  gain.gain.value = Number(soundVolume.value) / 1000;
  osc.start();
  activeOscillator = osc;
  activeGain = gain;
  updateProgress(`Sound started: ${kind}`);
}

function runQuickCalmFlow() {
  const sequence = [
    "Quick Calm started: hand on heart.",
    "Breathe in through your nose.",
    "Hold for 2.",
    "Breathe out slowly like blowing a candle.",
    "Great job. You are getting calmer.",
  ];

  let index = 0;
  moodTip.textContent = sequence[index];

  if (quickCalmInterval) {
    clearInterval(quickCalmInterval);
  }

  quickCalmInterval = setInterval(() => {
    index += 1;
    if (index >= sequence.length) {
      clearInterval(quickCalmInterval);
      stars = Math.min(5, stars + 1);
      localStorage.setItem("calmStars", String(stars));
      renderStars();
      updateProgress("Quick Calm complete");
      return;
    }
    moodTip.textContent = sequence[index];
  }, 4000);
}

function addRoutineStep() {
  if (!canUseParentControl()) {
    return;
  }
  const step = routineInput.value.trim();
  if (!step) {
    return;
  }
  customRoutine.push(step);
  localStorage.setItem("customRoutine", JSON.stringify(customRoutine));
  routineInput.value = "";
  renderRoutine();
}

function startRoutine() {
  if (!customRoutine.length) {
    routineNow.textContent = "Add at least one routine step first.";
    return;
  }
  routineNow.textContent = `Step ${routineIndex + 1}: ${customRoutine[routineIndex]}`;
  routineIndex = (routineIndex + 1) % customRoutine.length;
  updateProgress("Custom routine step");
}

function clearRoutine() {
  if (!canUseParentControl()) {
    return;
  }
  customRoutine = [];
  routineIndex = 0;
  localStorage.setItem("customRoutine", JSON.stringify(customRoutine));
  routineNow.textContent = "No custom routine running.";
  renderRoutine();
}

function showNextCoregScript() {
  coregIndex = (coregIndex + 1) % coregScripts.length;
  coregScript.textContent = coregScripts[coregIndex];
  updateProgress("Co-regulation prompt used");
}

function applyEnergyPlan(level) {
  const plan = energyPlans[level] || energyPlans[3];
  energyPlan.textContent = plan;
  updateProgress(`Energy check-in: ${level}`);
}

function savePin() {
  const value = pinInput.value.trim();
  if (value.length < 4 || value.length > 8 || !/^\d+$/.test(value)) {
    pinStatus.textContent = "PIN must be 4-8 digits.";
    return;
  }
  pinCode = value;
  localStorage.setItem("parentPin", pinCode);
  parentUnlocked = true;
  pinInput.value = "";
  pinStatus.textContent = "PIN saved and parent controls unlocked.";
}

function applyAgeBand() {
  calmIdeas = ageContent[ageBand].calmIdeas;
  moodTips = ageContent[ageBand].moodTips;
  coregScripts = ageContent[ageBand].coregScripts;
  coregIndex = 0;
  coregScript.textContent = coregScripts[0];
  moodTip.textContent = "Tip: Try a balloon breath to slow your body.";
}

function showPathway(pathway) {
  if (pathway === "pre") {
    pathwayPlan.textContent =
      "Pre-Meltdown Plan: (1) reduce demands and language, (2) offer two simple choices, (3) heavy work or movement for 60-90 sec, (4) slow exhale breathing, (5) praise any sign of recovery.";
    updateProgress("Pathway used: pre-meltdown");
    return;
  }
  pathwayPlan.textContent =
    "Meltdown Plan: (1) prioritize safety, (2) few words, calm tone, low light/noise, (3) no reasoning during peak distress, (4) co-regulate with breath and presence, (5) debrief only after full calm.";
  updateProgress("Pathway used: meltdown");
}

function getTopLabel(entries, key) {
  const counts = {};
  entries.forEach((item) => {
    const value = (item[key] || "").trim().toLowerCase();
    if (!value) {
      return;
    }
    counts[value] = (counts[value] || 0) + 1;
  });
  let best = "";
  let bestCount = 0;
  Object.keys(counts).forEach((label) => {
    if (counts[label] > bestCount) {
      best = label;
      bestCount = counts[label];
    }
  });
  return best ? `${best} (${bestCount})` : "N/A";
}

function renderDebriefs() {
  debriefList.innerHTML = "";
  if (!debriefEntries.length) {
    debriefTrend.textContent = "No debrief entries yet.";
    const li = document.createElement("li");
    li.textContent = "No logs saved yet.";
    debriefList.appendChild(li);
    return;
  }

  const latest = debriefEntries.slice(-5).reverse();
  latest.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.date}: Trigger=${entry.trigger}; Support=${entry.support}; Helped=${entry.outcome}`;
    debriefList.appendChild(li);
  });

  const topTrigger = getTopLabel(debriefEntries, "trigger");
  const topSupport = getTopLabel(debriefEntries, "support");
  debriefTrend.textContent = `Pattern: Top trigger ${topTrigger}. Most used support ${topSupport}.`;
}

function saveDebriefEntry() {
  if (!canUseParentControl()) {
    return;
  }
  const trigger = triggerInput.value.trim();
  const support = supportInput.value.trim();
  const outcome = outcomeInput.value.trim();
  if (!trigger || !support || !outcome) {
    debriefTrend.textContent = "Please complete trigger, support, and outcome.";
    return;
  }
  debriefEntries.push({
    date: new Date().toLocaleDateString(),
    trigger,
    support,
    outcome,
  });
  localStorage.setItem("debriefEntries", JSON.stringify(debriefEntries));
  triggerInput.value = "";
  supportInput.value = "";
  outcomeInput.value = "";
  renderDebriefs();
  updateProgress("Caregiver debrief saved");
}

function clearDebriefEntries() {
  if (!canUseParentControl()) {
    return;
  }
  debriefEntries = [];
  localStorage.setItem("debriefEntries", JSON.stringify(debriefEntries));
  renderDebriefs();
}

function unlockParentControls() {
  if (!pinCode) {
    parentUnlocked = true;
    pinStatus.textContent = "No PIN set. Parent controls are open.";
    return;
  }
  if (pinUnlockInput.value.trim() === pinCode) {
    parentUnlocked = true;
    pinUnlockInput.value = "";
    pinStatus.textContent = "Parent controls unlocked.";
    return;
  }
  pinStatus.textContent = "Incorrect PIN.";
}

moodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mood = button.dataset.mood;
    moodTip.textContent = moodTips[mood] || moodTips.okay;
  });
});

ageBandSelect.addEventListener("change", () => {
  ageBand = ageBandSelect.value;
  localStorage.setItem("ageBand", ageBand);
  applyAgeBand();
  updateProgress(`Age band set: ${ageBand}`);
});

timerPresetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const mins = Number(button.dataset.mins || "5");
    setTimerSeconds(mins * 60);
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerBtn.textContent = "Start Timer";
    }
  });
});

choiceBtn.addEventListener("click", () => {
  const next = calmIdeas[Math.floor(Math.random() * calmIdeas.length)];
  choiceText.textContent = next;
  updateProgress("Calm choice used");
});

starBtn.addEventListener("click", () => {
  stars = Math.min(5, stars + 1);
  localStorage.setItem("calmStars", String(stars));
  renderStars();
  updateProgress("Reward star added");
});

soundButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const kind = button.dataset.sound || "rain";
    playCalmTone(kind);
  });
});

soundVolume.addEventListener("input", () => {
  if (activeGain) {
    activeGain.gain.value = Number(soundVolume.value) / 1000;
  }
});

energyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyEnergyPlan(Number(button.dataset.energy || "3"));
  });
});

pathwayButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPathway(button.dataset.pathway || "pre");
  });
});

soundStopBtn.addEventListener("click", stopSound);
addRoutineBtn.addEventListener("click", addRoutineStep);
startRoutineBtn.addEventListener("click", startRoutine);
clearRoutineBtn.addEventListener("click", clearRoutine);
nextScriptBtn.addEventListener("click", showNextCoregScript);
savePinBtn.addEventListener("click", savePin);
unlockBtn.addEventListener("click", unlockParentControls);
saveDebriefBtn.addEventListener("click", saveDebriefEntry);
clearDebriefBtn.addEventListener("click", clearDebriefEntries);

resetProgressBtn.addEventListener("click", () => {
  if (!canUseParentControl()) {
    return;
  }
  progress.totalActions = 0;
  progress.todayDate = getTodayKey();
  progress.todayCount = 0;
  progress.lastDate = "";
  progress.streak = 0;
  progress.lastActionLabel = "";
  localStorage.setItem("calmProgress", JSON.stringify(progress));
  renderProgress();
});

breathBtn.addEventListener("click", startBreathing);
timerBtn.addEventListener("click", startOrStopTimer);
quickCalmBtn.addEventListener("click", runQuickCalmFlow);

renderStars();
setTimerSeconds(currentSeconds);
renderRoutine();
ageBandSelect.value = ageBand;
applyAgeBand();
if (progress.todayDate !== getTodayKey()) {
  progress.todayDate = getTodayKey();
  progress.todayCount = 0;
  localStorage.setItem("calmProgress", JSON.stringify(progress));
}
renderProgress();
refreshParentLockUI();
renderDebriefs();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
