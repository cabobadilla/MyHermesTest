/**
 * T-1 / T-8 — Empaquetado: un unico index.html autocontenido, sin build step,
 * apto para GitHub Pages en un subpath, con Google Fonts como unica dependencia
 * externa (BRIEF.md requisito 2, ADR-004: tests fuera del sitio).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';

import { MODES, SKINS, compileInlineScript, headScript, styleBlocks } from './dom.mjs';
import { html as SRC } from './fixtures.mjs';



const ALLOWED_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

/** Todas las URL absolutas que el documento puede cargar. */
function externalRefs() {
  const refs = [];
  const push = (url, how) => {
    const m = /^(?:https?:)?\/\/([^/?#"')\s]+)/i.exec(url.trim());
    if (m) refs.push({ host: m[1].toLowerCase(), url: url.trim(), how });
  };

  for (const m of SRC().matchAll(/\b(?:href|src|action|data|poster)\s*=\s*"([^"]*)"/gi)) {
    if (/^(?:#|mailto:|tel:|data:|#)/i.test(m[1])) continue;
    push(m[1], m[0]);
  }
  for (const m of SRC().matchAll(/url\(\s*['"]?([^'")]+)/gi)) {
    if (/^data:/i.test(m[1])) continue;
    push(m[1], m[0]);
  }
  return refs;
}

function googleFontsHref() {
  const links = [...SRC().matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const sheet = links.find((l) => /rel\s*=\s*"stylesheet"/i.test(l) && /fonts\.googleapis\.com/i.test(l));
  assert.ok(sheet, 'falta el <link rel="stylesheet"> a fonts.googleapis.com');
  return /href\s*=\s*"([^"]*)"/i.exec(sheet)[1];
}

/** { familia -> [pesos] } desde el href de Google Fonts. */
function requestedFonts() {
  const href = decodeURIComponent(googleFontsHref());
  assert.match(href, /\bfamily=/, 'el href de Google Fonts debe usar el parametro family=');

  const out = new Map();
  for (const part of href.split('?').pop().split('&')) {
    const kv = part.split('=');
    if (kv[0] !== 'family') continue;
    const [rawName, rawAxes] = kv.slice(1).join('=').split(':');
    const name = rawName.replace(/\+/g, ' ').trim();
    const weights = rawAxes && rawAxes.startsWith('wght@')
      ? rawAxes
          .slice(5)
          .split(';')
          .map((w) => w.trim())
      : [];
    out.set(name, weights);
  }
  return out;
}

/** Familias que el CSS realmente usa (primer elemento de --font-*-body). */
function usedFamilies() {
  const used = new Set();
  for (const block of SRC().matchAll(/--(font-heading|font-body)\s*:\s*([^;]+);/gi)) {
    const first = block[2].split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    used.add(first);
  }
  return used;
}

/** Pesos que el CSS aplica de verdad en componentes. */
function usedWeights() {
  const used = new Set();
  const body = styleBlocks(SRC()).join('\n');
  for (const m of body.matchAll(/font-weight\s*:\s*([^;}]+)/gi)) {
    used.add(m[1].trim());
  }
  return used;
}

test('empaquetado · index.html es un unico archivo en la raiz del repo', () => {
  assert.ok(existsSync(new URL('../index.html', import.meta.url)));
  assert.equal(/^﻿?<!doctype html>/i.test(SRC().trim()), true, 'debe empezar por <!doctype html>');
  assert.equal(/<html\b[^>]*\blang="es"/i.test(SRC()), true, 'lang="es" en <html>');
});

test('empaquetado · la unica dependencia externa es Google Fonts', () => {
  const bad = externalRefs().filter((r) => !ALLOWED_HOSTS.includes(r.host));
  assert.deepEqual(
    bad.map((b) => `${b.host}  (${b.how})`),
    [],
    `recursos externos no permitidos:\n${bad.map((b) => `  ${b.host} — ${b.url}`).join('\n')}`
  );
});

test('empaquetado · todos los hosts externos son los permitidos', () => {
  const hosts = [...new Set(externalRefs().map((r) => r.host))].sort();
  for (const host of hosts) {
    assert.ok(
      ALLOWED_HOSTS.includes(host),
      `host no permitido: "${host}". Solo se permiten ${ALLOWED_HOSTS.join(' y ')}.`
    );
  }
});

test('empaquetado · no hay assets locales: ni scripts, ni CSS, ni imagenes', () => {
  const offenders = [];
  for (const m of SRC().matchAll(/<script\b[^>]*>/gi)) {
    if (/\bsrc\s*=/i.test(m[0])) offenders.push(`<script src>: ${m[0]}`);
  }
  for (const m of SRC().matchAll(/<link\b[^>]*>/gi)) {
    if (/rel\s*=\s*"(stylesheet|preload)"/i.test(m[0]) && !/fonts\.googleapis\.com/i.test(m[0])) {
      offenders.push(`<link rel=stylesheet/preload> local: ${m[0]}`);
    }
  }
  for (const m of SRC().matchAll(/<(?:img|image|iframe|video|audio|object|embed)\b[^>]*>/gi)) {
    offenders.push(`recurso incrustable no permitido: ${m[0]}`);
  }
  if (/@import\b/i.test(styleBlocks(SRC()).join('\n'))) {
    offenders.push('@import en el CSS: abriria una dependencia externa fuera de la permitida');
  }
  assert.deepEqual(offenders, [], `empaquetado roto:\n${offenders.join('\n')}`);
});

test('empaquetado · sin referencias a tests/ ni a rutas absolutas de maquina', () => {
  assert.equal(/\btests?\//i.test(SRC()), false, 'index.html nunca referencia tests/ (ADR-004)');
  assert.equal(/file:\/\//i.test(SRC()), false, 'no hay URLs file://');
  assert.equal(/\/Users\//.test(SRC()), false, 'no hay rutas absolutas del entorno');
  assert.equal(
    /<base\b/i.test(SRC()),
    false,
    'sin <base>: el sitio debe funcionar servido desde un subpath de GitHub Pages'
  );
});

test('empaquetado · CSS y JS inline, sin assets binarios', () => {
  assert.equal(styleBlocks(SRC()).length, 1, 'un unico bloque <style>');
  assert.equal(countInlineScripts(SRC()), 1, 'un unico <script> inline (el de <head>)');
  assert.ok(headScript(SRC()).length > 0, 'el script inline no puede estar vacio');
  assert.equal(/<script\b[^>]*src=/i.test(SRC()), false, 'ningun script externo');
});

function countInlineScripts(doc) {
  return [...doc.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter((m) => !/\bsrc=/i.test(m[1]))
    .length;
}

test('empaquetado · Google Fonts: display=swap y solo las familias usadas', () => {
  const href = googleFontsHref();
  assert.match(href, /display=swap/, 'la fuente debe cargar con display=swap (sin layout shift)');

  const requested = requestedFonts();
  assert.deepEqual(
    [...requested.keys()].sort(),
    [...usedFamilies()].sort(),
    'las familias pedidas deben ser exactamente las usadas por --font-heading/--font-body'
  );

  // 4 familias distintas para 3 perfiles (slate Inter/Inter, rose, mono).
  assert.equal(requested.size, 4);
});

test('empaquetado · Google Fonts: solo los pesos que el CSS usa', () => {
  const requested = requestedFonts();
  const used = usedWeights();

  assert.ok(used.size > 0, 'el CSS debe declarar font-weight en algun sitio');
  for (const w of used) {
    assert.match(w, /^[0-9]{3}$/, `font-weight "${w}" deberia ser numerico (400/600/700)`);
  }

  const requestedFlat = new Set([...requested.values()].flat());
  const unused = [...requestedFlat].filter((w) => !used.has(w));
  assert.deepEqual(unused, [], `pesos pedidos y nunca usados: ${unused.join(', ')}`);

  const missing = [...used].filter((w) => !requestedFlat.has(w));
  assert.deepEqual(missing, [], `pesos usados y nunca pedidos: ${missing.join(', ')}`);

  for (const [family, weights] of requested) {
    assert.ok(weights.length > 0, `${family}: se piden pesos explicitamente`);
    for (const w of weights) {
      assert.match(w, /^[0-9]{3}$/, `${family}: peso no numerico "${w}"`);
    }
  }
});

test('empaquetado · preconnect a fonts.googleapis.com y fonts.gstatic.com', () => {
  const preconnects = [...SRC().matchAll(/<link\b[^>]*rel="preconnect"[^>]*>/gi)].map((m) => m[0]);
  assert.equal(preconnects.length, 2, 'se esperan 2 preconnect');
  assert.equal(
    preconnects.some((l) => /fonts\.googleapis\.com/i.test(l)),
    true,
    'preconnect a fonts.googleapis.com'
  );
  assert.equal(
    preconnects.some((l) => /fonts\.gstatic\.com/i.test(l)),
    true,
    'preconnect a fonts.gstatic.com'
  );
  assert.equal(
    preconnects.filter((l) => /fonts\.gstatic\.com/i.test(l)).every((l) => /crossorigin/i.test(l)),
    true,
    'el preconnect a fonts.gstatic.com necesita crossorigin'
  );
});

test('empaquetado · metadatos basicos de una pagina publicable', () => {
  assert.match(SRC(), /<meta\b[^>]*charset=["']?utf-8/i, 'falta <meta charset="utf-8">');
  assert.match(
    SRC(),
    /<meta\b[^>]*name=["']viewport["'][^>]*width=device-width/i,
    'falta el meta viewport (375px y 1440px)'
  );
  assert.match(SRC(), /<title\b[^>]*>[^<]{4,}<\/title>/i, 'falta un <title> real');
  assert.match(SRC(), /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"]{20,}/i, 'falta meta description');
});

test('empaquetado · la sintaxis del script inline es valida (equivalente a node --check)', () => {
  assert.doesNotThrow(
    () => compileInlineScript(SRC()),
    'el <script> inline de <head> no compila: falla la sintaxis'
  );
});

test('empaquetado · el repo no arrastra assets locales del sitio', () => {
  const siteAssets = readdirSync(new URL('..', import.meta.url)).filter((f) =>
    /\.(css|js|jpg|jpeg|png|gif|svg|webp|woff2?|ttf|otf)$/i.test(f)
  );
  assert.deepEqual(siteAssets, [], `index.html debe ser autocontenido; hay assets sueltos: ${siteAssets.join(', ')}`);
});

test('empaquetado · el corte de Etapa 1 declara 3 skins y 2 modos', () => {
  assert.deepEqual(SKINS, ['slate', 'rose', 'mono']);
  assert.deepEqual(MODES, ['light', 'dark']);
});
