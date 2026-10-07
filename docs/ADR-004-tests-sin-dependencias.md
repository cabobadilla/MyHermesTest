# ADR-004 — Tests con `node --test`, fuera del sitio, sin dependencias

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

El harness exige **TDD (tests primero)** como gate duro G3. Pero el entregable es
una página estática de un solo archivo sin build step. Hay una tensión real:
TDD en HTML/CSS es menos directo que en un lenguaje con unit tests nativos, y no
queremos que la solución al testing contamine el entregable.

Además, el criterio con más valor verificable son las **20 combinaciones de
contraste** (10 pieles × 2 modos), que sí son perfectamente automatizables.

## Decisión

Los tests viven en `tests/`, **fuera del sitio y nunca publicados**, y usan el
**test runner nativo de Node** (`node --test`), con **cero dependencias**.

Qué se cubre automatizado: estructura del HTML, presencia y completitud de los 13
tokens en las 10 pieles × 2 modos, contraste WCAG de las 20 combinaciones, y
ausencia de recursos externos no permitidos.

**El comportamiento real en navegador** (flechas, persistencia, `aria-pressed`)
**no se automatiza** sin dependencias: si no hay un headless disponible, se
declara como **hueco de cobertura** en el reporte de QA en vez de darlo por bueno.

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| Playwright / Puppeteer | Excelente cobertura de comportamiento, pero instala cientos de MB y un navegador para un POC de una página. Desproporcionado |
| `jsdom` para emular el DOM | Dependencia externa + emula mal transiciones y `localStorage` del navegador real; da falsa confianza |
| `axe-core` / `pa11y` | Valiosos, pero agregan dependencias; el contraste se calcula con ~30 líneas propias, sin instalar nada |
| Verificación manual / "lo revisé y se ve bien" | Es exactamente lo que el harness prohíbe: la lectura no es evidencia |
| Servicios de CI externos | Fuera de alcance del POC; el repo es una página estática |

## Consecuencias

**Positivas:**
- Los tests corren con `node --test tests/` en cualquier máquina con Node; nada que instalar
- El entregable sigue siendo **un archivo**, sin contaminarse con la infraestructura de pruebas
- El criterio de mayor riesgo (contraste × 20) queda cubierto de forma **numérica**, no visual

**Negativas / costo asumido:**
- Sin cobertura automatizada de comportamiento real (clicks, persistencia, FOUC)
- Se asume el costo de declarar ese hueco en QA en cada iteración

**Qué se vuelve difícil después de esto:**
- Cuando el producto crezca a algo con lógica real, hará falta un runner de
  navegador. Este ADR se revisaría entonces, no antes.
