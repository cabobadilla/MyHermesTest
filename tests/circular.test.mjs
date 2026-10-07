/**
 * T-7 — Aritmetica de la navegacion circular (HU-3).
 *
 * El indice circular se extrae como FUNCION PURA del <script> inline, de modo
 * que el test la llama sin DOM: next(2) === 0 y prev(0) === 2 sobre 3 skins.
 * El registro de pieles y el arranque anti-FOUC se ejercitan en un `node:vm`
 * con un stub minimo de localStorage / document (sin jsdom, sin dependencias).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';

import { MODES, SKINS } from './dom.mjs';
import { inlineScript as SCRIPT } from './fixtures.mjs';



/**
 * Extrae del <script> inline el cuerpo de una funcion nombrada por balance de
 * llaves. Devuelve codigo ejecutable, sin ninguna dependencia del DOM.
 */
function extractFunction(name) {
  const start = SCRIPT().indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `el script inline debe definir function ${name}(...)`);

  const open = SCRIPT().indexOf('{', start);
  let depth = 0;
  for (let i = open; i < SCRIPT().length; i++) {
    if (SCRIPT()[i] === '{') depth++;
    else if (SCRIPT()[i] === '}') {
      depth--;
      if (depth === 0) {
        return SCRIPT().slice(start, i + 1);
      }
    }
  }
  throw new Error(`no se pudo cerrar function ${name}(...) en el script inline`);
}

const N = SKINS.length; // 3 skins en la Etapa 1

const nextIndex = vm.runInNewContext(`(${extractFunction('nextIndex')})`);
const prevIndex = vm.runInNewContext(`(${extractFunction('prevIndex')})`);

test('T-5 · el indice circular es una funcion pura, sin DOM', () => {
  assert.equal(typeof nextIndex, 'function', 'nextIndex debe ser una funcion');
  assert.equal(typeof prevIndex, 'function', 'prevIndex debe ser una funcion');

  for (const name of ['document', 'window', 'localStorage', 'querySelector']) {
    assert.equal(
      SCRIPT().slice(SCRIPT().indexOf('function nextIndex(')).includes(name),
      false,
      `las funciones de indice no deben tocar "${name}"`
    );
  }

  // Mismo input, mismo output, sin estado: es pura.
  assert.equal(nextIndex(2, N), nextIndex(2, N));
  assert.equal(prevIndex(0, N), prevIndex(0, N));
});

test('T-5 · la navegacion es circular: next(2) === 0 y prev(0) === 2', () => {
  assert.equal(nextIndex(2, N), 0, 'desde la ultima piel, la flecha derecha vuelve a la primera');
  assert.equal(prevIndex(0, N), 2, 'desde la primera piel, la flecha izquierda salta a la ultima');
});

test('T-5 · next recorre 0 -> 1 -> 2 -> 0 y prev recorre 0 -> 2 -> 1 -> 0', () => {
  const forward = [0, 1, 2].map((i) => nextIndex(i, N));
  assert.deepEqual(forward, [1, 2, 0]);
  const backward = [0, 1, 2].map((i) => prevIndex(i, N));
  assert.deepEqual(backward, [2, 0, 1]);
});

test('T-5 · con N skins el ciclo tiene longitud N (sin_ELEMENTos fijados)', () => {
  for (let n = 1; n <= 12; n++) {
    let i = 0;
    for (let step = 0; step < n; step++) i = nextIndex(i, n);
    assert.equal(i, 0, `con n=${n} la vuelta completa no vuelve al inicio`);

    let j = 0;
    for (let step = 0; step < n; step++) j = prevIndex(j, n);
    assert.equal(j, 0, `con n=${n} la vuelta completa inversa no vuelve al inicio`);

    assert.equal(nextIndex(n - 1, n), 0, `nextIndex(${n - 1}, ${n}) debe ser 0`);
    assert.equal(prevIndex(0, n), n - 1, `prevIndex(0, ${n}) debe ser ${n - 1}`);
  }
});

/* ------------------------------------------------------------------ */
/* Registro de pieles + arranque, en un vm con stubs minimos           */
/* ------------------------------------------------------------------ */

