// Custom Timer with add/remove segments support
// Expects the following DOM ids: 
// #timer, #phase-name, #progress-bar, #start, #reset, 
// #phase-list, #phase-form, #phase-name-input, #phase-duration-input

const phases = [];
let currentPhaseIndex = 0;
let timeLeft = 0;
let interval = null;
let running = false;

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
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function currentPhase() { return phases[currentPhaseIndex] || null; }

function updateDisplay() {
  const phase = currentPhase();
  if (!phase) {
    display.textContent = '00:00';
    phaseNameDisplay.textContent = 'No segments';
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', '0');
    return;
  }
  display.textContent = formatTime(timeLeft);
  phaseNameDisplay.textContent = phase.name;
  const pct = Math.max(0, Math.min(100, ((phase.duration - timeLeft) / phase.duration) * 100));
  progressBar.style.width = pct + '%';
  progressBar.setAttribute('aria-valuenow', String(Math.round(pct)));
}

function renderPhaseList() {
  phaseList.innerHTML = '';
  phases.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex align-items-center justify-content-between';
    li.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-secondary">${i + 1}</span>
        <strong>${p.name}</strong>
        <span class="text-body-secondary">(${formatTime(p.duration)})</span>
        ${i === currentPhaseIndex ? '<span class="badge bg-teal">Current</span>' : ''}
      </div>
      <div class="btn-group btn-group-sm">
        <button class="btn btn-outline-warning" data-action="move-up" ${i===0?'disabled':''}><i class="bi bi-arrow-up"></i></button>
        <button class="btn btn-outline-warning" data-action="move-down" ${i===phases.length-1?'disabled':''}><i class="bi bi-arrow-down"></i></button>
        <button class="btn btn-outline-danger" data-action="remove"><i class="bi bi-trash"></i></button>
      </div>`;
    li.querySelector('[data-action="remove"]').addEventListener('click', () => removePhase(i));
    li.querySelector('[data-action="move-up"]').addEventListener('click', () => movePhase(i, -1));
    li.querySelector('[data-action="move-down"]').addEventListener('click', () => movePhase(i, +1));
    phaseList.appendChild(li);
  });
}

function addPhase(name, seconds) {
  phases.push({ name, duration: seconds });
  if (phases.length === 1) { currentPhaseIndex = 0; timeLeft = seconds; }
  renderPhaseList(); updateDisplay();
}

function removePhase(index) {
  if (index < 0 || index >= phases.length) return;
  const removingCurrent = index === currentPhaseIndex;
  phases.splice(index, 1);

  if (phases.length === 0) {
    clearInterval(interval); interval = null; running = false;
    startBtn.textContent = 'Start'; currentPhaseIndex = 0; timeLeft = 0;
  } else {
    if (index < currentPhaseIndex) currentPhaseIndex -= 1;
    else if (removingCurrent) {
      if (currentPhaseIndex >= phases.length) currentPhaseIndex = phases.length - 1;
      timeLeft = phases[currentPhaseIndex].duration;
    }
  }
  renderPhaseList(); updateDisplay();
}

function movePhase(index, delta) {
  const j = index + delta; if (j < 0 || j >= phases.length) return;
  [phases[index], phases[j]] = [phases[j], phases[index]];
  if (currentPhaseIndex === index) currentPhaseIndex = j;
  else if (currentPhaseIndex === j) currentPhaseIndex = index;
  renderPhaseList(); updateDisplay();
}

function nextPhase() {
  if (phases.length === 0) return;
  currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
  timeLeft = phases[currentPhaseIndex].duration; updateDisplay();
}

function tick() {
  if (!running) return;
  if (timeLeft > 0) { timeLeft -= 1; updateDisplay(); return; }
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); o.connect(ctx.destination); o.start();
    setTimeout(()=>{ o.stop(); ctx.close(); }, 200);
  } catch {}
  nextPhase();
}

function startStop() {
  if (running) { running = false; clearInterval(interval); startBtn.textContent = 'Start'; }
  else {
    if (!currentPhase()) return;
    running = true; startBtn.textContent = 'Pause';
    clearInterval(interval); interval = setInterval(tick, 1000);
  }
}

function resetAll() {
  running = false; clearInterval(interval); startBtn.textContent = 'Start';
  currentPhaseIndex = 0; timeLeft = currentPhase() ? currentPhase().duration : 0;
  updateDisplay(); renderPhaseList();
}

phaseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = (phaseNameInput.value || '').trim() || 'Segment';
  const mins = parseInt(phaseDurationInput.value, 10);
  if (Number.isFinite(mins) && mins > 0) {
    addPhase(name, mins * 60);
    phaseNameInput.value = ''; phaseDurationInput.value = ''; phaseNameInput.focus();
  }
});

startBtn.addEventListener('click', startStop);
resetBtn.addEventListener('click', resetAll);

addPhase('Work', 25 * 60);
addPhase('Break', 5 * 60);
timeLeft = (phases[0] || {}).duration || 0;
updateDisplay(); renderPhaseList();
