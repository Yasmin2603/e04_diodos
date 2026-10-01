// Representações gráficas: símbolo de circuito e corte da estrutura física.
// Cores via currentColor / variáveis CSS para acompanhar o tema de cada página.

const arrowHead = (id) => `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
  <path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker>`;

const DIODE = `
  <line x1="20" y1="60" x2="80" y2="60"/>
  <polygon points="80,35 80,85 125,60" class="fill"/>
  <line x1="125" y1="35" x2="125" y2="85"/>
  <line x1="125" y1="60" x2="185" y2="60"/>
  <text x="22" y="48">A</text><text x="170" y="48">K</text>
  <text x="22" y="100" class="small">anodo</text><text x="150" y="100" class="small">catodo</text>`;

export const SYMBOL_PIN = `
<svg viewBox="0 0 205 115" class="sym" role="img" aria-label="Símbolo do diodo PIN">
  ${DIODE}
  <text x="88" y="112" class="tag">PIN</text>
</svg>`;

export const SYMBOL_FOTO = `
<svg viewBox="0 0 205 115" class="sym" role="img" aria-label="Símbolo do fotodiodo">
  <defs>${arrowHead('ah-sym')}</defs>
  ${DIODE}
  <g class="light">
    <line x1="72" y1="2" x2="92" y2="26" marker-end="url(#ah-sym)"/>
    <line x1="92" y1="2" x2="112" y2="26" marker-end="url(#ah-sym)"/>
  </g>
  <text x="130" y="18" class="small">hν</text>
</svg>`;

// Corte transversal P+ | I | N+ com contatos metálicos.
export const STRUCT_PIN = `
<svg viewBox="0 0 300 130" class="struct" role="img" aria-label="Estrutura do diodo PIN">
  <rect x="10" y="20" width="280" height="10" class="metal"/>
  <rect x="10" y="30" width="280" height="22" class="p"/>
  <rect x="10" y="52" width="280" height="46" class="i"/>
  <rect x="10" y="98" width="280" height="18" class="n"/>
  <rect x="10" y="116" width="280" height="8" class="metal"/>
  <text x="150" y="45">P⁺</text>
  <text x="150" y="80">I — intrínseca, larga (W)</text>
  <text x="150" y="111">N⁺</text>
  <text x="296" y="16" class="small end">anodo (metal)</text>
  <path d="M4 52 v46" class="dim"/><text x="4" y="78" class="small start" transform="rotate(-90 4 78)">W</text>
</svg>`;

// Fotodiodo PIN: janela antirreflexo, luz entrando e par elétron-lacuna na depleção.
export const STRUCT_FOTO = `
<svg viewBox="0 0 300 150" class="struct" role="img" aria-label="Estrutura do fotodiodo">
  <defs>${arrowHead('ah-st')}</defs>
  <g class="light">
    <line x1="60" y1="0" x2="75" y2="36" marker-end="url(#ah-st)"/>
    <line x1="100" y1="0" x2="110" y2="36" marker-end="url(#ah-st)"/>
    <line x1="140" y1="0" x2="145" y2="36" marker-end="url(#ah-st)"/>
  </g>
  <rect x="10" y="38" width="50" height="8" class="metal"/>
  <rect x="240" y="38" width="50" height="8" class="metal"/>
  <rect x="60" y="40" width="180" height="6" class="arc"/>
  <rect x="10" y="46" width="280" height="16" class="p"/>
  <rect x="10" y="62" width="280" height="52" class="i"/>
  <rect x="10" y="114" width="280" height="20" class="n"/>
  <rect x="10" y="134" width="280" height="8" class="metal"/>
  <text x="30" y="58" class="small">P⁺</text>
  <text x="30" y="128" class="small">N</text>
  <text x="150" y="108" class="small">região de depleção (absorção)</text>
  <circle cx="150" cy="84" r="5" class="hole"/><circle cx="175" cy="84" r="5" class="elec"/>
  <line x1="144" y1="84" x2="120" y2="70" class="drift h" marker-end="url(#ah-st)"/>
  <line x1="181" y1="84" x2="205" y2="100" class="drift e" marker-end="url(#ah-st)"/>
  <text x="112" y="78" class="small">h⁺</text><text x="210" y="96" class="small">e⁻</text>
  <text x="290" y="30" class="small end">janela antirreflexo</text>
</svg>`;

// Ícones compactos para a barra superior.
const MINI = `<line x1="2" y1="18" x2="16" y2="18"/><polygon points="16,10 16,26 29,18" class="fill"/>
  <line x1="29" y1="10" x2="29" y2="26"/><line x1="29" y1="18" x2="44" y2="18"/>`;
export const ICON_PIN = `<svg viewBox="0 0 46 30">${MINI}</svg>`;
export const ICON_FOTO = `<svg viewBox="0 0 46 30">${MINI}
  <line class="ray" x1="13" y1="1" x2="18" y2="7"/><line class="ray" x1="15" y1="7" x2="18" y2="7"/><line class="ray" x1="18" y1="4" x2="18" y2="7"/>
  <line class="ray" x1="19" y1="1" x2="24" y2="7"/><line class="ray" x1="21" y1="7" x2="24" y2="7"/><line class="ray" x1="24" y1="4" x2="24" y2="7"/>
</svg>`;
