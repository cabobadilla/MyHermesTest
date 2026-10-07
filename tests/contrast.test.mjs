/**
 * T-4 (contraste) — WCAG AA numerico sobre las 6 combinaciones de la Etapa 1.
 *
 * 3 skins (slate, rose, mono) x 2 modos (light, dark) = 6 superficies.
 * Criterio de exito (03-DEFINICION.md, HU-4):
 *   - texto de cuerpo  >= 4.5:1
 *   - titulares grandes >= 3:1
 *
 * El calculo es propio (tests/contrast.mjs), sin dependencias.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { MODES, SKINS, skinBlocks } from './dom.mjs';

/**
 * Devuelve el bloque piel/modo, fallando con un mensaje util si no existe.
 * Sin este guardia, cuando falta una piel el test revienta con
 * "Cannot read properties of undefined (reading 'tokens')" — que no dice nada.
 */
function blockOf(skin, mode) {
  const b = blocks().get(`${skin}/${mode}`);
  assert.ok(b, `falta el bloque [data-skin="${skin}"][data-mode="${mode}"]`);
  return b;
}
import { sheet as SHEET } from './fixtures.mjs';

function blocks() {
  return skinBlocks(SHEET());
}
import {
  AA_BODY,
  AA_LARGE,
  contrastRatio,
  pairsFor,
  ratio2,
  relativeLuminance,
} from './contrast.mjs';



/** Pares (foreground, background) que el sitio usa de verdad en cada superficie. */
function surfacePairs(tokens, skin, mode) {
  const s = `${skin}/${mode}`;
  return [
    { label: `${s} body text/bg`, fg: tokens['--text'], bg: tokens['--bg'], min: AA_BODY },
    { label: `${s} body text/surface`, fg: tokens['--text'], bg: tokens['--surface'], min: AA_BODY },
    { label: `${s} body text/surface-2`, fg: tokens['--text'], bg: tokens['--surface-2'], min: AA_BODY },
    { label: `${s} muted/bg`, fg: tokens['--muted'], bg: tokens['--bg'], min: AA_BODY },
    { label: `${s} muted/surface`, fg: tokens['--muted'], bg: tokens['--surface'], min: AA_BODY },
    { label: `${s} muted/surface-2`, fg: tokens['--muted'], bg: tokens['--surface-2'], min: AA_BODY },
    { label: `${s} button on-accent/accent`, fg: tokens['--on-accent'], bg: tokens['--accent'], min: AA_BODY },
    { label: `${s} heading accent/bg`, fg: tokens['--accent'], bg: tokens['--bg'], min: AA_LARGE },
    { label: `${s} heading accent/surface`, fg: tokens['--accent'], bg: tokens['--surface'], min: AA_LARGE },
    { label: `${s} heading accent/surface-2`, fg: tokens['--accent'], bg: tokens['--surface-2'], min: AA_LARGE },
  ];
}

test('contraste · la calculadora WCAG es correcta en sus casos conocidos', () => {
  // Casos de referencia de la especificacion WCAG 2.1.
  assert.equal(ratio2(contrastRatio('#000000', '#ffffff')), 21);
  assert.equal(ratio2(contrastRatio('#ffffff', '#ffffff')), 1);
  assert.equal(ratio2(contrastRatio('#777777', '#ffffff')), 4.48);
  assert.equal(ratio2(contrastRatio('#767676', '#ffffff')), 4.54);
  assert.equal(ratio2(relativeLuminance('#ffffff')), 1);
  assert.equal(relativeLuminance('#000000'), 0);
});

test('contraste · existen las 6 combinaciones piel x modo', () => {
  assert.equal(blocks().size, SKINS.length * MODES.length);
  for (const skin of SKINS) {
    for (const mode of MODES) {
      assert.ok(blocks().has(`${skin}/${mode}`), `falta la combinacion ${skin}/${mode}`);
    }
  }
});

