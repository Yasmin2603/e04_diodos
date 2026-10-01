import Chart from 'chart.js/auto';
import './style.css';
import { startCircuitBackground } from './bg.js';
import { PIN, FOTO, DS_PIN, DS_FOTO } from './data.js';
import { SYMBOL_PIN, SYMBOL_FOTO, STRUCT_PIN, STRUCT_FOTO, ICON_PIN, ICON_FOTO } from './symbols.js';
import { sub, richAxisTitles } from './notation.js';
import { buildSideNav } from './sidenav.js';
import { buildTimeline } from './timeline.js';
import { icon } from './icons.js';

buildTimeline();

const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();
Chart.defaults.font.family = 'Inter, sans-serif';
Chart.register(richAxisTitles);
const COLORS = ['#2f7df6', '#e8792b', '#20a36b', '#b34ad8', '#d33f5b', '#8a8f98'];

const charts = new Map();
function draw(id, config) {
  charts.get(id)?.destroy();
  const canvas = document.getElementById(id);
  if (!canvas) return;
  Chart.defaults.color = css('--muted');
  Chart.defaults.borderColor = css('--fg') + '14'; // grade sutil: --fg com ~8% de opacidade
  Chart.defaults.scale.ticks.font = { family: "'JetBrains Mono', monospace", size: 11 };
  Chart.defaults.scale.border = { color: css('--fg') + '33' };
  Object.assign(Chart.defaults.plugins.legend.labels, { usePointStyle: true, pointStyle: 'circle', boxWidth: 8, boxHeight: 8 });
  Object.assign(Chart.defaults.plugins.tooltip, {
    backgroundColor: css('--card'), titleColor: css('--fg'), bodyColor: css('--muted'),
    borderColor: css('--fg') + '22', borderWidth: 1, cornerRadius: 6, padding: 10,
    titleFont: { family: 'Inter', weight: '600' }, bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
  });
  charts.set(id, new Chart(canvas, config));
}
const xy = (pts) => pts.map(([x, y]) => ({ x, y }));
const axisTitle = (text) => (text.includes('_')
  ? { display: true, text: text.replace(/_/g, ''), color: 'transparent', rich: text, richColor: css('--muted') }
  : { display: true, text });
const lineOpts = (xTitle, yTitle, { xLog = false, yLog = false, extra = {} } = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 250 },
  interaction: { mode: 'nearest', intersect: false },
  plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
  scales: {
    x: { type: xLog ? 'logarithmic' : 'linear', title: axisTitle(xTitle) },
    y: { type: yLog ? 'logarithmic' : 'linear', title: axisTitle(yTitle) },
  },
  ...extra,
});
const ds = (label, data, i, more = {}) => ({
  label, data, borderColor: COLORS[i % COLORS.length], backgroundColor: COLORS[i % COLORS.length],
  pointRadius: 0, borderWidth: 2, tension: 0.3, ...more,
});
const fmt = (v, d = 2) => Number(v).toLocaleString('pt-BR', { maximumSignificantDigits: d + 1 });

