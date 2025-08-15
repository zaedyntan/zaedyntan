const phases = [];
let currentPhaseIndex = 0;
let timeLeft = 0;
let interval = null;

const display = document.getElementById('timer');
const phaseNameDisplay = document.getElementById('phase-name');
const progressBar = document.getElementById('progress-bar');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');
const phaseList = document.getElementById('phase-list');
const phaseForm = document.getElementById('phase-form');
const phaseNameInput = document.getElementById('phase-name-input');
const phaseDurationInput = document.getElementById('phase-duration-input');

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderPhaseList() {
  phaseList.innerHTML = '';
  phases.forEach((phase, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = phase.name;
    const badge = document.createElement('span');
    badge.className = 'badge bg-secondary';
    badge.textContent = formatTime(phase.duration);
    li.appendChild(badge);
    if (index === currentPhaseIndex) {
      li.classList.add('active');
    }
    phaseList.appendChild(li);
  });
}

function addPhase(name, duration) {
  phases.push({ name, duration });
  renderPhaseList();
  if (phases.length === 1) {
    currentPhaseIndex = 0;
    timeLeft = phases[0].duration;
    updateDisplay();
  }
}

phaseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = phaseNameInput.value.trim();
  const minutes = parseInt(phaseDurationInput.value, 10);
  if (!name || isNaN(minutes) || minutes <= 0) return;
  addPhase(name, minutes * 60);
  phaseNameInput.value = '';
  phaseDurationInput.value = '';
});

function updateDisplay() {
  if (phases.length === 0) {
    display.textContent = '00:00';
    phaseNameDisplay.textContent = '';
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', 0);
    return;
  }

  const phase = phases[currentPhaseIndex];
  phaseNameDisplay.textContent = phase.name;
  display.textContent = formatTime(timeLeft);
  const progress = Math.min(
    ((phase.duration - timeLeft) / phase.duration) * 100,
    100
  );
  progressBar.style.width = `${progress}%`;
  progressBar.setAttribute('aria-valuenow', progress);
  renderPhaseList();
}

function beep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = 1000;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, 500);
}

function nextPhase() {
  beep();
  currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
  timeLeft = phases[currentPhaseIndex].duration;
  updateDisplay();
}

function startTimer() {
  if (phases.length === 0) return;

  if (interval) {
    clearInterval(interval);
    interval = null;
    startBtn.textContent = 'Start';
    return;
  }

  startBtn.textContent = 'Pause';
  interval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      nextPhase();
    } else {
      updateDisplay();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(interval);
  interval = null;
  startBtn.textContent = 'Start';
  currentPhaseIndex = 0;
  timeLeft = phases[0] ? phases[0].duration : 0;
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Default phases
addPhase('Work', 25 * 60);
addPhase('Break', 5 * 60);
timeLeft = phases[0].duration;
updateDisplay();

