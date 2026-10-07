/**
 * tests/dom.mjs — parser minimo de index.html basado en regex.
 *
 * Cero dependencias (ADR-004). No es un parser HTML compliant: extrae justo
 * lo que la suite necesita verificar sobre un documento estatico y plano.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** Ruta del entregable: index.html en la raiz del repo (GitHub Pages). */
export const INDEX_PATH = join(HERE, '..', 'index.html');

export const SKINS = ['slate', 'rose', 'mono'];
export const MODES = ['light', 'dark'];

/** Los 13 tokens del contrato de diseno (04-DISENO.md). */
export const TOKENS = [
  '--bg',
  '--surface',
  '--surface-2',
  '--text',
  '--muted',
  '--accent',
  '--on-accent',
  '--border',
  '--shadow',
  '--font-heading',
  '--font-body',
  '--radius',
  '--container',
];

/** Reglas WCAG 2.x aplicadas por la suite. */
export const AA_BODY = 4.5;
export const AA_LARGE = 3;

export function indexExists() {
  return existsSync(INDEX_PATH);
}

/** Lanza un error legible si el entregable no existe todavia (estado RED). */
export function readIndex() {
  if (!indexExists()) {
    throw new Error(
      `index.html no existe en la raiz del repo (${INDEX_PATH}). ` +
        'La Etapa 1 exige un unico archivo estatico en la raiz.'
    );
  }
  return readFileSync(INDEX_PATH, 'utf8');
}

let cached = null;

/**
 * Igual que readIndex(), pero cachea. Se llama DENTRO de cada test para que la
 * ausencia de index.html produzca un fallo por test y no un abort de modulo.
 */
export function doc() {
  if (cached === null) cached = readIndex();
  return cached;
}

/* ------------------------------------------------------------------ */
/* Entidades                                                           */
/* ------------------------------------------------------------------ */

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '\u00a9',
  middot: '\u00b7',
  hellip: '\u2026',
  laquo: '\u00ab',
  raquo: '\u00bb',
  mdash: '\u2014',
  ndash: '\u2013',
  larr: '\u2190',
  rarr: '\u2192',
};

export function decodeEntities(input) {
  return String(input).replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (full, body) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const code = parseInt(isHex ? body.slice(2) : body.slice(1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : full;
  });
}

/* ------------------------------------------------------------------ */
/* Texto visible                                                       */
/* ------------------------------------------------------------------ */

