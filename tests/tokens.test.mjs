/**
 * T-4 — Sistema de tokens y las 3 pieles de la Etapa 1 (ADR-001, ADR-003).
 *
 * Regla dura del diseno: los componentes solo referencian var(--token).
 * Cero colores literales fuera de los bloques de piel.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { MODES, SKINS, TOKENS, componentRules, isSkinSelector, skinBlocks, tokensFor } from './dom.mjs';
import { sheet as SHEET } from './fixtures.mjs';

function blocks() {
  return skinBlocks(SHEET());
}



/** Tipografia esperada por piel, segun BRIEF.md (las 10 combinaciones investigadas). */
const EXPECTED_FONTS = {
  slate: { heading: 'Inter', body: 'Inter' },
  indigo: { heading: 'Plus Jakarta Sans', body: 'Inter' },
  emerald: { heading: 'Sora', body: 'DM Sans' },
  amber: { heading: 'Manrope', body: 'Nunito Sans' },
  rose: { heading: 'Playfair Display', body: 'Inter' },
  violet: { heading: 'Space Grotesk', body: 'Inter' },
  teal: { heading: 'Outfit', body: 'Work Sans' },
  cyan: { heading: 'Montserrat', body: 'Hind' },
  zinc: { heading: 'DM Serif Display', body: 'DM Sans' },
  mono: { heading: 'Libre Baskerville', body: 'Source Sans 3' },
};

const COLOR_TOKENS = TOKENS.filter((t) => !t.startsWith('--font-') && t !== '--radius' && t !== '--container');

test('T-4 · existen exactamente tantas pieles como el corte vigente x 2 modos', () => {
  assert.equal(blocks().size, SKINS.length * MODES.length,
    `se esperaban ${SKINS.length * MODES.length} bloques de piel, hay ${blocks().size}`);

  for (const skin of SKINS) {
    for (const mode of MODES) {
      assert.ok(
        blocks().has(`${skin}/${mode}`),
        `falta el bloque [data-skin="${skin}"][data-mode="${mode}"]`
      );
    }
  }
});

test('T-4 · no hay pieles fuera del corte vigente (ni inventadas, ni de marca)', () => {
  const declared = [...new Set([...blocks().values()].map((b) => b.skin))];
  assert.deepEqual(
    declared.sort(),
    [...SKINS].sort(),
    `solo pueden existir las pieles del corte vigente; se declararon: ${declared.join(', ')}`
  );
});

test('T-4 · cada bloque define EXACTAMENTE los 13 tokens del contrato', () => {
  for (const [key, block] of blocks()) {
    const props = block.declarations.map(([prop]) => prop);
    assert.deepEqual(
      [...props].sort(),
      [...TOKENS].sort(),
      `${key}: define ${props.length} tokens, esperaba exactamente 13 -> ${props.join(', ')}`
    );
    assert.equal(
      new Set(props).size,
      props.length,
      `${key}: hay tokens duplicados -> ${props.join(', ')}`
    );
  }
});

test('T-4 · los 9 tokens de color tienen valor en ambos modos', () => {
  for (const [key, block] of blocks()) {
    for (const token of COLOR_TOKENS) {
      const value = block.tokens[token];
      assert.ok(value, `${key}: ${token} sin valor`);
      assert.notEqual(value.trim(), '', `${key}: ${token} esta vacio`);
    }
  }
});

test('T-4 · --radius y --container coinciden entre los dos modos de una piel', () => {
  for (const skin of SKINS) {
    const light = tokensFor(SHEET(), skin, 'light');
    const dark = tokensFor(SHEET(), skin, 'dark');
    assert.equal(light['--radius'], dark['--radius'], `${skin}: --radius debe ser igual en ambos modos`);
    assert.equal(
      light['--container'],
      dark['--container'],
      `${skin}: --container debe ser igual en ambos modos`
    );
    assert.match(light['--radius'], /^\d+(\.\d+)?(px|rem)$/, `${skin}: --radius no es una longitud valida`);
    assert.match(light['--container'], /^\d+(\.\d+)?(px|rem)$/, `${skin}: --container no es una longitud valida`);
  }
});

test('T-4 · la tipografia de cada piel es la del corte de Etapa 1', () => {
  for (const skin of SKINS) {
    const t = tokensFor(SHEET(), skin, 'light');
    assert.match(
      t['--font-heading'],
      new RegExp(`^['"]?${EXPECTED_FONTS[skin].heading}['"]?\\s*,`),
      `${skin}: --font-heading debe empezar por "${EXPECTED_FONTS[skin].heading}", se ve "${t['--font-heading']}"`
    );
    assert.match(
      t['--font-body'],
      new RegExp(`^['"]?${EXPECTED_FONTS[skin].body}['"]?\\s*,`),
      `${skin}: --font-body debe empezar por "${EXPECTED_FONTS[skin].body}", se ve "${t['--font-body']}"`
    );
  }
});

