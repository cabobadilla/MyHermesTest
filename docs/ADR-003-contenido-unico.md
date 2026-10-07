# ADR-003 — Contenido escrito una vez, pieles solo visuales

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

La definición aprobada fija: **contenido idéntico en las 10 pieles**, sin piel
"de marca" por defecto. Solo cambia la capa visual (paleta + tipografía). Hay que
decidir si el contenido vive una vez o una vez por piel, y qué se puede
personalizar por piel.

## Decisión

El contenido de la landing (hero, servicios, método, CTA, footer) se escribe
**una sola vez** en el HTML. La única variable por piel, además de los tokens de
color, es la **familia tipográfica** (`--font-heading`, `--font-body`).

Ni el copy, ni el orden, ni la estructura cambian entre pieles.

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| Un bloque de contenido por piel (10×) | Duplica el mantenimiento y contradice "contenido idéntico". Un cambio de copy habría que hacerlo 10 veces |
| Contenido generado por JS desde un objeto de datos | Añade complejidad y rompe la semántica inicial (el HTML llegaría vacío); peor para accesibilidad y para inspección |
| Permitir pequeños cambios de copy según la piel | Difumina el experimento: ya no se compara el *estilo*, se comparan dos variables a la vez |

## Consecuencias

**Positivas:**
- Un solo lugar donde editar el contenido
- La comparación entre pieles es **limpia**: cambia una variable, no dos
- El HTML es estático y legible sin ejecutar JS (salvo los controles)

**Negativas / costo asumido:**
- Se renuncia a "adaptar el tono a la marca" por piel — aceptado a propósito
- Los nombres de las 10 pieles se usan como **etiquetas del experimento**, no
  como marcas reales de la consultora

**Qué se vuelve difícil después de esto:**
- Si más adelante se quiere que cada piel traiga su propio copy, la estructura
  actual no lo soporta y este ADR tendría que revisarse.
