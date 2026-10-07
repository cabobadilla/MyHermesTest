/**
 * tests/contrast.mjs — calculadora WCAG 2.x propia.
 *
 * Cero dependencias (ADR-004): ~30 lineas en vez de meter axe/pa11y.
 * Implementa la fórmula de luminancia relativa de WCAG 2.1 y el ratio de
 * contraste de la especificación.
 */

export const AA_BODY = 4.5;
export const AA_LARGE = 3;

/** "#rgb", "#rrggbb", "#rrggbbaa" o "rgb()/rgba()" -> [r, g, b] 0..255 */
export function parseColor(input) {
  const value = String(input).trim();

  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length === 6) hex += 'ff';
    if (hex.length !== 8) throw new Error(`Hex invalido: ${value}`);
    if (!/^[0-9a-fA-F]{8}$/.test(hex)) throw new Error(`Hex invalido: ${value}`);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }

  const fn = /^rgba?\(([^)]*)\)$/i.exec(value);
  if (fn) {
    const parts = fn[1]
      .split(/[\s,/]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length < 3) throw new Error(`Color invalido: ${value}`);
    const channel = (raw) =>
      raw.endsWith('%')
        ? Math.round((parseFloat(raw) / 100) * 255)
        : Math.round(parseFloat(raw));
    const rgb = parts.slice(0, 3).map(channel);
    if (rgb.some((n) => !Number.isFinite(n))) throw new Error(`Color invalido: ${value}`);
    return rgb;
  }

  throw new Error(`Formato de color no soportado: ${value}`);
}

/** Canal sRGB -> lineal, tal y como define WCAG. */
export function linearize(channel8) {
  const c = channel8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG de un color. */
export function relativeLuminance(color) {
  const [r, g, b] = parseColor(color);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** Ratio de contraste WCAG entre dos colores. Simetrico, minimo 1. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

/** Redondeo a 2 decimales, para el informe. */
export function ratio2(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Verificacion de un par de color.
 * @returns {{label:string, fg:string, bg:string, ratio:number, required:number, pass:boolean}}
 */
export function check(label, fg, bg, required) {
  const ratio = ratio2(contrastRatio(fg, bg));
  return { label, fg, bg, ratio, required, pass: ratio >= required };
}

/** Lista de pares a verificar para una piel + modo (cuerpo y titular). */
export function pairsFor(t, skin, mode) {
  const scope = `${skin} / ${mode}`;
  return [
    check(`${scope} · cuerpo (--text sobre --bg)`, t['--text'], t['--bg'], AA_BODY),
    check(`${scope} · cuerpo (--text sobre --surface)`, t['--text'], t['--surface'], AA_BODY),
    check(`${scope} · cuerpo (--text sobre --surface-2)`, t['--text'], t['--surface-2'], AA_BODY),
    check(`${scope} · cuerpo (--muted sobre --bg)`, t['--muted'], t['--bg'], AA_BODY),
    check(`${scope} · cuerpo (--muted sobre --surface)`, t['--muted'], t['--surface'], AA_BODY),
    check(`${scope} · cuerpo (--muted sobre --surface-2)`, t['--muted'], t['--surface-2'], AA_BODY),
    check(`${scope} · boton (--on-accent sobre --accent)`, t['--on-accent'], t['--accent'], AA_BODY),
    check(`${scope} · titular (--accent sobre --bg)`, t['--accent'], t['--bg'], AA_LARGE),
    check(`${scope} · titular (--accent sobre --surface)`, t['--accent'], t['--surface'], AA_LARGE),
    check(`${scope} · titular (--accent sobre --surface-2)`, t['--accent'], t['--surface-2'], AA_LARGE),
    check(`${scope} · titular (--text sobre --bg)`, t['--text'], t['--bg'], AA_LARGE),
  ];
}
