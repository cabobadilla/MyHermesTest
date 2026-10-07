/**
 * T-2 + T-3 + T-6 — Estructura de la landing (HU-1, HU-2, HU-3) y transicion
 * horizontal respeta prefers-reduced-motion.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  at,
  componentRules,
  count,
  elementText,
  elements,
  SKINS,
  visibleText,
} from './dom.mjs';
import { html as SRC, sheet as SHEET } from './fixtures.mjs';



const SECTIONS = [
  ['barra', '<header'],
  ['hero', 'id="hero"'],
  ['servicios', 'id="servicios"'],
  ['metodo', 'id="metodo"'],
  ['contacto', 'id="contacto"'],
  ['pie', '<footer'],
];

test('HU-1 · el documento declara lang="es" y un unico <main>', () => {
  const htmlTag = /<html\b([^>]*)>/i.exec(SRC());
  assert.ok(htmlTag, 'falta la etiqueta <html>');
  assert.match(htmlTag[1], /lang="es"/i, 'el documento debe estar en espanol (lang="es")');
  assert.equal(count(SRC(), '<main'), 1, 'debe existir exactamente un <main>');
});

test('HU-1 · las 6 secciones aparecen exactamente y en orden', () => {
  for (const [name, marker] of SECTIONS) {
    assert.equal(at(SRC(), marker) >= 0, true, `falta la seccion "${name}" (${marker})`);
  }
  const positions = SECTIONS.map(([, marker]) => at(SRC(), marker));
  const sorted = [...positions].sort((a, b) => a - b);
  assert.deepEqual(
    positions,
    sorted,
    `orden incorrecto: se esperaba barra -> hero -> servicios -> metodo -> contacto -> footer`
  );
});

test('HU-1 · el hero NO contiene la cadena "Hello World"', () => {
  assert.equal(
    /hello\s+world/i.test(SRC()),
    false,
    'la cadena "Hello World" no puede aparecer en el entregable'
  );
});

test('HU-1 · el hero tiene una propuesta de valor de una sola frase', () => {
  assert.equal(count(SRC(), '<h1'), 1, 'debe existir exactamente un <h1>');
  const h1 = elementText(SRC(), 'h1');
  assert.ok(h1, 'el <h1> no puede estar vacio');
  assert.ok(h1.length >= 12, `propuesta de valor demasiado corta: "${h1}"`);
  assert.ok(
    h1.length <= 120,
    `propuesta de valor demasiado larga para ser "una frase" (${h1.length} car.): "${h1}"`
  );
  assert.equal(/\s{2,}/.test(h1), false, 'el h1 no debe partirse en varias lineas de copy');
});

test('HU-1 · la propuesta de valor esta escrita una sola vez (ADR-003)', () => {
  const h1 = elementText(SRC(), 'h1');
  assert.equal(count(SRC(), h1), 1, `el titular "${h1}" debe existir una sola vez en el archivo`);
});

test('HU-1 · hay exactamente 3 servicios, cada uno con titulo y descripcion', () => {
  const services = elements(SRC(), 'li', 'class="[^"]*service[^"]*"');
  assert.equal(services.length, 3, `se esperaban 3 servicios, hay ${services.length}`);

  const titles = elements(SRC(), 'h3', 'class="[^"]*service__title[^"]*"');
  const descs = elements(SRC(), 'p', 'class="[^"]*service__desc[^"]*"');
  assert.equal(titles.length, 3, 'cada servicio necesita un <h3 class="service__title">');
  assert.equal(descs.length, 3, 'cada servicio necesita un <p class="service__desc">');

  for (const [i, service] of services.entries()) {
    assert.ok(titles[i] && titles[i].text.length > 2, `servicio ${i + 1} sin titulo`);
    assert.ok(descs[i] && descs[i].text.length > 10, `servicio ${i + 1} sin descripcion`);
    assert.ok(
      services[i].html.includes('service__title') && services[i].html.includes('service__desc'),
      `servicio ${i + 1} debe traer titulo y descripcion juntos`
    );
  }
});

test('HU-1 · el metodo tiene 3 o 4 pasos numerados', () => {
  const steps = elements(SRC(), 'li', 'class="[^"]*step[^"]*"');
  assert.ok(
    steps.length === 3 || steps.length === 4,
    `el metodo debe tener 3 o 4 pasos, tiene ${steps.length}`
  );

  const numbers = elements(SRC(), 'span', 'class="[^"]*step__num[^"]*"');
  assert.equal(numbers.length, steps.length, 'cada paso lleva su numero');

  const labels = steps.map((step, i) => {
    const m = /class="[^"]*step__num[^"]*"[^>]*>\s*([0-9]{2})\s*</i.exec(step.html);
    assert.ok(m, `el paso ${i + 1} no esta numerado (se espera "01", "02"...)`);
    return m[1];
  });
  assert.deepEqual(
    labels,
    steps.map((_, i) => String(i + 1).padStart(2, '0')),
    'los pasos deben ir numerados correlativamente desde 01'
  );

  const titles = elements(SRC(), 'h3', 'class="[^"]*step__title[^"]*"');
  assert.equal(titles.length, steps.length, 'cada paso necesita un <h3 class="step__title">');
});

test('HU-1 · hay llamada a la accion y footer', () => {
  const ctaTitle = elementText(SRC(), 'h2', 'class="[^"]*cta__title[^"]*"');
  assert.ok(ctaTitle && ctaTitle.length > 8, 'la llamada a la accion necesita un titular');

  const ctaLink = elements(SRC(), 'a', 'class="[^"]*btn--primary[^"]*"');
  assert.equal(ctaLink.length, 1, 'la llamada a la accion necesita un boton primario');
  assert.ok(ctaLink[0].text.length > 2, 'el boton primario necesita etiqueta visible');

  const footer = elementText(SRC(), 'footer');
  assert.ok(footer && footer.length > 5, 'el footer necesita contenido');
});

test('HU-1 · el copy es en espanol de consultora agentica', () => {
  const text = visibleText(SRC());
  const spanishMarkers = [
    'consultor',
    'agent',
    'proceso',
    'diagn',
    'dise',
    'desplieg',
    'gobern',
    'operaci',
    'equipo',
    'm',
  ];
  const lower = text.toLowerCase();
  const hits = spanishMarkers.filter((m) => lower.includes(m));
  assert.ok(
    hits.length >= 6,
    `el copy deberia estar en espanol y hablar de consultoria agentica; solo ${hits.length} marcadores: ${hits.join(', ')}`
  );
  assert.equal(/lorem ipsum/i.test(text), false, 'no puede haber texto de relleno en ingles');
});

test('HU-2/HU-3 · el <header> tiene marca, selector, toggle, flechas y contador', () => {
  const header = /<header\b[\s\S]*?<\/header>/i.exec(SRC());
  assert.ok(header, 'falta el <header>');
  const bar = header[0];

  assert.match(bar, /class="[^"]*brand[^"]*"/, 'falta la marca en la barra');
  const brand = elementText(bar, 'span', 'class="[^"]*brand[^"]*"');
  assert.ok(brand && brand.length > 1, 'la marca debe ser texto visible');

  const skinButtons = elements(bar, 'button', 'data-skin="');
  assert.equal(
    skinButtons.length,
    SKINS.length,
    `el selector debe tener ${SKINS.length} opciones (una por piel), tiene ${skinButtons.length}`
  );
  for (const button of skinButtons) {
    assert.match(button.attrs, /aria-pressed="(true|false)"/, 'cada opcion necesita aria-pressed');
  }
  assert.equal(
    skinButtons.filter((b) => /aria-pressed="true"/.test(b.attrs)).length,
    1,
    'exactamente una opcion del selector arranca como activa'
  );

  const modeBtn = elements(bar, 'button', 'id="modo"');
  assert.equal(modeBtn.length, 1, 'falta el boton de modo claro/oscuro');
  assert.match(modeBtn[0].attrs, /aria-pressed="(true|false)"/, 'el toggle necesita aria-pressed');
  assert.match(modeBtn[0].attrs, /aria-label="[^"]+"/, 'el toggle necesita etiqueta accesible');

  const counter = elements(bar, 'span', 'id="contador"');
  assert.equal(counter.length, 1, 'falta el nodo del contador');
  const counterMatch = /^(\d{2})\/(\d+)$/.exec(counter[0].text);
  assert.ok(
    counterMatch,
    `el contador debe mostrarse como NN/TOTAL, se ve "${counter[0].text}"`
  );
  assert.equal(
    Number(counterMatch[2]),
    SKINS.length,
    `el total del contador debe ser el numero de pieles (${SKINS.length}), se ve "${counter[0].text}"`
  );

  const arrows = elements(bar, 'button', 'class="[^"]*ctrl--arrow[^"]*"');
  assert.equal(arrows.length, 2, `deben existir exactamente 2 botones de flecha, hay ${arrows.length}`);
  const glyphs = arrows.map((a) => a.text.trim());
  assert.deepEqual(glyphs.sort(), ['←', '→'], 'las flechas deben ser ← y →');
  for (const arrow of arrows) {
    assert.match(arrow.attrs, /aria-label="[^"]+"/, 'cada flecha necesita etiqueta accesible');
    assert.match(arrow.attrs, /type="button"/, 'cada flecha debe ser type="button"');
  }
});

test('HU-2 · <html> lleva data-skin y data-mode validos de partida', () => {
  const htmlTag = /<html\b([^>]*)>/i.exec(SRC());
  assert.ok(htmlTag, 'falta la etiqueta <html>');
  const skin = /data-skin="([^"]*)"/i.exec(htmlTag[1]);
  const mode = /data-mode="([^"]*)"/i.exec(htmlTag[1]);
  assert.ok(skin, '<html> debe llevar data-skin siempre presente');
  assert.ok(mode, '<html> debe llevar data-mode siempre presente');
  assert.ok(
    ['slate', 'rose', 'mono'].includes(skin[1]),
    `data-skin inicial "${skin[1]}" no esta en el registro`
  );
  assert.ok(['light', 'dark'].includes(mode[1]), `data-mode inicial "${mode[1]}" invalido`);
});

test('HU-3 · la transicion horizontal usa transform + opacity y tiene direccion', () => {
  assert.match(SHEET(), /translateX\(/, 'la transicion debe usar transform: translateX()');
  assert.match(SHEET(), /opacity/, 'la transicion debe incluir fade de opacity');
  assert.match(
    SHEET(),
    /in-right|in-left|inright|inleft|slide-right|slide-left|right|left/,
    'deben existir las dos direcciones de la transicion'
  );
  const script = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(SRC())[1];
  assert.match(script, /'in-right'|"in-right"|in-right/, 'el script debe aplicar la direccion "in-right"');
  assert.match(script, /'in-left'|"in-left"|in-left/, 'el script debe aplicar la direccion "in-left"');
});

test('HU-3 · prefers-reduced-motion desactiva la transicion', () => {
  const block = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{([\s\S]*)/i.exec(SHEET());
  assert.ok(block, 'falta el bloque @media (prefers-reduced-motion: reduce)');

  const inner = block[1];
  const close = inner.lastIndexOf('}');
  const body = close === -1 ? inner : inner.slice(0, close);
  assert.match(
    body,
    /(animation|transition)\s*:\s*none/,
    'dentro de prefers-reduced-motion hay que desactivar animation o transition'
  );
  assert.match(
    body,
    /animation\s*:\s*none/,
    'la animacion de deslizamiento debe quedar en animation: none'
  );
});

test('BORDE · Google Fonts ausente: cada font-family tiene pila de fallback', () => {
  const stacks = componentRules(SHEET()).filter((r) =>
    r.declarations.some(([prop]) => prop === 'font-family')
  );
  for (const rule of stacks) {
    for (const [prop, value] of rule.declarations) {
      if (prop !== 'font-family') continue;
      assert.notEqual(value.includes('var('), true, 'un componente no debe declarar font-family');
    }
  }
  assert.equal(
    stacks.length,
    0,
    'las familias tipograficas solo se declaran en los bloques de piel (--font-heading/--font-body)'
  );
});