/** Un test por combinacion: si una falla, el nombre dice exactamente cual. */
for (const skin of SKINS) {
  for (const mode of MODES) {
    const key = `${skin}/${mode}`;
    test(`contraste · ${key} cumple WCAG AA`, () => {
      const block = blocks().get(key);
      assert.ok(block, `falta el bloque ${key}`);
      const tokens = block.tokens;

      const failures = [];
      for (const pair of surfacePairs(tokens, skin, mode)) {
        const ratio = ratio2(contrastRatio(pair.fg, pair.bg));
        if (ratio < pair.min) {
          failures.push(
            `${pair.label}: ${ratio}:1 (min ${pair.min}:1)  ${pair.fg} sobre ${pair.bg}`
          );
        }
      }
      assert.deepEqual(
        failures,
        [],
        `${key} falla AA:\n  ${failures.join('\n  ')}`
      );
    });
  }
}

test('contraste · los 6 ratios se pueden imprimir para revision manual', () => {
  const rows = [];
  for (const skin of SKINS) {
    for (const mode of MODES) {
      const t = blockOf(skin, mode).tokens;
      const body = ratio2(contrastRatio(t['--text'], t['--bg']));
      const heading = ratio2(contrastRatio(t['--accent'], t['--bg']));
      const muted = ratio2(contrastRatio(t['--muted'], t['--bg']));
      const onAccent = ratio2(contrastRatio(t['--on-accent'], t['--accent']));
      rows.push({
        skin,
        mode,
        body,
        heading,
        muted,
        onAccent,
        pass: body >= AA_BODY && heading >= AA_LARGE && muted >= AA_BODY && onAccent >= AA_BODY,
      });
    }
  }
  const table = rows
    .map(
      (r) =>
        `${r.skin.padEnd(6)} ${r.mode.padEnd(6)} body ${String(r.body).padStart(6)}:1  ` +
        `heading ${String(r.heading).padStart(6)}:1  muted ${String(r.muted).padStart(6)}:1  ` +
        `on-accent ${String(r.onAccent).padStart(6)}:1  ${r.pass ? 'AA' : 'FAIL'}`
    )
    .join('\n');
  assert.equal(rows.length, 6);
  assert.equal(
    rows.every((r) => r.pass),
    true,
    `combinaciones sin AA:\n${table}`
  );
  console.log(`\n[contraste] 6 combinaciones piel x modo\n${table}\n`);
});

test('contraste · el acento claro se lee sobre superficie clara y el oscuro sobre oscura', () => {
  for (const skin of SKINS) {
    const light = blockOf(skin, 'light').tokens;
    const dark = blockOf(skin, 'dark').tokens;

    const lightAccentLum = relativeLuminance(light['--accent']);
    const lightBgLum = relativeLuminance(light['--bg']);
    const darkAccentLum = relativeLuminance(dark['--accent']);
    const darkBgLum = relativeLuminance(dark['--bg']);

    assert.ok(
      light['--text'] && dark['--text'],
      `${skin}: --text debe existir en ambos modos`
    );
    assert.ok(
      relativeLuminance(light['--text']) < lightBgLum,
      `${skin}/light: el texto debe ser mas oscuro que el fondo`
    );
    assert.ok(
      relativeLuminance(dark['--text']) > darkBgLum,
      `${skin}/dark: el texto debe ser mas claro que el fondo`
    );
    assert.ok(lightAccentLum !== darkAccentLum, `${skin}: la luminancia del acento debe cambiar en oscuro`);
  }
});

test('contraste · paresFor cubre las 11 comprobaciones por combinacion', () => {
  for (const skin of SKINS) {
    for (const mode of MODES) {
      const t = blockOf(skin, mode).tokens;
      const checks = pairsFor(t, skin, mode);
      assert.equal(checks.length, 11);
      const failing = checks.filter((c) => !c.pass);
      assert.deepEqual(
        failing.map((f) => `${f.label}: ${f.ratio}:1 < ${f.required}:1`),
        [],
        `${skin}/${mode} falla en pairsFor`
      );
    }
  }
});
