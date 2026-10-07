# ADR-004 — Tests con `node --test`, fuera del sitio, sin dependencias

- **Fecha:** 2026-10-07
- **Estado:** **revisado** — la premisa del "no se puede" era falsa (ver Revisión)
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

## Revisión (2026-10-07 · tras la primera corrida de QA aislado)

**El hueco que este ADR declaró no era inevitable. Se apoyaba en una premisa que
nadie comprobó.**

El texto original decía *"si no hay un headless disponible, se declara como hueco"*.
**Chrome 154 estaba instalado en la máquina**:

```
$ ls -d "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
$ "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version
Google Chrome 154.0.8037.98
```

El QA aislado lo manejó por **CDP (Chrome DevTools Protocol)** **sin instalar nada**,
y verificó en navegador real lo que este ADR daba por imposible: clicks en el
selector y en las flechas, teclado, persistencia tras recarga, `aria-pressed`,
`prefers-reduced-motion`, Google Fonts bloqueado y el layout a 320/375/1440.

**Qué queda en pie de la decisión:** el runner `node --test` sin dependencias sigue
siendo la base, y el entregable sigue sin contaminarse. Eso no cambia.

**Qué se corrige:**

| Lo que decía | Lo que es |
|---|---|
| "El comportamiento real en navegador no se automatiza sin dependencias" | **Falso.** Chrome ya estaba instalado; CDP lo maneja sin instalar nada |
| "Si no hay headless, se declara como hueco" | Un hueco **declarado sin comprobar la premisa** es un hueco **inventado** |
| Playwright/Puppeteer "instala cientos de MB" | Cierto para esos paquetes — pero **no hace falta ninguno**: el navegador estaba ahí |

**La lección (aprendizaje #21 del harness).** Una premisa de *"no se puede"* es una
afirmación técnica y **se verifica como cualquier otra**. Este ADR se disfrazó de
rigor: declaró un límite del entorno sin comprobarlo, y el límite se heredó después
como si fuera un hecho. El costo no fue teórico — **por ese hueco pasó desapercibido
un bug de severidad alta** que rompe el requerimiento original en móvil (ver H-1 en
`06-QA-REPORT.md`).

**Estado del hueco ahora:** la cobertura de comportamiento en navegador **es
posible** y debería incorporarse a la estrategia de pruebas. Queda como el primer
candidato del próximo ciclo.

---

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
