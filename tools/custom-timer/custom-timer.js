(() => {
  const phases = []; // {name, duration, type?: 'loop'}
  let current = 0;
  let timeLeft = 0;
  let timer = null;

  const $ = (id) => document.getElementById(id);
  const display = $('timer');
  const phaseNameDisplay = $('phase-name');
  const progressBar = $('progress-bar');
  const startBtn = $('start');
  const resetBtn = $('reset');
  const phaseList = $('phase-list');
  const form = $('phase-form');
  const nameInput = $('phase-name-input');
  const durationInput = $('phase-duration-input');
  const addLoopBtn = document.getElementById('add-loop');

  function formatTime(s) {
    const m = Math.floor(s/60), sec = s%60;
    return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  function beep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1000;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.05;
    osc.start(); setTimeout(()=>{osc.stop(); ctx.close()}, 250);
  }

  function renderList() {
    phaseList.innerHTML = '';
    phases.forEach((p, i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.textContent = p.type === 'loop' ? `↻ Loop to start` : p.name;
      const right = document.createElement('span');
      right.className = 'badge bg-secondary';
      right.textContent = p.type === 'loop' ? '' : formatTime(p.duration);
      if (i === current) li.classList.add('active');
      phaseList.appendChild(li);
    });
  }

  function render() {
    if (!phases.length) {
      display.textContent = '00:00';
      phaseNameDisplay.textContent = '';
      progressBar.style.width = '0%';
      progressBar.setAttribute('aria-valuenow','0');
      return;
    }
    const p = phases[current];
    phaseNameDisplay.textContent = p.type === 'loop' ? 'Loop' : p.name;
    if (p.type === 'loop') {
      display.textContent = '--:--';
      progressBar.style.width = '0%';
      progressBar.setAttribute('aria-valuenow','0');
    } else {
      display.textContent = formatTime(timeLeft);
      const pct = ((p.duration - timeLeft)/p.duration)*100;
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', String(pct));
    }
    renderList();
  }

  function stop() {
    clearInterval(timer); timer = null;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('btn-secondary'); startBtn.classList.add('btn-teal');
    render();
  }

  function nextNonLoop() {
    current += 1;
    if (current >= phases.length) { stop(); return; }
    const p = phases[current];
    if (p.type === 'loop') {
      current = 0;
    }
    const n = phases[current];
    timeLeft = n.type === 'loop' ? 0 : n.duration;
    render();
  }

  function tick() {
    const p = phases[current];
    if (!p || p.type === 'loop') { stop(); return; }
    if (timeLeft > 0) {
      timeLeft -= 1; render();
    } else {
      beep();
      if (current + 1 < phases.length) {
        current += 1;
        const n = phases[current];
        if (n.type === 'loop') {
          current = 0;
        }
        const cur = phases[current];
        timeLeft = cur.type === 'loop' ? 0 : cur.duration;
        render();
      } else {
        stop();
      }
    }
  }

  function start() {
    if (timer) {
      clearInterval(timer); timer = null;
      startBtn.textContent = 'Resume';
      startBtn.classList.remove('btn-secondary'); startBtn.classList.add('btn-teal');
      return;
    }
    if (!phases.length) return;
    if (timeLeft === 0 && phases[0].type !== 'loop') timeLeft = phases[0].duration;
    timer = setInterval(tick, 1000);
    startBtn.textContent = 'Pause';
    startBtn.classList.remove('btn-teal'); startBtn.classList.add('btn-secondary');
  }

  function reset() {
    clearInterval(timer); timer = null;
    current = 0;
    timeLeft = phases[0] && phases[0].type !== 'loop' ? phases[0].duration : 0;
    startBtn.textContent = 'Start';
    startBtn.classList.remove('btn-secondary'); startBtn.classList.add('btn-teal');
    render();
  }

  function skip() { beep(); nextNonLoop(); }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (phases.some(p => p.type === 'loop')) return; // lock after loop
    const name = nameInput.value.trim();
    const mins = parseInt(durationInput.value, 10);
    if (!name || !Number.isFinite(mins) || mins <= 0) return;
    phases.push({ name, duration: mins*60 });
    if (phases.length === 1) { current = 0; timeLeft = phases[0].duration; }
    nameInput.value = ''; durationInput.value = '';
    render();
  });

  addLoopBtn?.addEventListener('click', () => {
    if (!phases.length) return;            // need at least one segment before loop
    if (phases.some(p => p.type === 'loop')) return; // only one loop at end
    phases.push({ type: 'loop' });
    render();
  });

  document.getElementById('skip')?.addEventListener('click', skip);
  startBtn?.addEventListener('click', start);
  resetBtn?.addEventListener('click', reset);

  // Defaults
  phases.push({ name: 'Work', duration: 25*60 }, { name: 'Break', duration: 5*60 });
  current = 0; timeLeft = phases[0].duration;
  render();
})();