function makeStore(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

function runScript({ store, prefersDark = false, failWrites = false } = {}) {
  const localStorage = makeStore(store);
  if (failWrites) {
    localStorage.setItem = () => {
      throw new Error('SecurityError: almacenamiento bloqueado');
    };
  }

  const attrs = {};
  const listeners = {};
  const sandbox = {
    console,
    Math,
    Object,
    Array,
    String,
    Number,
    JSON,
    RegExp,
    Error,
    localStorage,
    matchMedia: (query) => ({ media: query, matches: prefersDark && /dark/.test(query) }),
    document: {
      readyState: 'loading',
      documentElement: {
        setAttribute: (k, v) => {
          attrs[k] = v;
        },
        getAttribute: (k) => (k in attrs ? attrs[k] : null),
      },
      addEventListener: (type, fn) => {
        listeners[type] = fn;
      },
      getElementById: () => null,
      querySelectorAll: () => [],
    },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;

  vm.createContext(sandbox);
  new vm.Script(SCRIPT()).runInContext(sandbox);
  return { sandbox, attrs, listeners, localStorage };
}

/** API publica que el shell expone para el controlador y para inspeccion. */
const api = vm.runInNewContext(
  `(${extractFunction('nextIndex')}); (${extractFunction('prevIndex')});` +
    `(${extractFunction('indexOfSkin')});` +
    `(${extractFunction('resolveSkin')});` +
    `(${extractFunction('resolveMode')});` +
    `({ nextIndex, prevIndex, indexOfSkin, resolveSkin, resolveMode })`
);

test('T-7 · indexOfSkin valida contra el registro y devuelve -1 si no existe', () => {
  // El registro vive en el script; se comprueba por comportamiento.
  const src = /var SKINS = \[([\s\S]*?)\];/.exec(SCRIPT());
  assert.ok(src, 'el script inline debe declarar el registro SKINS');
  const ids = [...src[1].matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids, SKINS, 'el registro debe declarar slate, rose, mono en ese orden');
});

test('T-7 · el registro de pieles existe y esta en orden de navegacion', () => {
  const m = /var SKINS = \[([\s\S]*?)\];/.exec(SCRIPT());
  const ids = [...m[1].matchAll(/id:\s*'([^']+)'/g)].map((x) => x[1]);
  assert.deepEqual(ids, SKINS, 'orden de navegacion: slate, rose, mono');
  assert.equal(ids.length, 3, 'la Etapa 1 activa exactamente 3 skins');
});

test('T-7 · <html> recibe data-skin y data-mode antes del primer paint', () => {
  const { attrs } = runScript();
  assert.equal(attrs['data-skin'], 'slate', 'data-skin por defecto = primera piel del registro');
  assert.equal(attrs['data-mode'], 'light', 'data-mode por defecto si prefers-color-scheme no es dark');
  assert.ok('data-skin' in attrs && 'data-mode' in attrs, '<html> siempre lleva ambos atributos');
});

test('T-7 · skin guardada se restaura; si es invalida se cae al default', () => {
  const restored = runScript({ store: { 'mht.skin': 'rose', 'mht.mode': 'dark' } });
  assert.equal(restored.attrs['data-skin'], 'rose');
  assert.equal(restored.attrs['data-mode'], 'dark');

  for (const bad of ['neon', '', 'ROSE', 'SLATE', '{"x":1}', '__proto__', 'undefined']) {
    const r = runScript({ store: { 'mht.skin': bad } });
    assert.equal(r.attrs['data-skin'], 'slate', `un skin corrupto ("${bad}") debe caer al default`);
  }
});

test('T-7 · modo sin eleccion previa respeta prefers-color-scheme', () => {
  assert.equal(runScript({ prefersDark: true }).attrs['data-mode'], 'dark');
  assert.equal(runScript({ prefersDark: false }).attrs['data-mode'], 'light');
});

test('T-7 · modo guardado manda sobre prefers-color-scheme', () => {
  assert.equal(
    runScript({ store: { 'mht.mode': 'light' }, prefersDark: true }).attrs['data-mode'],
    'light',
    'una eleccion explicita prevalece sobre la preferencia del sistema'
  );
  for (const bad of ['auto', '', 'DARK', 'null']) {
    assert.equal(
      runScript({ store: { 'mht.mode': bad }, prefersDark: true }).attrs['data-mode'],
      'dark',
      `un modo corrupto ("${bad}") debe caer a prefers-color-scheme`
    );
  }
});

test('T-7 · las escrituras a localStorage van dentro de try/catch', () => {
  const src = /function writeStore\(([\s\S]*?)\n {2}\}/.exec(SCRIPT());
  assert.ok(src, 'debe existir function writeStore(...)');
  assert.match(src[0], /try\s*{/, 'writeStore debe envolver la escritura en try');
  assert.match(src[0], /catch\s*\(/, 'writeStore debe tener catch');
  assert.match(src[0], /localStorage\.setItem/, 'writeStore debe escribir en localStorage');

  const read = /function readStore\(([\s\S]*?)\n {2}\}/.exec(SCRIPT());
  assert.ok(read, 'debe existir function readStore(...)');
  assert.match(read[0], /try\s*{/, 'readStore debe envolver la lectura en try');
  assert.match(read[0], /catch\s*\(/, 'readStore debe tener catch');
});

test('T-7 · con almacenamiento bloqueado la pagina sigue funcionando', () => {
  const { attrs } = runScript({ failWrites: true, store: { 'mht.skin': 'mono' } });
  assert.equal(attrs['data-skin'], 'mono', 'la lectura sigue funcionando');
  assert.ok('data-mode' in attrs, 'el modo tambien se resuelve sin persistencia');
});

test('T-7 · modo privado: getItem tambien puede lanzar y no rompe', () => {
  const sandboxSand = {
    console, Math, Object, Array, String, Number, JSON, RegExp, Error,
    localStorage: {
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('SecurityError');
      },
    },
    matchMedia: () => ({ matches: false }),
    document: {
      readyState: 'loading',
      documentElement: { setAttribute() {}, getAttribute: () => null },
      addEventListener() {},
      getElementById: () => null,
      querySelectorAll: () => [],
    },
  };
  sandboxSand.window = sandboxSand;
  vm.createContext(sandboxSand);
  assert.doesNotThrow(
    () => new vm.Script(SCRIPT()).runInContext(sandboxSand),
    'el arranque no debe lanzar si localStorage esta bloqueado por completo'
  );
});

test('T-7 · el script declara las claves de almacenamiento del contrato', () => {
  assert.match(SCRIPT(), /'mht\.skin'/, 'clave de piel: mht.skin');
  assert.match(SCRIPT(), /'mht\.mode'/, 'clave de modo: mht.mode');
});

test('T-7 · el script usa los 3 skins y los 2 modos del corte de Etapa 1', () => {
  for (const skin of SKINS) assert.ok(SCRIPT().includes(skin), `el script debe conocer "${skin}"`);
  for (const mode of MODES) assert.ok(SCRIPT().includes(mode), `el script debe conocer "${mode}"`);
  assert.equal(
    /skin:\s*'(indigo|emerald|amber|violet|teal|cyan|zinc|brand)'/.test(SCRIPT()),
    false,
    'no se deben registrar las 7 pieles de la Etapa 2 ni una piel de marca'
  );
});
