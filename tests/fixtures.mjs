/**
 * Fixtures compartidas: cargan index.html perezosamente para que un entregable
 * ausente produzca un fallo POR TEST (RED legible) y no un abort de modulo.
 */

import { css, doc, headScript } from './dom.mjs';

export function html() {
  return doc();
}

export function sheet() {
  return css(doc());
}

export function inlineScript() {
  return headScript(doc());
}