// ---------- Seções comuns ----------
function secaoTexto(d, simbolo, estrutura) {
  return `
  <section class="card repr-card">
    <h2 class="center">Representação gráfica</h2>
    <div class="repr">
      <figure>${simbolo}<figcaption>Símbolo de circuito</figcaption></figure>
      <figure>${estrutura}<figcaption>Estrutura física (corte)</figcaption></figure>
    </div>
  </section>
  <section class="card"><h2><span>2</span>Como funciona?</h2>
    <div class="diagram" id="diagram"></div>
    <div class="steps">${d.funcionamento.map(([t, x]) => `<div><b>${t}</b><p>${x}</p></div>`).join('')}</div>
  </section>`;
}
function secaoProsCons(d) {
  return `<section class="card"><h2><span>4</span>Vantagens / Desvantagens</h2>
    <div class="proscons">
      <ul class="pros">${d.vantagens.map((v) => `<li>${v}</li>`).join('')}</ul>
      <ul class="cons">${d.desvantagens.map((v) => `<li>${v}</li>`).join('')}</ul>
    </div></section>`;
}
function secaoFinal(d) {
  return `
  <section class="card"><h2><span>7</span>Características principais</h2>
    <div class="kpis">${d.caracteristicas.map(([k, v]) => `<div class="kpi"><small>${k}</small><b>${v}</b></div>`).join('')}</div>
  </section>
  <section class="card"><h2><span>8</span>Custo</h2>
    <p class="hint">Faixa aproximada em US$ (escala logarítmica).</p>
    <div class="chart short"><canvas id="c-custo"></canvas></div>
    <ul class="cost-list">${d.custo.map((c) => `<li><b>${c.item}</b> — US$ ${fmt(c.min)}–${fmt(c.max)} <em>(${c.brl})</em></li>`).join('')}</ul>
  </section>
  <section class="card"><h2><span>9</span>Aplicação na indústria</h2>
    <div class="apps">${d.aplicacoes.map(([i, t, x]) => `<div class="app" tabindex="0"><span>${icon(i)}</span><b>${t}</b><p>${x}</p></div>`).join('')}</div>
  </section>`;
}
function drawCusto(d) {
  draw('c-custo', {
    type: 'bar',
    data: {
      labels: d.custo.map((c) => c.item),
      datasets: [{ label: 'Faixa de preço (US$)', data: d.custo.map((c) => [c.min, c.max]), backgroundColor: COLORS.slice(0, d.custo.length), borderRadius: 6 }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `US$ ${fmt(c.raw[0])} – ${fmt(c.raw[1])}` } } },
      scales: { x: { type: 'logarithmic', min: 0.01, max: 1000, title: { display: true, text: 'US$' },
        ticks: { autoSkip: false, maxRotation: 0, callback: (v) => (Number.isInteger(Math.log10(v)) ? '$' + v.toLocaleString('pt-BR') : null) } } },
    },
  });
}
// Seletor de gráfico em botões (option não aceita <sub>).
function chips(id, opts) {
  return `<div class="chips" id="${id}" role="group">${opts.map(([v, t], i) => `<button class="chip${i ? '' : ' active'}" data-v="${v}">${t}</button>`).join('')}</div>`;
}
function bindChips(id, onChange) {
  const box = document.getElementById(id);
  box.value = box.querySelector('.chip.active').dataset.v;
  box.querySelectorAll('.chip').forEach((b) => b.onclick = () => {
    box.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === b));
    box.value = b.dataset.v;
    onChange();
  });
}
function datasheetSelect(id, obj) {
  return `<select id="${id}">${Object.keys(obj).map((k) => `<option>${k}</option>`).join('')}</select>`;
}

