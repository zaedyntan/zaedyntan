const phases = [
  { name: 'Work', duration: 25 * 60 },
  { name: 'Break', duration: 5 * 60 }
];

let currentPhaseIndex = 0;
let timeLeft = phases[0].duration;
let interval = null;

const display = document.getElementById('timer');
const phaseNameDisplay = document.getElementById('phase-name');
const startBtn = document.getElementById('start');
const resetBtn = document.getElementById('reset');

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateDisplay() {
  const phase = phases[currentPhaseIndex];
  phaseNameDisplay.textContent = phase.name;
  display.textContent = formatTime(timeLeft);
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
  if (interval) {
    clearInterval(interval);
    interval = null;
    startBtn.textContent = 'Start';
    return;
  }

  startBtn.textContent = 'Pause';
  interval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
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
  timeLeft = phases[0].duration;
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

updateDisplay();

