// Barra lateral de navegação: lista as seções da página atual, destaca a
// seção visível (scroll-spy) e rola até a seção clicada.

let observer = null;

export function buildSideNav(app) {
  let nav = document.getElementById('sidenav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.id = 'sidenav';
    nav.setAttribute('aria-label', 'Seções');
    document.body.appendChild(nav);
  }
  observer?.disconnect();

  const sections = [...app.querySelectorAll('section.card')];
  const items = sections.map((sec, i) => {
    sec.id = `sec-${i}`;
    const h2 = sec.querySelector('h2');
    const num = h2.querySelector(':scope > span')?.textContent ?? '•';
    const clone = h2.cloneNode(true);
    clone.querySelector(':scope > span')?.remove();
    return { id: sec.id, num, label: clone.innerHTML.trim() };
  });

  nav.innerHTML = `<ol>${items.map((it) => `
    <li><a href="#${it.id}" data-id="${it.id}">
      <span class="dot">${it.num}</span><span class="lbl">${it.label}</span>
    </a></li>`).join('')}</ol>`;

  nav.querySelectorAll('a').forEach((a) => a.onclick = (e) => {
    e.preventDefault();
    document.getElementById(a.dataset.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${a.dataset.id}`);
  });

  // seção ativa destacada no menu
  const setActive = (id) => nav.querySelectorAll('a').forEach((a) => {
    const on = a.dataset.id === id;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
  // última seção cujo topo já passou da linha de 55% da janela (no fim da página, a última)
  const update = () => {
    const line = innerHeight * 0.55;
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 4;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    setActive((atEnd ? sections.at(-1) : current)?.id);
  };
  observer = { disconnect: () => { removeEventListener('scroll', update); removeEventListener('resize', update); } };
  addEventListener('resize', update, { passive: true });
  addEventListener('scroll', update, { passive: true });
  update();
}