test('T-4 · toda pila tipografica incluye una familia generica de reserva', () => {
  for (const [key, block] of blocks()) {
    for (const token of ['--font-heading', '--font-body']) {
      const stack = block.tokens[token];
      const families = stack.split(',').map((f) => f.trim());
      assert.ok(families.length >= 2, `${key} ${token}: la pila necesita al menos un fallback`);
      const generic = families.some((f) =>
        /^(serif|sans-serif|monospace|system-ui|ui-serif|ui-sans-serif|ui-monospace|cursive|fantasy)$/i.test(f)
      );
      assert.ok(
        generic,
        `${key} ${token}: la pila "${stack}" no termina en una familia generica del sistema`
      );
    }
  }
});

test('T-4 · --font-heading/--font-body son identicos en los dos modos', () => {
  for (const skin of SKINS) {
    const light = tokensFor(SHEET(), skin, 'light');
    const dark = tokensFor(SHEET(), skin, 'dark');
    assert.equal(light['--font-heading'], dark['--font-heading'], `${skin}: --font-heading varia entre modos`);
    assert.equal(light['--font-body'], dark['--font-body'], `${skin}: --font-body varia entre modos`);
  }
});

test('T-4 · el acento oscuro se RE-DISEÑA: nunca reutiliza el hex claro', () => {
  for (const skin of SKINS) {
    const light = tokensFor(SHEET(), skin, 'light');
    const dark = tokensFor(SHEET(), skin, 'dark');
    assert.notEqual(
      dark['--accent'].toLowerCase(),
      light['--accent'].toLowerCase(),
      `${skin}: el modo oscuro reutiliza el hex de acento claro (${light['--accent']}); ` +
        'debe rediseñarse la luminosidad para superficie oscura (BRIEF.md)'
    );
    assert.notEqual(
      dark['--on-accent'].toLowerCase(),
      light['--on-accent'].toLowerCase(),
      `${skin}: --on-accent debe re-diseñarse para el acento oscuro`
    );
  }
});

test('T-4 · cero colores literales fuera de los bloques de piel (ADR-001)', () => {
  const HEX = /#[0-9a-fA-F]{3,8}\b/;
  const FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\s*\(/i;
  const GRADIENT = /\b(?:linear|radial|conic)-gradient\s*\(/i;
  const NAMED = /^(?:transparent|currentcolor|white|black|silver|gray|grey|red|blue|green|yellow|orange|purple|pink|brown|beige|ivory|navy|teal|maroon|olive|aqua|fuchsia|lime|coral|salmon|khaki|tan|plum|orchid|turquoise|azure|lavender|gold|indigo|violet|crimson|slate|zinc|stone|neutral)\b/i;

  const offenders = [];
  for (const rule of componentRules(SHEET())) {
    for (const [prop, value] of rule.declarations) {
      if (value.trim().startsWith('var(')) continue;
      if (HEX.test(value)) offenders.push(`${rule.selector} { ${prop}: ${value} }  -> hex literal`);
      if (FN.test(value)) offenders.push(`${rule.selector} { ${prop}: ${value } }  -> funcion de color`);
      if (GRADIENT.test(value)) offenders.push(`${rule.selector} { ${prop}: ${value } }  -> gradiente`);
      if (NAMED.test(value.trim())) offenders.push(`${rule.selector} { ${prop}: ${value } }  -> color con nombre`);
    }
  }
  assert.deepEqual(offenders, [], `colores literales fuera de las pieles:\n${offenders.join('\n')}`);
});

test('T-4 · todo color de componente se resuelve por var(--token)', () => {
  const COLOR_PROPS = [
    'color',
    'background',
    'background-color',
    'border-color',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'outline-color',
    'box-shadow',
    'text-shadow',
    'fill',
    'stroke',
    'text-decoration-color',
    'border-block-start-color',
    'border-block-end-color',
  ];
  for (const rule of componentRules(SHEET())) {
    for (const [prop, value] of rule.declarations) {
      if (!COLOR_PROPS.includes(prop.toLowerCase())) continue;
      const base = prop.toLowerCase().replace(/-color$/, '');
      const tokenRef = base === 'border-block-start' || base === 'border-block-end'
        ? value
        : value;
      assert.match(
        tokenRef,
        /var\(--/,
        `${rule.selector} { ${prop}: ${value} } debe usar var(--token), no un valor directo`
      );
      const used = [...value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]);
      for (const token of used) {
        assert.ok(
          TOKENS.includes(token),
          `${rule.selector} usa var(${token}), que no es uno de los 13 tokens del contrato`
        );
      }
    }
  }
});

test('T-4 · los bloques de piel solo aparecen a nivel raiz con los 3 skins exactos', () => {
  for (const rule of componentRules(SHEET())) {
    if (!isSkinSelector(rule.selector)) continue;
    assert.equal(rule.at.length, 0, `${rule.selector} no debe anidarse dentro de un @`);
  }
  for (const block of blocks().values()) {
    assert.match(block.selector, new RegExp(SKINS.map((s) => `data-skin="${s}"`).join('|')));
  }
});
