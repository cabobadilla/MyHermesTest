# ADR-001 — Pieles token-driven vía atributos en `<html>`

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

La spec pide **un sitio con 10 pieles intercambiables** sobre contenido idéntico,
más modo claro/oscuro por piel (20 combinaciones). Debe ser un solo archivo,
sin build step, servido desde GitHub Pages. Cambiar de piel no puede recargar
la página ni alterar el contenido.

## Decisión

Las pieles se implementan como **bloques de CSS custom properties** seleccionados
por `[data-skin="<id>"]` y `[data-mode="<light|dark>"]` sobre `<html>`. Los
componentes referencian **solo tokens semánticos** (`var(--bg)`, `var(--accent)`…),
nunca colores literales.

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| 10 hojas de estilo + `<link>` intercambiado | Provoca parpadeo (FOUC), requiere 10 archivos, y rompe la regla de "un solo `index.html`" |
| 10 versiones del HTML, una por piel | Duplica contenido 10×; cualquier cambio de copy hay que hacerlo 10 veces. Contradice "contenido idéntico" |
| Duplicar el contenido en el DOM y mostrar/ocultar por piel | Peso de página 10×, contenido leído 10 veces por lectores de pantalla, y el `id` de las secciones se duplica |
| Colores literales con clases utilitarias por piel | Multiplica las clases y hace imposible verificar el contraste de forma sistemática |

## Consecuencias

**Positivas:**
- Cambiar de piel es **un atributo**, no una reconstrucción del DOM → cambio instantáneo
- El contenido existe **una sola vez** en el HTML
- El contraste se puede verificar **programáticamente** leyendo los tokens
- Agregar una piel 11 = un bloque CSS + una entrada en el registro

**Negativas / costo asumido:**
- Todo valor visual debe pasar por el sistema de tokens; un color literal
  "temporal" se convierte en deuda difícil de rastrear
- Requiere disciplina: no hay compilador que impida saltarse el sistema

**Qué se vuelve difícil después de esto:**
- Una piel que necesite **estructura** distinta (no solo color y tipografía).
  Si eso apareciera, habría que abrir el DOM, y este ADR se revisaría.
