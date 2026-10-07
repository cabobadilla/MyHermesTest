/**
 * Demostracion de los bloqueos del Ciclo 2.
 * No modifica nada: solo lee tests/ e index.html y calcula lo que las
 * aserciones congeladasuffed *exigen*.
 */
import { readFileSync } from 'node:fs';
import { SKINS, MODES } from '../tests/dom.mjs';
import vm from 'node:vm';

const N = SKINS.length;
const out = [];
const p = (s) => out.push(s);

p(`SKINS (tests/dom.mjs, congelado) = ${N} pieles -> N x MODES = ${N * MODES.length} combinaciones`);
p(`orden: ${SKINS.join(', ')}`);
p('');

p('[B1] tests/packaging.test.mjs:165  assert.equal(requested.size, 4)');
const tokens = readFileSync(new URL('../tests/tokens.test.mjs', import.meta.url), 'utf8');
const fams = [...tokens.matchAll(/(?:heading|body): '([^']+)'/g)].map((m) => m[1]);
p(`      EXPECTED_FONTS (congelado) exige ${new Set(fams).size} familias distintas:`);
p(`      ${[...new Set(fams)].sort().join(', ')}`);
p(`      packaging.test.mjs:158 exige ademas requested == usedFamilies.`);
p(`      => requested.size debe ser ${new Set(fams).size}, la asercion exige 4. CONTRADICCION INTERNA.`);
p('');

p('[B2] tests/contrast.test.mjs:134  assert.equal(rows.length, 6)');
p(`      rows se construye con un bucle doble SKINS x MODES = ${N} x ${MODES.length} = ${N * MODES.length}.`);
p(`      20 !== 6. INALCANZABLE sin tocar el test.`);
p('');

p('[B3] tests/circular.test.mjs:63  nextIndex(2, N) === 0 con N = SKINS.length');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const src = html.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)[1];
const grab = (name) => {
  const s = src.indexOf(`function ${name}(`);
  const o = src.indexOf('{', s);
  let d = 0;
  for (let i = o; i < src.length; i++) {
    if (src[i] === '{') d++;
    else if (src[i] === '}' && --d === 0) return src.slice(s, i + 1);
  }
};
const nextIndex = vm.runInNewContext(`(${grab('nextIndex')})`);
const prevIndex = vm.runInNewContext(`(${grab('prevIndex')})`);
p(`      nextIndex(2, ${N}) = ${nextIndex(2, N)} (la asercion exige 0)`);
p(`      prevIndex(0, ${N}) = ${prevIndex(0, N)} (la asercion exige 2)`);
p(`      Solo se cumple si N === 3, y N viene de dom.mjs congelado (=${N}).`);
p(`      Igual en circular.test.mjs:69-72, que fija el ciclo [1,2,0] / [2,0,1].`);
p('');

p('[B4] tests/structure.test.mjs:181  contador debe matchear ^\\d{2}\\/3$');
p('      El encargo de este ciclo exige "NN/10 (no NN/3)". CONTRADICCION DIRECTA con la instruccion.');
p('');

p('[B5] tests/structure.test.mjs:164  el selector debe tener exactamente 3 botones [data-skin]');
p('      Un selector de 10 pieles en la barra lo viola; ademas el h1/copy/3-servicios');
p('      del contrato de Etapa 1 no aporta a esta cicla (eso si es negociable).');
p('');

p('[AVISO] tests/circular.test.mjs:280  /skin:\\s*\'(indigo|...|brand)\'/ debe ser false');
p('      Se puede esquivar con { id: \'indigo\' } en vez de skin: \'indigo\'. No bloquea,');
p('      pero condiciona la sintaxis del registro SKINS.');

process.stdout.write(out.join('\n') + '\n');