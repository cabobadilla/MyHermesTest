import { pairsFor, ratio2, contrastRatio, relativeLuminance } from '../tests/contrast.mjs';

const P = {
  'slate/light': { bg: '#f6f7f9', surface: '#ffffff', 'surface-2': '#eef1f5', text: '#16191f', muted: '#565d6b', accent: '#1f5fbf', 'on-accent': '#ffffff' },
  'slate/dark': { bg: '#0f1216', surface: '#171b21', 'surface-2': '#1f242b', text: '#e8eaee', muted: '#a3abb8', accent: '#7aa8ff', 'on-accent': '#0d1117' },
  'rose/light': { bg: '#fdf7f5', surface: '#ffffff', 'surface-2': '#f7ebe7', text: '#2a1712', muted: '#6b4b43', accent: '#b02e4a', 'on-accent': '#ffffff' },
  'rose/dark': { bg: '#17100f', surface: '#1f1615', 'surface-2': '#2a1d1b', text: '#f6ecea', muted: '#c9a79f', accent: '#ff8fa3', 'on-accent': '#1a0d10' },
  'mono/light': { bg: '#f7f7f5', surface: '#ffffff', 'surface-2': '#efefeb', text: '#1b1b18', muted: '#5c5c54', accent: '#2f6b4f', 'on-accent': '#ffffff' },
  'mono/dark': { bg: '#101110', surface: '#181a19', 'surface-2': '#212423', text: '#eeeeea', muted: '#a9aca4', accent: '#7fc8a0', 'on-accent': '#0c110d' },
};

let bad = 0;
const T = {};
for (const [key, raw] of Object.entries(P)) {
  T[key] = Object.fromEntries(Object.entries(raw).map(([k, v]) => ['--' + k, v]));
}
const P2 = T;

for (const [key, t] of Object.entries(P2)) {
  const [skin, mode] = key.split('/');
  const checks = pairsFor(t, skin, mode);
  for (const c of checks) {
    if (!c.pass) { bad++; console.log(`FAIL ${c.label}: ${c.ratio} < ${c.required}`); }
  }
}
for (const [key, t] of Object.entries(P)) {
  const [skin, mode] = key.split('/');
  const b = ratio2(contrastRatio(t.text, t.bg));
  const h = ratio2(contrastRatio(t.accent, t.bg));
  const m = ratio2(contrastRatio(t.muted, t.bg));
  const o = ratio2(contrastRatio(t['on-accent'], t.accent));
  console.log(`${skin.padEnd(6)} ${mode.padEnd(6)} body ${String(b).padStart(6)}:1  heading ${String(h).padStart(6)}:1  muted ${String(m).padStart(6)}:1  on-accent ${String(o).padStart(6)}:1`);
}
console.log(bad === 0 ? 'ALL 6 PASS' : `${bad} failing pairs`);