// Fundo animado: trilhas de PCB + pulsos de corrente.
// O mouse é uma fonte de luz; na página do fotodiodo, fotodiodos nas trilhas
// acendem e geram corrente proporcional à irradiância (~1/d²).
// Na página do PIN, algumas trilhas viram linhas de RF com um diodo PIN em série
// (atenuador). A proximidade do cursor define a corrente I_F: a região I enche de
// portadores (modulação de condutividade), R ≈ K/I_F cai e a onda passa. Ao
// afastar o cursor, os portadores somem devagar (tempo de vida τ).

import { fillRich } from './notation.js';

const GRID = 24;
const DIRS = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const LIGHT_R = 110; // raio característico da influência do cursor (px)
const PD_EVERY = 4;  // 1 a cada N trilhas recebe um fotodiodo / vira linha de RF
const K_RF = 70;     // R ≈ K/I_F (Ω·mA) — BAP64 típico: 0,7 Ω @ 100 mA
const Z0 = 50;       // impedância da linha (Ω)
const TAU_RISE = 150; // ms: injeção de portadores
const TAU_FALL = 450; // ms: recombinação (τ) — lenta de propósito
const HOLE = '#ff5a6a';
const ELEC = '#4d9bff';
const SAFE = '#3cc98a';

const hexA = (a) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

