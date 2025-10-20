// === main.js ===
(() => {
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  function resize() {
    const w = Math.floor(window.innerWidth * DPR);
    const h = Math.floor(window.innerHeight * DPR);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  const channel = new BroadcastChannel('electric-balls');
  const myId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;

  let peers = {};
  let shockwaves = [];
  let inCollision = {};

  function sampleMetrics() {
    return {
      id: myId,
      t: Date.now(),
      cx: window.screenX + window.outerWidth/2,
      cy: window.screenY + window.outerHeight/2
    };
  }

  function broadcast() {
    channel.postMessage({ type: 'metrics', payload: sampleMetrics() });
  }

  // Send a leave message on unload
  window.addEventListener('beforeunload', () => {
    channel.postMessage({ type: 'leave', payload: { id: myId } });
  });

  channel.addEventListener('message', (ev) => {
    const { type, payload } = ev.data || {};
    if (type === 'metrics' && payload.id !== myId) {
      peers[payload.id] = payload;
    } else if (type === 'leave') {
      delete peers[payload.id];
    }
  });

  function drawBall(cx, cy, r) {
    const grad = ctx.createRadialGradient(cx - r*0.3, cy - r*0.3, r*0.2, cx, cy, r);
    grad.addColorStop(0, 'rgba(180,220,255,0.95)');
    grad.addColorStop(1, 'rgba(70,120,220,0.85)');
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = grad; ctx.fill();
  }

  function drawElectricLine(x1, y1, x2, y2) {
    const segments = 20;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t + (Math.random()-0.5)*20;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(x2, y2);
    const grad = ctx.createLinearGradient(x1,y1,x2,y2);
    grad.addColorStop(0,'rgba(0,200,255,0.9)');
    grad.addColorStop(1,'rgba(255,0,200,0.9)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,180,255,1)';
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function addShockwave(x, y) {
    shockwaves.push({ x, y, born: performance.now() });
  }

  function renderShockwaves() {
    const life = 1000;
    for (let i = shockwaves.length-1; i >= 0; i--) {
      const sw = shockwaves[i];
      const age = performance.now() - sw.born;
      if (age > life) { shockwaves.splice(i,1); continue; }
      const k = age / life;
      const r = k * Math.max(canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, r, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(120,220,255,${1-k})`;
      ctx.lineWidth = 8 * (1-k);
      ctx.stroke();
    }
  }

  function render() {
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.5;
    const r = Math.min(canvas.width, canvas.height) * 0.08;

    drawBall(cx, cy, r);

    const now = Date.now();
    for (const [id, other] of Object.entries(peers)) {
      // Remove peers that haven’t updated in over 3 seconds
      if (now - other.t > 3000) {
        delete peers[id];
        continue;
      }

      const ox = other.cx - window.screenX;
      const oy = other.cy - window.screenY;
      drawBall(ox, oy, r);
      drawElectricLine(cx, cy, ox, oy);

      const dist = Math.hypot(ox - cx, oy - cy);
      if (dist < r*2 && !inCollision[id]) {
        inCollision[id] = true;
        addShockwave((cx+ox)/2, (cy+oy)/2);
      } else if (dist >= r*2) {
        inCollision[id] = false;
      }
    }

    renderShockwaves();
    requestAnimationFrame(render);
  }

  setInterval(() => {
    broadcast();
    const entries = Object.values(peers).filter(p => Date.now() - p.t <= 3000);
    document.getElementById('status').textContent = entries.length > 0
      ? `${entries.length} Peers connected`
      : "Waiting for peers…";
  }, 100);

  render();
})();