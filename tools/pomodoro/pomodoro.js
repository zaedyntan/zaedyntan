
(() => {
  const phases = [
    { name: 'Work', duration: 25 * 60 },
    { name: 'Break', duration: 5 * 60 },
  ];
  let currentPhaseIndex = 0;
  let timeLeft = phases[0].duration;
  let ticking = null;

  const $ = (id) => document.getElementById(id);
  const display = $('timer');
  const phaseNameDisplay = $('phase-name');
  const progressBar = $('progress-bar');
  const startBtn = $('start');
  const resetBtn = $('reset');
  const skipBtn = $('skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', () => { timeLeft = 1; tick(); });
  }
  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  function setProgress() {
    const p = phases[currentPhaseIndex];
    const pct = ((p.duration - timeLeft) / p.duration) * 100;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', String(pct));
  }

  function render() {
    const p = phases[currentPhaseIndex];
    phaseNameDisplay.textContent = p.name;
    display.textContent = formatTime(timeLeft);
    setProgress();
  }

  function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.05;
    osc.start();
    setTimeout(() => { osc.stop(); ctx.close(); }, 350);
  }

  function nextPhase() {
    currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
    timeLeft = phases[currentPhaseIndex].duration;
    render();
  }

  function tick() {
    if (timeLeft > 0) {
      timeLeft -= 1;
      render();
    } else {
      beep();
      nextPhase();
    }
  }

  function start() {
    if (ticking) return pause();
    ticking = setInterval(tick, 1000);
    startBtn.textContent = 'Pause';
    startBtn.classList.remove('btn-teal');
    startBtn.classList.add('btn-secondary');
  }

  function pause() {
    clearInterval(ticking);
    ticking = null;
    startBtn.textContent = 'Resume';
    startBtn.classList.remove('btn-secondary');
    startBtn.classList.add('btn-teal');
  }

  function reset() {
    clearInterval(ticking);
    ticking = null;
    currentPhaseIndex = 0;
    timeLeft = phases[0].duration;

    startBtn.textContent = 'Start';
    startBtn.classList.remove('btn-secondary');
    startBtn.classList.add('btn-teal');
    render();
  }

  function skip() {
    beep();
    nextPhase();
  }

  startBtn?.addEventListener('click', start);
  resetBtn?.addEventListener('click', reset);
  skipBtn?.addEventListener('click', skip);

  render();
})();
