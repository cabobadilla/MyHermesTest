import assert from 'node:assert/strict';
import vm from 'node:vm';
import { MODES, SKINS } from '../tests/dom.mjs';
import { inlineScript } from '../tests/fixtures.mjs';
const SCRIPT = () => inlineScript();

function extractFunction(name) {
  const start = SCRIPT().indexOf(`function ${name}(`);
  if (start === -1) return `<<MISSING ${name}>>`;
  const open = SCRIPT().indexOf('{', start);
  let depth = 0;
  for (let i = open; i < SCRIPT().length; i++) {
    if (SCRIPT()[i] === '{') depth++;
    else if (SCRIPT()[i] === '}') { depth--; if (depth === 0) return SCRIPT().slice(start, i + 1); }
  }
  return '<<UNCLOSED>>';
}

const ok = (label, fn) => { try { fn(); console.log('PASS  ' + label); } catch (e) { console.log('FAIL  ' + label + '  -> ' + e.message.split('\n')[0]); } };

const N = SKINS.length;
const nextIndex = vm.runInNewContext(`(${extractFunction('nextIndex')})`);
const prevIndex = vm.runInNewContext(`(${extractFunction('prevIndex')})`);

ok('T-5 · puras / sin DOM', () => {
  assert.equal(typeof nextIndex, 'function');
  for (const name of ['document','window','localStorage','querySelector'])
    assert.equal(SCRIPT().slice(SCRIPT().indexOf('function nextIndex(')).includes(name), false, `toca ${name}`);
  assert.equal(nextIndex(2,N), nextIndex(2,N));
  assert.equal(prevIndex(0,N), prevIndex(0,N));
});
ok('T-5 · circular next(2)=0 prev(0)=2', () => {
  assert.equal(nextIndex(2,N),0); assert.equal(prevIndex(0,N),2);
});
ok('T-5 · recorridos', () => {
  assert.deepEqual([0,1,2].map(i=>nextIndex(i,N)),[1,2,0]);
  assert.deepEqual([0,1,2].map(i=>prevIndex(i,N)),[2,0,1]);
});
ok('T-5 · ciclo longitud N (n=1..12)', () => {
  for (let n=1;n<=12;n++){ let i=0; for(let s=0;s<n;s++) i=nextIndex(i,n); assert.equal(i,0);
    let j=0; for(let s=0;s<n;s++) j=prevIndex(j,n); assert.equal(j,0);
    assert.equal(nextIndex(n-1,n),0); assert.equal(prevIndex(0,n),n-1); }
});
ok('CONTRATO DEL BRIEF · nextIndex(0,0) / prevIndex(0,0) no NaN', () => {
  assert.equal(nextIndex(0,0), 0); assert.equal(prevIndex(0,0), 0);
});

// --- arranque (stubs del propio test) ---
function makeStore(initial={}) { const map=new Map(Object.entries(initial)); return {
  getItem:(k)=>(map.has(k)?map.get(k):null), setItem:(k,v)=>map.set(k,String(v)),
  removeItem:(k)=>map.delete(k), _map:map }; }
function runScript({store,prefersDark=false,failWrites=false}={}) {
  const localStorage=makeStore(store);
  if(failWrites) localStorage.setItem=()=>{throw new Error('SecurityError');};
  const attrs={},listeners={};
  const sandbox={console,Math,Object,Array,String,Number,JSON,RegExp,Error,localStorage,
    matchMedia:(q)=>({media:q,matches:prefersDark&&/dark/.test(q)}),
    document:{readyState:'loading',documentElement:{setAttribute:(k,v)=>{attrs[k]=v;},getAttribute:(k)=>(k in attrs?attrs[k]:null)},
      addEventListener:(t,fn)=>{listeners[t]=fn;},getElementById:()=>null,querySelectorAll:()=>[]}};
  sandbox.window=sandbox; sandbox.globalThis=sandbox;
  vm.createContext(sandbox); new vm.Script(SCRIPT()).runInContext(sandbox);
  return {sandbox,attrs,listeners,localStorage};
}
ok('T-7 · arranque: data-skin=slate, data-mode=light', () => {
  const {attrs}=runScript(); assert.equal(attrs['data-skin'],'slate'); assert.equal(attrs['data-mode'],'light');
});
ok('T-7 · restauracion + skin corrupta al default', () => {
  const r=runScript({store:{'mht.skin':'rose','mht.mode':'dark'}});
  assert.equal(r.attrs['data-skin'],'rose'); assert.equal(r.attrs['data-mode'],'dark');
  for (const bad of ['neon','','ROSE','SLATE','{"x":1}','__proto__','undefined'])
    assert.equal(runScript({store:{'mht.skin':bad}}).attrs['data-skin'],'slate',`"${bad}"`);
});
ok('T-7 · modo sin eleccion respeta prefers-color-scheme', () => {
  assert.equal(runScript({prefersDark:true}).attrs['data-mode'],'dark');
  assert.equal(runScript({prefersDark:false}).attrs['data-mode'],'light');
});
ok('T-7 · modo guardado manda; corrupto cae al sistema', () => {
  assert.equal(runScript({store:{'mht.mode':'light'},prefersDark:true}).attrs['data-mode'],'light');
  for (const bad of ['auto','','DARK','null'])
    assert.equal(runScript({store:{'mht.mode':bad},prefersDark:true}).attrs['data-mode'],'dark',`"${bad}"`);
});
ok('T-7 · writeStore/readStore con try/catch (regex \\n {2}})', () => {
  const src=/function writeStore\(([\s\S]*?)\n {2}\}/.exec(SCRIPT());
  assert.ok(src,'debe existir function writeStore(...)');
  assert.match(src[0],/try\s*{/); assert.match(src[0],/catch\s*\(/); assert.match(src[0],/localStorage\.setItem/);
  const read=/function readStore\(([\s\S]*?)\n {2}\}/.exec(SCRIPT());
  assert.ok(read,'debe existir function readStore(...)');
  assert.match(read[0],/try\s*{/); assert.match(read[0],/catch\s*\(/);
});
ok('T-7 · almacenamiento bloqueado no rompe', () => {
  const {attrs}=runScript({failWrites:true,store:{'mht.skin':'mono'}});
  assert.equal(attrs['data-skin'],'mono'); assert.ok('data-mode' in attrs);
});
ok('T-7 · modo privado completo no lanza', () => {
  const s={console,Math,Object,Array,String,Number,JSON,RegExp,Error,
    localStorage:{getItem(){throw new Error('SecurityError');},setItem(){throw new Error('SecurityError');}},
    matchMedia:()=>({matches:false}),
    document:{readyState:'loading',documentElement:{setAttribute(){},getAttribute:()=>null},
      addEventListener(){},getElementById:()=>null,querySelectorAll:()=>[]}};
  s.window=s; vm.createContext(s);
  assert.doesNotThrow(()=>new vm.Script(SCRIPT()).runInContext(s));
});
ok('T-7 · claves del contrato', () => {
  assert.match(SCRIPT(),/'mht\.skin'/); assert.match(SCRIPT(),/'mht\.mode'/);
});
ok('T-7 · corte Etapa 1: 3 skins, 2 modos, sin Etapa 2', () => {
  for (const sk of SKINS) assert.ok(SCRIPT().includes(sk), sk);
  for (const mo of MODES) assert.ok(SCRIPT().includes(mo), mo);
  assert.equal(/skin:\s*'(indigo|emerald|amber|violet|teal|cyan|zinc|brand)'/.test(SCRIPT()),false);
});