export function startCircuitBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-circuit';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  let traces = [];
  let pulses = [];
  let packets = []; // ondas de RF (página PIN)
  let w = 0, h = 0, dpr = 1, nextSpawn = 0, lastFrame = 0;
  const mouse = { x: -9999, y: -9999, on: false, glow: 0 };

  const color = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();
  const isFoto = () => document.body.dataset.dev === 'foto';

  // Trilha: caminha na grade com segmentos retos e curvas de 45°, como roteamento de PCB.
  function makeTrace(idx) {
    const cols = Math.ceil(w / GRID), rows = Math.ceil(h / GRID);
    let x = Math.floor(Math.random() * cols) * GRID;
    let y = Math.floor(Math.random() * rows) * GRID;
    let d = Math.floor(Math.random() * 4) * 2; // começa ortogonal
    const pts = [[x, y]];
    const segs = 3 + Math.floor(Math.random() * 4);
    for (let s = 0; s < segs; s++) {
      const len = (d % 2 ? 1 + Math.floor(Math.random() * 3) : 3 + Math.floor(Math.random() * 8)) * GRID;
      x += DIRS[d][0] * len;
      y += DIRS[d][1] * len;
      pts.push([x, y]);
      d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8; // gira ±45°
    }
    let len = 0;
    const acc = [0];
    for (let i = 1; i < pts.length; i++) {
      len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      acc.push(len);
    }
    const t = { pts, acc, len, pd: null, rf: null };
    if (idx % PD_EVERY === 0) {
      const [x0, y0] = pts[0], [x1, y1] = pts[1];
      t.pd = { x: x0, y: y0, ang: Math.atan2(y1 - y0, x1 - x0), level: 0 };
      // PIN no meio do segmento mais longo, para o bloco ficar reto
      let best = 1;
      for (let i = 2; i < acc.length; i++) if (acc[i] - acc[i - 1] > acc[best] - acc[best - 1]) best = i;
      const pinD = (acc[best - 1] + acc[best]) / 2;
      // posições fixas dos portadores dentro da região I (u ∈ [-1,1] ao longo, v ∈ [-1,1] transversal)
      const carriers = Array.from({ length: 28 }, (_, k) => ({
        u: Math.random() * 2 - 1, v: Math.random() * 2 - 1, hole: k % 2 === 0, ph: Math.random() * 6.28,
      }));
      t.rf = { pinD, carriers, n: 0, rx: 0, next: Math.random() * 1500 };
    }
    return t;
  }

  function segIndex(t, dist) {
    let i = 1;
    while (i < t.acc.length - 1 && t.acc[i] < dist) i++;
    return i;
  }
  function pointAt(t, dist) {
    const { pts, acc } = t, i = segIndex(t, dist);
    const f = (dist - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
  }
  function angleAt(t, dist) {
    const { pts } = t, i = segIndex(t, dist);
    return Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((w * h) / 30000);
    traces = Array.from({ length: n }, (_, i) => makeTrace(i));
    pulses = []; packets = [];
  }

  function radialGlow(x, y, r, col, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col + hexA(a));
    g.addColorStop(1, col + '00');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- Fotodiodo ----------
  // Símbolo: triângulo + barra (catodo) + duas setas de luz incidente.
  function drawPhotodiode(pd, stroke, glow) {
    const lv = pd.level;
    ctx.save();
    ctx.translate(pd.x, pd.y);
    if (lv > 0.02) radialGlow(0, 0, 26, glow, lv * 0.35);
    ctx.rotate(pd.ang);
    ctx.strokeStyle = lv > 0.05 ? glow : stroke;
    ctx.fillStyle = lv > 0.05 ? glow : stroke;
    ctx.globalAlpha = 0.55 + lv * 0.45;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-7, -7); ctx.lineTo(-7, 7); ctx.lineTo(5, 0); ctx.closePath();
    lv > 0.05 ? ctx.fill() : ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, -7); ctx.lineTo(5, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-13, 0); ctx.lineTo(-7, 0); ctx.moveTo(5, 0); ctx.lineTo(0, 0); ctx.stroke();
    for (const off of [-4, 4]) {
      ctx.save();
      ctx.translate(off - 3, -11);
      ctx.rotate(Math.PI / 4 + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-8, 0); ctx.lineTo(0, 0);
      ctx.moveTo(-3, -2.5); ctx.lineTo(0, 0); ctx.lineTo(-3, 2.5);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // ---------- PIN: atenuador controlado por corrente ----------
  const iF = (n) => 100 * n * n;                 // mA (n = ocupação da região I, 0..1)
  const rPin = (n) => (iF(n) > 0.01 ? K_RF / iF(n) : Infinity);
  const transmission = (n) => {                  // |S21| de um resistor em série numa linha Z0
    const r = rPin(n);
    return Number.isFinite(r) ? (2 * Z0) / (2 * Z0 + r) : 0.03; // 0,03: fuga pela capacitância
  };

  const PIN_HALF = 22, PIN_H = 9, I_HALF = 12; // geometria do bloco P | I | N

  function drawPinLine(t, stroke, glow, now) {
    const { rf } = t;
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    // antena na origem
    const [ax, ay] = t.pts[0];
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 14);
    ctx.moveTo(ax - 7, ay - 22); ctx.lineTo(ax, ay - 14); ctx.lineTo(ax + 7, ay - 22);
    ctx.stroke();

    // bloco P | I | N em série
    const [px, py] = pointAt(t, rf.pinD);
    const n = rf.n;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angleAt(t, rf.pinD));
    if (n > 0.03) radialGlow(0, 0, 32, glow, n * 0.22);
    ctx.fillStyle = color('--bg') || '#000';
    ctx.fillRect(-PIN_HALF - 2, -PIN_H - 2, PIN_HALF * 2 + 4, PIN_H * 2 + 4); // interrompe a trilha
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = HOLE + '55';
    ctx.fillRect(-PIN_HALF, -PIN_H, PIN_HALF - I_HALF, PIN_H * 2);
    ctx.fillStyle = ELEC + '55';
    ctx.fillRect(I_HALF, -PIN_H, PIN_HALF - I_HALF, PIN_H * 2);
    ctx.fillStyle = glow + hexA(0.06 + n * 0.3);
    ctx.fillRect(-I_HALF, -PIN_H, I_HALF * 2, PIN_H * 2);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = n > 0.05 ? glow : stroke;
    ctx.strokeRect(-PIN_HALF, -PIN_H, PIN_HALF * 2, PIN_H * 2);
    ctx.beginPath();
    ctx.moveTo(-I_HALF, -PIN_H); ctx.lineTo(-I_HALF, PIN_H);
    ctx.moveTo(I_HALF, -PIN_H); ctx.lineTo(I_HALF, PIN_H);
    ctx.stroke();
    // portadores: lacunas vêm de P, elétrons de N; quantidade ∝ ocupação
    const visible = Math.round(n * rf.carriers.length);
    for (let k = 0; k < visible; k++) {
      const c = rf.carriers[k];
      const jx = Math.sin(now * 0.004 + c.ph) * 1.5, jy = Math.cos(now * 0.005 + c.ph) * 1.5;
      ctx.fillStyle = c.hole ? HOLE : ELEC;
      ctx.beginPath();
      ctx.arc(c.u * (I_HALF - 2) + jx, c.v * (PIN_H - 2) + jy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.font = '700 7px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = HOLE; ctx.fillText('P', -(PIN_HALF + I_HALF) / 2, 0);
    ctx.fillStyle = ELEC; ctx.fillText('N', (PIN_HALF + I_HALF) / 2, 0);
    ctx.restore();

    // leitura de I_F e R quando o diodo está conduzindo
    if (n > 0.08) {
      const r = rPin(n);
      ctx.save();
      ctx.globalAlpha = Math.min(1, (n - 0.08) * 5);
      ctx.fillStyle = glow;
      fillRich(ctx, `I_F ${iF(n).toFixed(1)} mA · R ${r < 10 ? r.toFixed(1) : Math.round(r)} Ω`, px, py - PIN_H - 16,
        { weight: 600, size: 10, family: '"JetBrains Mono", monospace' });
      ctx.restore();
    }

    // receptor na ponta: brilha conforme a potência recebida
    const [rx, ry] = t.pts.at(-1);
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(angleAt(t, t.len));
    if (rf.rx > 0.03) radialGlow(8, 0, 20, SAFE, rf.rx * 0.4);
    ctx.strokeStyle = rf.rx > 0.08 ? SAFE : stroke;
    ctx.globalAlpha = 0.6 + rf.rx * 0.4;
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.lineTo(15, 0); ctx.closePath(); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  // Onda de RF: senoide com envelope; depois do PIN a amplitude é multiplicada por |S21|.
  function drawPacket(p, glow, now) {
    const t = p.t, rf = t.rf, span = 40;
    const T = transmission(rf.n);
    ctx.save();
    ctx.lineWidth = 1.3;
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = glow;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 3;
    ctx.beginPath();
    let started = false;
    for (let s = -span; s <= span; s += 2) {
      const dist = p.d + s;
      if (dist < 0 || dist > t.len) continue;
      if (Math.abs(dist - rf.pinD) < PIN_HALF) { started = false; continue; } // escondida dentro do bloco
      const A = dist > rf.pinD ? p.amp * T : p.amp;
      const env = Math.cos((s / span) * Math.PI / 2) ** 2;
      const off = A * env * Math.sin(s * 0.5 - now * 0.02) * 9;
      const [x, y] = pointAt(t, dist);
      const nrm = angleAt(t, dist) + Math.PI / 2;
      const X = x + Math.cos(nrm) * off, Y = y + Math.sin(nrm) * off;
      if (!started) { ctx.moveTo(X, Y); started = true; } else ctx.lineTo(X, Y);
    }
    ctx.stroke();
    ctx.restore();
    if (!p.arrived && p.d >= t.len) {
      p.arrived = true;
      rf.rx = Math.max(rf.rx, p.amp * T);
    }
    return p.d - span <= t.len;
  }

  function drawPulse(p, glow) {
    const tail = 50;
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 6;
    for (let k = 0; k < 14; k++) {
      const dist = p.d - (k * tail) / 14;
      if (dist < 0 || dist > p.t.len) continue;
      const [x, y] = pointAt(p.t, dist);
      ctx.globalAlpha = (1 - k / 14) * p.amp * 0.6;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, k === 0 ? 2.8 : 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return p.d - tail <= p.t.len;
  }

  function frame(now) {
    const dt = Math.min(now - lastFrame, 50);
    lastFrame = now;
    const trace = color('--trace'), glow = color('--accent').slice(0, 7), foto = isFoto();
    ctx.clearRect(0, 0, w, h);

    // luz do cursor (suaviza entrada/saída)
    mouse.glow += ((mouse.on ? 1 : 0) - mouse.glow) * Math.min(1, dt / 120);
    if (mouse.glow > 0.01) {
      const col = foto ? '#ffd76a' : glow;
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, LIGHT_R * 1.6);
      g.addColorStop(0, col + hexA(mouse.glow * (foto ? 0.2 : 0.12)));
      g.addColorStop(1, col + '00');
      ctx.fillStyle = g;
      ctx.fillRect(mouse.x - LIGHT_R * 2, mouse.y - LIGHT_R * 2, LIGHT_R * 4, LIGHT_R * 4);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.5;
    for (const t of traces) {
      // trilhas perto do cursor ficam mais visíveis
      const [mx, my] = t.pts[Math.floor(t.pts.length / 2)];
      const near = mouse.glow * Math.max(0, 1 - Math.hypot(mx - mouse.x, my - mouse.y) / (LIGHT_R * 2));
      ctx.strokeStyle = near > 0.05 ? glow : trace;
      ctx.globalAlpha = near > 0.05 ? 0.15 + near * 0.2 : 1;
      ctx.beginPath();
      t.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = trace;
      ctx.fillStyle = trace;
      const ends = !t.pd ? [t.pts[0], t.pts.at(-1)] : foto ? [t.pts.at(-1)] : [];
      for (const [x, y] of ends) {
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2); ctx.fill();
      }
    }

    // pulsos DC comuns (na página PIN, só nas trilhas que não são de RF)
    if (!reduce.matches) {
      if (now > nextSpawn && traces.length) {
        const pool = traces.filter((t) => foto || !t.rf);
        const t = pool[Math.floor(Math.random() * pool.length)];
        if (t) pulses.push({ t, d: 0, speed: 0.25 + Math.random() * 0.25, amp: foto ? 0.6 : 1 });
        nextSpawn = now + 1200 + Math.random() * 2000;
      }
      pulses = pulses.filter((p) => { p.d += dt * p.speed; return drawPulse(p, glow); });
    }

    for (const t of traces) {
      if (!t.pd) continue;
      if (foto) {
        // irradiância relativa ~ R²/(d²+R²): comportamento de fonte pontual
        const d2 = (t.pd.x - mouse.x) ** 2 + (t.pd.y - mouse.y) ** 2;
        const target = mouse.glow * (LIGHT_R * LIGHT_R) / (d2 + LIGHT_R * LIGHT_R);
        t.pd.level += (target - t.pd.level) * Math.min(1, dt / 80);
        drawPhotodiode(t.pd, trace, glow);
        if (!reduce.matches && t.pd.level > 0.2 && Math.random() < t.pd.level * dt / 400) {
          pulses.push({ t, d: 0, speed: 0.25 + t.pd.level * 0.35, amp: 0.5 + t.pd.level * 0.5 });
        }
      } else {
        const rf = t.rf;
        // corrente de polarização pela proximidade do cursor
        const [px, py] = pointAt(t, rf.pinD);
        const d2 = (px - mouse.x) ** 2 + (py - mouse.y) ** 2;
        const target = mouse.glow * (LIGHT_R * LIGHT_R) / (d2 + LIGHT_R * LIGHT_R);
        // injeção rápida, recombinação lenta (τ)
        const tau = target > rf.n ? TAU_RISE : TAU_FALL;
        rf.n += (target - rf.n) * Math.min(1, dt / tau);
        rf.rx *= 1 - Math.min(1, dt / 250);
        // fonte de RF contínua na antena
        rf.next -= dt;
        if (!reduce.matches && rf.next <= 0) {
          packets.push({ t, d: 0, speed: 0.22, amp: 1 });
          rf.next = 1600 + Math.random() * 1200;
        }
      }
    }

    if (!foto) {
      packets = packets.filter((p) => { p.d += dt * p.speed; return drawPacket(p, glow, now); });
      for (const t of traces) if (t.rf) drawPinLine(t, trace, glow, now);
    } else if (packets.length) {
      packets = [];
    }
    requestAnimationFrame(frame);
  }

  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; });
  document.addEventListener('pointerleave', () => { mouse.on = false; });
  addEventListener('blur', () => { mouse.on = false; });
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame((t) => { lastFrame = t; frame(t); });
}