/** Texto visible del documento: sin script, sin style, sin etiquetas. */
export function visibleText(html) {
  const stripped = String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
  return decodeEntities(stripped.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Texto visible de la primera coincidencia de un elemento, por etiqueta. */
export function elementText(html, tag, attrFilter) {
  const re = new RegExp(`<${tag}\\b[^>]*${attrFilter ?? ''}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = String(html).match(re);
  return m ? visibleText(m[1]) : null;
}

/** Todas las coincidencias de una etiqueta, ya sin etiquetas internas. */
export function elements(html, tag, attrFilter) {
  const re = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(String(html)))) {
    if (attrFilter && !new RegExp(attrFilter, 'i').test(m[1])) continue;
    out.push({ attrs: m[1], html: m[2], text: visibleText(m[2]) });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* CSS                                                                 */
/* ------------------------------------------------------------------ */

export function stripCssComments(css) {
  return String(css).replace(/\/\*[\s\S]*?\*\//g, '');
}

export function styleBlocks(html) {
  const out = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m;
  while ((m = re.exec(String(html)))) out.push(m[1]);
  return out;
}

/** Todo el CSS del documento, comentarios fuera y bloques concatenados. */
export function css(html) {
  return stripCssComments(styleBlocks(html).join('\n'));
}

const SKIN_SELECTOR = /^\[data-skin="([a-z0-9-]+)"\]\s*\[data-mode="(light|dark)"\]$/;

export function isSkinSelector(selector) {
  return SKIN_SELECTOR.test(String(selector).trim());
}

function scanRules(text, at) {
  const rules = [];
  let buf = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      let depth = 1;
      let j = i + 1;
      let body = '';
      while (j < text.length) {
        if (text[j] === '{') depth++;
        else if (text[j] === '}') {
          depth--;
          if (depth === 0) break;
        }
        body += text[j];
        j++;
      }
      const prelude = buf.trim();
      buf = '';
      if (prelude.startsWith('@')) {
        rules.push({ selector: prelude, declarations: null, at: [...at] });
        rules.push(...scanRules(body, [...at, prelude]));
      } else {
        rules.push({ selector: prelude, declarations: body, at: [...at] });
      }
      i = j + 1;
      continue;
    }
    if (ch === '}') {
      buf = '';
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  return rules;
}

/** Todas las reglas CSS, incluidas las dentro de @media / @keyframes. */
export function parseRules(cssText) {
  return scanRules(stripCssComments(cssText), []);
}

/** `prop: value` por cada declaracion; las vacias se descartan. */
export function parseDeclarations(body) {
  const out = [];
  for (const chunk of String(body ?? '').split(';')) {
    const idx = chunk.indexOf(':');
    if (idx === -1) continue;
    const prop = chunk.slice(0, idx).trim();
    const value = chunk.slice(idx + 1).trim();
    if (prop) out.push([prop, value]);
  }
  return out;
}

/** Declaraciones de una regla como objeto plano. */
export function asMap(declarations) {
  const out = {};
  for (const [prop, value] of declarations) out[prop] = value;
  return out;
}

/** Map `"<skin>/<mode>"` -> bloque con sus tokens. */
export function skinBlocks(cssText) {
  const map = new Map();
  for (const rule of parseRules(cssText)) {
    if (rule.at.length !== 0 || rule.declarations === null) continue;
    const m = SKIN_SELECTOR.exec(rule.selector.trim());
    if (!m) continue;
    map.set(`${m[1]}/${m[2]}`, {
      skin: m[1],
      mode: m[2],
      selector: rule.selector.trim(),
      declarations: parseDeclarations(rule.declarations),
      tokens: asMap(parseDeclarations(rule.declarations)),
    });
  }
  return map;
}

/** Todo token declarado en la piel `skin` para el `mode` dado. */
export function tokensFor(cssText, skin, mode) {
  const block = skinBlocks(cssText).get(`${skin}/${mode}`);
  if (!block) throw new Error(`Falta el bloque [data-skin="${skin}"][data-mode="${mode}"]`);
  return block.tokens;
}

/** Reglas de componente: todo lo que esta FUERA de los bloques de piel. */
export function componentRules(cssText) {
  return parseRules(cssText)
    .filter((r) => r.declarations !== null)
    .filter((r) => !(r.at.length === 0 && isSkinSelector(r.selector)))
    .map((r) => ({
      selector: r.selector.trim(),
      at: [...r.at],
      declarations: parseDeclarations(r.declarations),
      declarationText: r.declarations,
    }));
}

/* ------------------------------------------------------------------ */
/* Scripts                                                             */
/* ------------------------------------------------------------------ */

/** Todo lo que hay antes de <body>. */
export function headMarkup(html) {
  const idx = String(html).search(/<body\b/i);
  return idx === -1 ? String(html) : String(html).slice(0, idx);
}

/** El <script> inline que vive en <head> (anti-FOUC + controlador). */
export function headScript(html) {
  const m = headMarkup(html).match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
  return m ? m[1] : '';
}

/** Compila el script inline sin ejecutarlo: la sintaxis se valida al construir. */
export function compileInlineScript(html) {
  const source = headScript(html);
  if (!source.trim()) throw new Error('No hay <script> inline en <head>');
  // Compila sin ejecutar: si hay error de sintaxis, lanza SyntaxError.
  return new Function(source);
}

/* ------------------------------------------------------------------ */
/* Utilidades de assert                                               */
/* ------------------------------------------------------------------ */

/** Cuenta apariciones no solapadas. */
export function count(haystack, needle) {
  if (!needle) return 0;
  return String(haystack).split(needle).length - 1;
}

/** Indice de la primera aparicion, o -1. */
export function at(haystack, needle) {
  return String(haystack).indexOf(needle);
}
