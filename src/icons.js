// Ícones de linha (Lucide) como SVG inline — herdam a cor via currentColor
import { RadioTower, SlidersHorizontal, Satellite, Shield, Zap, Magnet, Cable, Tv, Flame, HeartPulse, ScanLine, Barcode, Cog, Car, Construction, Lightbulb } from 'lucide';

const ICONS = { RadioTower, SlidersHorizontal, Satellite, Shield, Zap, Magnet, Cable, Tv, Flame, HeartPulse, ScanLine, Barcode, Cog, Car, Construction, Lightbulb };

export function icon(name) {
  const node = ICONS[name];
  if (!node) return '';
  const body = node.map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
