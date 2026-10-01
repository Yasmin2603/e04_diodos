// Notação com subscrito: "I_F" → I<sub>F</sub>; "V_{BR}" também aceito.

const SUB_RE = /([A-Za-zµͰ-Ͽ]+)_(\{[^}]*\}|[A-Za-z0-9-]+)/g;

/** Converte X_Y em X<sub>Y</sub> num trecho de HTML. */
export const sub = (html) => html.replace(SUB_RE, (_, base, s) => `${base}<sub>${s.replace(/[{}]/g, '')}</sub>`);

/** Quebra "V_R (V)" em segmentos [{t:'V'}, {t:'R', sub:true}, {t:' (V)'}]. */
export function segments(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(SUB_RE)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    out.push({ t: m[1] }, { t: m[2].replace(/[{}]/g, ''), sub: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}

/** Desenha texto com subscritos num canvas 2D. `font` = [peso, tamanho(px), família]. */
export function fillRich(ctx, text, x, y, { weight = 400, size = 12, family = 'Inter, sans-serif', align = 'center' } = {}) {
  const segs = segments(text);
  const fontOf = (s) => `${weight} ${s.sub ? Math.round(size * 0.72) : size}px ${family}`;
  let total = 0;
  for (const s of segs) { ctx.font = fontOf(s); total += ctx.measureText(s.t).width; }
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  const prevAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const s of segs) {
    ctx.font = fontOf(s);
    ctx.fillText(s.t, cx, s.sub ? y + size * 0.3 : y);
    cx += ctx.measureText(s.t).width;
  }
  ctx.textAlign = prevAlign;
}

/**
 * Plugin do Chart.js: títulos de eixo com subscrito.
 * O título nativo continua reservando o espaço (com cor transparente) e o texto
 * rico é desenhado por cima na mesma posição.
 */
export const richAxisTitles = {
  id: 'richAxisTitles',
  afterDraw(chart) {
    const { ctx } = chart;
    for (const scale of Object.values(chart.scales)) {
      const title = scale.options.title;
      if (!title?.display || !title.rich) continue;
      const size = title.font?.size ?? 12;
      ctx.save();
      ctx.fillStyle = title.richColor;
      ctx.textBaseline = 'middle';
      if (scale.isHorizontal()) {
        fillRich(ctx, title.rich, (scale.left + scale.right) / 2, scale.bottom - 4 - size / 2, { size });
      } else {
        ctx.translate(scale.left + 4 + size / 2, (scale.top + scale.bottom) / 2);
        ctx.rotate(-Math.PI / 2);
        fillRich(ctx, title.rich, 0, 0, { size });
      }
      ctx.restore();
    }
  },
};