// ---------- Diodo PIN ----------
function renderPIN() {
  app.innerHTML = sub(`
  ${secaoTexto(PIN, SYMBOL_PIN, STRUCT_PIN)}
  <section class="card"><h2><span>3</span>Gráficos representativos</h2>
    <div class="grid2">
      <div>
        <h3>Curva I × V</h3>
        <div class="chart"><canvas id="c-iv"></canvas></div>
        <p class="hint">Joelho mais suave e queda direta ≈ 0,7–1 V. Reverso: corrente baixíssima até a ruptura (≈100–200 V nos PIN de sinal; acima de 1 kV nos de potência).</p>
        <label>Tensão de ruptura V_BR: <b id="vbr-v"></b><input type="range" id="vbr" min="50" max="1000" step="10" value="200"></label>
      </div>
      <div>
        <h3>R_RF × I_F (log-log)</h3>
        <div class="chart"><canvas id="c-r"></canvas></div>
        <label>Largura da região I (W): <b id="w-v"></b><input type="range" id="w" min="5" max="200" value="50"></label>
        <label>Tempo de vida τ: <b id="tau-v"></b><input type="range" id="tau" min="0.1" max="5" step="0.1" value="1"></label>
        <label>Corrente I_F: <b id="if-v"></b><input type="range" id="if" min="-2" max="2" step="0.05" value="0"></label>
        <div class="readout" id="r-out"></div>
      </div>
      <div>
        <h3>C × V_R</h3>
        <div class="chart"><canvas id="c-cv"></canvas></div>
        <p class="hint">A capacitância cai e estabiliza quando a região I fica totalmente depletada (V_R ≥ V_punch-through).</p>
      </div>
      <div>
        <h3>Comportamento em RF</h3>
        <div class="chart"><canvas id="c-rf"></canvas></div>
        <p class="hint">Curva qualitativa: bem acima de f ≈ 1/(2πτ) o diodo deixa de retificar e passa a agir como resistência linear.</p>
      </div>
    </div>
  </section>
  ${secaoProsCons(PIN)}
  <section class="card"><h2><span>6</span>Gráficos do datasheet</h2>
    <div class="toolbar">${datasheetSelect('ds-pin', DS_PIN)}
      ${chips('ds-pin-g', [['rs', 'R_S × I_F'], ['ct', 'C_T × V_R'], ['ifvf', 'I_F × V_F'], ['il', 'Perda de inserção / isolação × f']])}
      <label class="chk"><input type="checkbox" id="ds-pin-all"> comparar todos</label>
    </div>
    <p class="ds-info" id="ds-pin-info"></p>
    <div class="chart tall"><canvas id="c-ds"></canvas></div>
  </section>
  ${secaoFinal(PIN)}`);

  document.getElementById('diagram').innerHTML = `
    <div class="pinbar"><div class="p">P</div><div class="i" id="ireg">I (intrínseca)</div><div class="n">N</div></div>
    <div class="toolbar"><button class="seg active" data-b="dir">Polarização direta</button><button class="seg" data-b="rev">Polarização reversa</button></div>
    <p class="readout" id="bias-txt"></p>`;
  const setBias = (b) => {
    document.querySelectorAll('.seg[data-b]').forEach((s) => s.classList.toggle('active', s.dataset.b === b));
    const ireg = document.getElementById('ireg');
    ireg.className = 'i ' + b;
    document.getElementById('bias-txt').textContent = b === 'dir'
      ? 'Portadores inundam a região I → resistor controlado por corrente (baixa R).'
      : 'Região I totalmente depletada → pequena capacitância constante (circuito aberto em RF).';
  };
  document.querySelectorAll('.seg[data-b]').forEach((s) => s.onclick = () => setBias(s.dataset.b));
  setBias('dir');

  const upd = () => {
    const vbr = +vbrEl.value, W = +wEl.value * 1e-4, tau = +tauEl.value * 1e-6, IF = 10 ** +ifEl.value; // cm, s, mA
    document.getElementById('vbr-v').textContent = `${vbr} V`;
    document.getElementById('w-v').textContent = `${wEl.value} µm`;
    document.getElementById('tau-v').textContent = `${tauEl.value} µs`;
    document.getElementById('if-v').textContent = `${fmt(IF)} mA`;
    const mu = 1350 + 480; // Si cm²/Vs
    const R = (I) => (W * W) / (mu * (I * 1e-3) * tau);
    const fc = 1 / (2 * Math.PI * tau);
    document.getElementById('r-out').innerHTML = sub(`R_RF ≈ <b>${fmt(R(IF))} Ω</b> · f_corte = 1/(2πτ) ≈ <b>${fmt(fc / 1e3)} kHz</b>`);

    // I×V
    const iv = [];
    for (let v = -vbr * 1.1; v <= 1.1; v += vbr / 200) {
      let i;
      if (v < -vbr) i = -Math.min(100, (-vbr - v) * 5);
      else i = 1e-9 * (Math.exp(v / (2 * 0.02585)) - 1) * 1e3 - 1e-6;
      iv.push({ x: v, y: Math.max(-100, Math.min(100, i)) });
    }
    for (let v = 0; v <= 1.1; v += 0.01) iv.push({ x: v, y: Math.min(100, 1e-9 * (Math.exp(v / (2 * 0.02585)) - 1) * 1e3) });
    iv.sort((a, b) => a.x - b.x);
    draw('c-iv', { type: 'line', data: { datasets: [ds('Corrente no diodo', iv, 0)] }, options: lineOpts('V_D (V)', 'I_D (mA)') });

    const rc = [];
    for (let e = -2; e <= 2.001; e += 0.1) rc.push({ x: 10 ** e, y: R(10 ** e) });
    draw('c-r', { type: 'line', data: { datasets: [ds('Resistência em RF', rc, 1), ds('Corrente escolhida', [{ x: IF, y: R(IF) }], 3, { pointRadius: 7, showLine: false })] },
      options: lineOpts('I_F (mA)', 'R_RF (Ω)', { xLog: true, yLog: true }) });

    const cv = [];
    const Vpt = 5 * (+wEl.value / 50) ** 2;
    const Cmin = 0.25 * (50 / +wEl.value);
    for (let v = 0; v <= 50; v += 0.5) cv.push({ x: v, y: v < Vpt ? Cmin * Math.sqrt(1 + (Vpt - v) / Vpt * 3) : Cmin });
    draw('c-cv', { type: 'line', data: { datasets: [ds('C (pF)', cv, 2)] }, options: lineOpts('V_R (V)', 'C (pF)') });

    const rf = [];
    for (let e = 3; e <= 10; e += 0.1) { const f = 10 ** e; rf.push({ x: f, y: 100 / Math.sqrt(1 + (f / fc) ** 2) }); }
    draw('c-rf', { type: 'line', data: { datasets: [ds('Retificação (%)', rf, 4, { fill: true, backgroundColor: 'rgba(211,63,91,.12)' })] },
      options: lineOpts('Frequência (Hz)', 'Retificação relativa (%)', { xLog: true }) });
  };
  const vbrEl = document.getElementById('vbr'), wEl = document.getElementById('w'), tauEl = document.getElementById('tau'), ifEl = document.getElementById('if');
  [vbrEl, wEl, tauEl, ifEl].forEach((el) => el.oninput = upd);
  upd();

  const updDS = () => {
    const nome = document.getElementById('ds-pin').value, g = document.getElementById('ds-pin-g').value, all = document.getElementById('ds-pin-all').checked;
    const info = document.getElementById('ds-pin-info');
    info.innerHTML = sub(DS_PIN[nome].info);
    const nomes = all ? Object.keys(DS_PIN) : [nome];
    if (g === 'il') {
      // SPST série: IL e isolação a partir de Rs(10 mA) e C_T (reverso)
      const sets = [];
      nomes.forEach((n, k) => {
        const d = DS_PIN[n], rs = d.rs.find((p) => p[0] === 10)[1], ct = d.ct.at(-1)[1] * 1e-12, Z0 = 50;
        const il = [], iso = [];
        for (let e = 7; e <= 10.3; e += 0.05) {
          const f = 10 ** e, Xc = 1 / (2 * Math.PI * f * ct);
          il.push({ x: f / 1e9, y: -20 * Math.log10(1 + rs / (2 * Z0)) });
          iso.push({ x: f / 1e9, y: -20 * Math.log10(Math.sqrt(1 + (Xc / (2 * Z0)) ** 2)) });
        }
        sets.push(ds(`${n.split(' ')[0]} perda de inserção`, il, k), ds(`${n.split(' ')[0]} isolação`, iso, k, { borderDash: [6, 4] }));
      });
      draw('c-ds', { type: 'line', data: { datasets: sets }, options: lineOpts('Frequência (GHz)', 'S_21 (dB)', { xLog: true }) });
      info.innerHTML += sub(' · Chave série SPST em 50 Ω, calculada a partir de R_S(10 mA) e C_T, sem indutância parasita do encapsulamento (a isolação real piora em GHz).');
      return;
    }
    const cfg = { rs: ['I_F (mA)', 'R_S (Ω)', true, true], ct: ['V_R (V)', 'C_T (pF)', false, false], ifvf: ['V_F (V)', 'I_F (mA)', false, true] }[g];
    draw('c-ds', { type: 'line', data: { datasets: nomes.map((n, k) => ds(n, xy(DS_PIN[n][g]), k, { pointRadius: 3 })) },
      options: lineOpts(cfg[0], cfg[1], { xLog: cfg[2], yLog: cfg[3] }) });
  };
  ['ds-pin', 'ds-pin-all'].forEach((id) => document.getElementById(id).onchange = updDS);
  bindChips('ds-pin-g', updDS);
  updDS();
  drawCusto(PIN);
}

