// Linha do tempo interativa dos criadores
const NISHIZAWA = 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Junichi_Nishizawa.jpg';
const EVENTS = [
  { ano: 1940, nome: 'Russell Ohl', ini: 'RO', foto: 'criadores/ohl.jpg', org: 'Bell Labs · EUA',
    feito: 'Efeito fotovoltaico na junção PN',
    texto: 'Ao estudar um cristal de silício com uma trinca, Ohl notou que ele gerava tensão sob luz. Era a primeira junção PN — base de toda célula solar e fotodiodo.' },
  { ano: 1950, nome: 'Jun-ichi Nishizawa', ini: 'JN', foto: NISHIZAWA, org: 'Universidade de Tohoku · Japão',
    feito: 'Diodo PIN e fotodiodo PIN',
    texto: 'Nishizawa inseriu uma camada intrínseca entre P e N, ampliando a região de depleção: menor capacitância, maior tensão de ruptura e detecção de luz mais rápida.' },
  { ano: 1952, nome: 'Jun-ichi Nishizawa', ini: 'JN', foto: NISHIZAWA, org: 'Universidade de Tohoku · Japão',
    feito: 'Fotodiodo avalanche (APD)',
    texto: 'Polarizando o fotodiodo perto da ruptura, cada portador gerado pela luz dispara uma avalanche de novos pares — ganho interno que permite detectar sinais fraquíssimos.' },
];

export function buildTimeline(root = document.getElementById('tl')) {
  if (!root) return;
  const pos = (e) => (EVENTS.indexOf(e) / (EVENTS.length - 1)) * 100; // espaçamento igual
  root.innerHTML = `
    <div class="tl-track" role="tablist" aria-label="Marcos históricos">
      <div class="tl-rail"><div class="tl-fill"></div></div>
      ${EVENTS.map((e, i) => `
        <button class="tl-node" role="tab" style="left:${pos(e)}%" data-i="${i}" aria-label="${e.ano} — ${e.feito}">
          <span class="tl-dot"></span><b>${e.ano}</b>
        </button>`).join('')}
    </div>
    <article class="tl-card" aria-live="polite"></article>`;
  const card = root.querySelector('.tl-card');
  const nodes = [...root.querySelectorAll('.tl-node')];
  let cur = -1;

  function select(i) {
    if (i === cur) return;
    cur = i;
    const e = EVENTS[i];
    nodes.forEach((n, k) => {
      n.classList.toggle('active', k === i);
      n.classList.toggle('past', k < i);
      n.setAttribute('aria-selected', k === i);
      n.tabIndex = k === i ? 0 : -1;
    });
    root.querySelector('.tl-fill').style.width = pos(e) + '%';
    card.innerHTML = `
      <figure class="tl-photo"><span class="tl-ini">${e.ini}</span><img src="${e.foto}" alt="${e.nome}"></figure>
      <div class="tl-body">
        <p class="tl-meta"><span>${e.ano}</span> ${e.org}</p>
        <h3>${e.nome}</h3>
        <p class="tl-feito">${e.feito}</p>
        <p class="tl-texto">${e.texto}</p>
        <div class="tl-nav">
          <button data-d="-1" ${i ? '' : 'disabled'} aria-label="Anterior">←</button>
          <span>${i + 1} / ${EVENTS.length}</span>
          <button data-d="1" ${i < EVENTS.length - 1 ? '' : 'disabled'} aria-label="Próximo">→</button>
        </div>
      </div>`;
    const img = card.querySelector('img');
    img.onerror = () => img.remove(); // sem foto → fica o monograma
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
  }

  nodes.forEach((n, i) => { n.onclick = () => select(i); });
  root.addEventListener('click', (ev) => {
    const d = ev.target.closest('[data-d]');
    if (d) select(cur + Number(d.dataset.d));
  });
  root.querySelector('.tl-track').addEventListener('keydown', (ev) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[ev.key];
    if (!d) return;
    const n = Math.min(EVENTS.length - 1, Math.max(0, cur + d));
    select(n); nodes[n].focus(); ev.preventDefault();
  });
  select(0);
}