// ---------- Fotodiodo ----------
function renderFOTO() {
  app.innerHTML = sub(`
  ${secaoTexto(FOTO, SYMBOL_FOTO, STRUCT_FOTO)}
  <section class="card"><h2><span>3</span><em class="h2t">Gráfico representativo (I_D × V_D)</em></h2>
    <div class="grid2">
      <div>
        <div class="chart tall"><canvas id="c-fiv"></canvas></div>
      </div>
      <div>
        <label>Irradiância: <b id="e-v"></b><input type="range" id="e" min="0" max="100" value="40"></label>
        <label>Temperatura: <b id="t-v"></b><input type="range" id="t" min="0" max="100" value="25"></label>
        <div class="toolbar"><button class="seg active" data-m="pv">Fotovoltaico (0 V)</button><button class="seg" data-m="pc">Fotocondutivo (reverso)</button></div>
        <div class="readout" id="f-out"></div>
        <div class="quad"><div class="q3">3º quadrante<br><small>fotodetector</small></div><div class="q4">4º quadrante<br><small>gerador / célula solar</small></div></div>
        <p class="hint">A curva do diodo comum é deslocada para baixo por I_ph, que cresce com a irradiância — família de curvas paralelas.</p>
      </div>
    </div>
  </section>
  ${secaoProsCons(FOTO)}
  <section class="card"><h2><span>6</span>Gráficos do datasheet</h2>
    <div class="toolbar">${datasheetSelect('ds-f', DS_FOTO)}
      ${chips('ds-f-g', [['espectral', 'Sensibilidade espectral × λ'], ['iph', 'Fotocorrente × irradiância'], ['escuroT', 'Corrente de escuro × temperatura'], ['ct', 'Capacitância × V_R'], ['polar', 'Sensibilidade × ângulo (polar)']])}
      <label class="chk"><input type="checkbox" id="ds-f-all"> comparar todos</label>
    </div>
    <p class="ds-info" id="ds-f-info"></p>
    <div class="chart tall"><canvas id="c-ds"></canvas></div>
  </section>
  ${secaoFinal(FOTO)}`);

  document.getElementById('diagram').innerHTML = `
    <div class="photo">
      <div class="photons" id="photons"></div>
      <div class="pinbar"><div class="p">P</div><div class="i dep">depleção<span class="pair">e⁻ ⟵ ● ⟶ h⁺</span></div><div class="n">N</div></div>
    </div>`;
  const ph = document.getElementById('photons');
  for (let k = 0; k < 8; k++) ph.insertAdjacentHTML('beforeend', `<i style="left:${10 + k * 11}%;animation-delay:${k * 0.25}s"></i>`);

  let modo = 'pv';
  const eEl = document.getElementById('e'), tEl = document.getElementById('t');
  const upd = () => {
    const E = +eEl.value / 100, T = +tEl.value, VT = 0.02585 * (T + 273) / 298, n = 1.5;
    const Is = 1e-6 * 2 ** ((T - 25) / 10); // µA (≈ dobra a cada 10 °C)
    const R = 0.6, A = 7.5e-2; // A/W, cm²
    const Iph = (E * 1e-3) * A * R * 1e6; // µA (E em mW/cm²)
    document.getElementById('e-v').textContent = `${fmt(E)} mW/cm²`;
    document.getElementById('t-v').textContent = `${T} °C`;
    const Vop = modo === 'pv' ? 0 : -5;
    const Idark = Is * 1e3 * (modo === 'pv' ? 0.01 : 1); // nA ilustrativo
    document.getElementById('f-out').innerHTML = sub(`I_ph ≈ <b>${fmt(Iph)} µA</b> · I_escuro ≈ <b>${fmt(Idark)} nA</b> · ponto de operação V = ${Vop} V<br>
      ${modo === 'pv' ? 'Baixa corrente de escuro e baixo ruído, porém mais lento.' : 'Mais rápido (menor capacitância) e mais linear, mas maior corrente de escuro.'}`);
    const curve = (e) => {
      const iph = (e * 1e-3) * A * R * 1e6, pts = [];
      for (let v = -5; v <= 0.6; v += 0.02) pts.push({ x: v, y: Math.min(20, Is * (Math.exp(v / (n * VT)) - 1) - iph) });
      return pts;
    };
    const niveis = [0, 0.25, 0.5, 0.75, 1];
    const sets = niveis.map((e, k) => ds(`${e} mW/cm²`, curve(e), 5, { borderColor: `rgba(232,121,43,${0.2 + k * 0.12})`, backgroundColor: `rgba(232,121,43,${0.2 + k * 0.12})`, borderWidth: 1 }));
    sets.push(ds(`Atual: ${fmt(E)} mW/cm²`, curve(E), 1, { borderWidth: 3 }));
    const iop = Is * (Math.exp(Vop / (n * VT)) - 1) - Iph;
    sets.push(ds('Ponto de operação', [{ x: Vop, y: iop }], 3, { pointRadius: 7, showLine: false }));
    draw('c-fiv', { type: 'line', data: { datasets: sets }, options: lineOpts('V_D (V)', 'I_D (µA)', { extra: { scales: {
      x: { type: 'linear', title: axisTitle('V_D (V)'), grid: { color: (c) => c.tick.value === 0 ? css('--fg') : css('--grid') } },
      y: { min: -50, max: 20, title: axisTitle('I_D (µA)'), grid: { color: (c) => c.tick.value === 0 ? css('--fg') : css('--grid') } },
    } } }) });
  };
  document.querySelectorAll('.seg[data-m]').forEach((s) => s.onclick = () => {
    modo = s.dataset.m;
    document.querySelectorAll('.seg[data-m]').forEach((x) => x.classList.toggle('active', x === s));
    upd();
  });
  [eEl, tEl].forEach((el) => el.oninput = upd);
  upd();

  const updDS = () => {
    const nome = document.getElementById('ds-f').value, g = document.getElementById('ds-f-g').value, all = document.getElementById('ds-f-all').checked;
    document.getElementById('ds-f-info').innerHTML = sub(DS_FOTO[nome].info);
    const nomes = all ? Object.keys(DS_FOTO) : [nome];
    if (g === 'polar') {
      const labels = [];
      for (let a = -90; a <= 90; a += 10) labels.push(`${a}°`);
      draw('c-ds', { type: 'radar', data: { labels, datasets: nomes.map((n, k) => {
        const p = DS_FOTO[n].polar, full = [...p.slice().reverse(), ...p.slice(1)];
        return { label: n, data: full, borderColor: COLORS[k], backgroundColor: COLORS[k] + '22', pointRadius: 2 };
      }) }, options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 1, ticks: { stepSize: 0.2, backdropColor: 'transparent' } } } } });
      return;
    }
    const cfg = {
      espectral: ['λ (nm)', 'Sensibilidade relativa', false, false],
      iph: ['Irradiância (mW/cm²)', 'Fotocorrente (µA)', true, true],
      escuroT: ['Temperatura (°C)', 'Corrente de escuro (nA)', false, true],
      ct: ['V_R (V)', 'Capacitância (pF)', false, false],
    }[g];
    draw('c-ds', { type: 'line', data: { datasets: nomes.map((n, k) => ds(n, xy(DS_FOTO[n][g]), k, { pointRadius: 3 })) },
      options: lineOpts(cfg[0], cfg[1], { xLog: cfg[2], yLog: cfg[3] }) });
  };
  ['ds-f', 'ds-f-all'].forEach((id) => document.getElementById(id).onchange = updDS);
  bindChips('ds-f-g', updDS);
  updDS();
  drawCusto(FOTO);
}

// ---------- Navegação ----------
const app = document.getElementById('app');
let atual = 'pin';
// Numeração sequencial das seções (01, 02, …) a partir da ordem renderizada
function numerarSecoes() {
  app.querySelectorAll('section.card > h2').forEach((h2, i) => {
    let n = h2.querySelector(':scope > span');
    if (!n) { n = document.createElement('span'); h2.prepend(n); }
    n.textContent = String(i + 1).padStart(2, '0');
  });
}
const render = (dev) => {
  atual = dev;
  document.body.dataset.dev = dev;
  document.getElementById('tb-icon').innerHTML = dev === 'pin' ? ICON_PIN : ICON_FOTO;
  document.querySelectorAll('.switch button').forEach((b) => b.classList.toggle('active', b.dataset.dev === dev));
  charts.forEach((c) => c.destroy()); charts.clear();
  dev === 'pin' ? renderPIN() : renderFOTO();
  numerarSecoes();
  buildSideNav(app);
  try { localStorage.setItem('dev', dev); } catch {}
};
document.querySelectorAll('.switch button').forEach((b) => b.onclick = () => render(b.dataset.dev));
let inicial = 'pin';
try { inicial = localStorage.getItem('dev') || 'pin'; } catch {}
render(inicial);

// ---------- Tema claro / escuro ----------
const SUN = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const themeBtn = document.getElementById('theme-btn');
const syncThemeBtn = () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeBtn.innerHTML = dark ? SUN : MOON;
  themeBtn.setAttribute('aria-label', dark ? 'Mudar para tema claro' : 'Mudar para tema escuro');
  themeBtn.title = themeBtn.getAttribute('aria-label');
};
themeBtn.onclick = () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  syncThemeBtn();
  const y = scrollY;
  render(atual); // redesenha os gráficos com as cores do novo tema
  scrollTo(0, y);
};
syncThemeBtn();
startCircuitBackground();
