# 06 — QA Report

> Fase 5. Dueño: **QA (Hermes, contexto aislado)**.
> **Este reporte se llena ejecutando, no leyendo.**
> El resumen del Coder nunca es evidencia válida.

- **Proyecto:** MyHermesTest
- **Fecha:** 2026-10-07
- **Ciclo:** 2 — las 10 pieles
- **Verificado contra:** `03-DEFINICION.md` (HU-1..HU-5) y `ADR-001..004`
- **Commit verificado:** `main` @ `1634718`
- **Ejecutado por:** subagente en **contexto aislado** — sin acceso a la
  conversación, al reporte del Coder ni a `estado.json`. Veía la spec y el
  artefacto, nada más.

## Nota de método: por qué esta corrida existe

La suite (`79/79`) la escribió **quien antes verificaba**. Verificar el producto
con los tests propios es preguntarle al sospechoso. Esta corrida rompe esa
circularidad: un verificador que **no comparte contexto** con el autor.

Su aporte **no** es re-correr la suite —eso da la misma respuesta y ya se hizo—.
Su aporte son **los criterios sin cobertura** y **los huecos declarados**.

## Resultado por criterio de aceptación

| HU | Criterio | Veredicto | Evidencia |
|---|---|---|---|
| HU-1 | 6 secciones en orden | ✅ | `✔ HU-1 · las 6 secciones aparecen exactamente y en orden` |
| HU-1 | Hero sin "Hello World", propuesta de una frase | ✅ | dos tests de estructura |
| HU-1 | 3 servicios con título y descripción | ✅ | `✔ …hay exactamente 3 servicios…` |
| HU-1 | 3–4 pasos numerados | ✅ | `✔ …el metodo tiene 3 o 4 pasos numerados` |
| HU-2 | Barra fija con marca, selector y contador | ⚠️ parcial | presencia verificada; **ningún test comprueba `position:fixed`** |
| HU-2 | Elegir piel re-tematiza todo, sin recargar | ✅ navegador | `7-contenido-igual {"equal":true,…,"skinNow":"violet"}` |
| HU-2 | Contador en posición correcta | ✅ navegador | `3-next {"skin":"indigo","counter":"02/10"}` |
| HU-2 | `aria-pressed` en el control activo | ⚠️ parcial | `pressed:["indigo"]` — pero **H-3** |
| HU-3 | Dos flechas ← y → | ✅ | `assert arrows.length===2` |
| HU-3 | → avanza / ← retrocede | ✅ navegador | `3-prev {"skin":"slate","counter":"01/10"}` |
| HU-3 | Circular: primera+← → `10/10`, última+→ → `01/10` | ✅ navegador | `4-desde-ultima+next {"skin":"slate","counter":"01/10"}` |
| HU-3 | Teclado ← / → | ✅ navegador | `5-keyboard {"skin":"indigo","counter":"02/10"}` |
| HU-4 | Oscuro = variante oscura de esa misma piel | ✅ navegador | `6-toggle {"mode":"dark","skin":"slate"}` |
| HU-4 | El oscuro se mantiene al cambiar de piel | ✅ navegador | `6-cambio-piel-en-dark {"skin":"indigo","mode":"dark"}` |
| HU-4 | Modo inicial respeta `prefers-color-scheme` | ✅ | `✔ T-7 · …respeta prefers-color-scheme` |
| HU-4 | 20 combinaciones cumplen AA | ✅ | 20 tests + **recálculo independiente en Python**: `FALLOS AA: NINGUNO (20/20)` |
| HU-5 | Recargar restaura piel y modo | ✅ navegador | `8-restaurado {"skin":"rose","mode":"dark","counter":"05/10"}` |
| HU-5 | Sin parpadeo antes del primer render | ⚠️ parcial | atributos fijados a ~3.3 ms en `<head>`; **no hay medición de primer paint** |
| **DoD** | **Responsive correcto en 375px** | ❌ **FALLA** | **H-1** |

## Matriz de cobertura  ⭐ lo más valioso de este reporte

**Criterios de aceptación SIN ningún test ejecutable que los cubra:**

| Criterio sin cobertura | Test más cercano | Qué NO verifica |
|---|---|---|
| HU-2 · elegir piel re-tematiza sin recargar | `structure.test.mjs` (presencia) | **no ejecuta ningún click** |
| HU-2 · contador se posiciona bien | ninguno (solo formato estático) | la **actualización** del contador |
| HU-2 · `aria-pressed` del activo | `structure.test.mjs` (estado inicial) | la **transición** al cambiar |
| HU-2 · barra `position:fixed` | ninguno | nada comprueba `position:fixed` |
| HU-3 · flecha → avanza | `structure.test.mjs` (CSS presente) | **no hay click** |
| HU-3 · flecha ← retrocede | ídem | ídem |
| HU-3 · teclado ← / → | **ninguno** | no existe test de `keydown` |
| HU-4 · oscuro cambia la piel actual | ninguno | nada ejecuta `applyMode` |
| HU-4 · el oscuro se mantiene al cambiar piel | ninguno | no cubierto |
| HU-5 · sin parpadeo | `circular.test.mjs` (en `node:vm`) | fija atributos; **no el timing de paint** |
| **Responsive 375 / 1440** | **ninguno** | **cero cobertura** ← acá vive H-1 |

**Once criterios de aceptación sin un solo test que los verifique.** La suite corre
en `node:vm` sobre el HTML y el script: **nadie ejecuta el controlador.** Verifica
que exista el CSS que *haría* la transición — no que la transición ocurra.

> **Nota de circularidad.** Los 20 tests de contraste usan la **calculadora del
> propio proyecto** (`tests/contrast.mjs`). Se recalcularon con una implementación
> WCAG independiente en Python → 20/20 confirmados. Ese criterio pasa de
> "coherente con quien escribió los tests" a **verificado**.

> **`check-coverage.sh` no puede correr:** este proyecto se diseñó **antes de
> v0.13**, así que `04-DISENO.md` **no tiene matriz de casos** con IDs. La
> cobertura de arriba se reconstruyó a mano desde los criterios de la fase 3 — que
> es exactamente el trabajo que la matriz debería haber hecho mecánico.

## Casos borde y de error (ejecutados, no asumidos)

| Caso | Resultado real | Veredicto |
|---|---|---|
| `localStorage` vacío | `skina=slate mode=light contador=01/10` | ✅ |
| `localStorage` bloqueado (privado) | `skina=slate`, y navega igual: `indigo 02/10` | ✅ |
| `localStorage` corrupto (`"neon"`, `"ROSE"`, `"__proto__"`, JSON) | cae al default `slate` | ✅ |
| URL con basura (`?x=<garbage>&foo=%FF%FE&&`) | HTTP 200, **mismo sha256** — la página no lee `location` | ✅ |
| Circularidad en navegador real | `primera+← → mono 10/10` · `última+→ → slate 01/10` | ✅ |
| Contador a lo largo del recorrido | `01/10`→`02/10`→…→`10/10` | ✅ |
| Tecla no mapeada (`"a"`) | sin cambio | ✅ |
| `prefers-reduced-motion: reduce` | `{"animName":"none","animDur":"0s"}` | ✅ |
| Google Fonts bloqueado | sigue legible: `{"h1":"Consultoría agéntica","loadedFonts":0}` | ✅ |
| **375px / 320px** | **ver H-1** | ❌ |

## Hallazgos

### H-1 — ALTA · El selector de piel desborda en móvil y deja botones inalcanzables

- **Reproducción:** abrir `https://cabobadilla.github.io/MyHermesTest/` a 375px.
- **Observado:**
  ```
  375px → fuera de pantalla: Pizarra, Índigo, Esmeralda, Cian, Cinc, Mono   (6/10)
  320px → fuera de pantalla: 7/10
  .bar__group {left:-168, right:543, w:711} con vw=375 → overflows:true
  ```
- **Esperado:** `03-DEFINICION` §Casos borde — *"Ancho 375px → Barra superior
  usable, sin desbordamiento horizontal"*; DoD *"Responsive correcto en 375px"*.
- **Causa (verificada de forma independiente por lectura del CSS):**
  `.bar__inner` tiene `flex-wrap: wrap`, pero **`.bar__group` no** — y es un
  flex-item cuyo contenido (10 botones) mide ~711px, así que envolver no lo parte.
- **Por qué asciende en silencio:** `.bar` es `position:fixed`, así que el desborde
  **no genera scrollbar de documento**. No se ve roto: simplemente 6 pieles no están.
- **Impacto:** el requerimiento original del usuario —*10 pieles "para poder
  escoger"*— **no se cumple en móvil**.
- **Cobertura:** **ningún test lo cubre.**

### H-2 — MEDIA · Scrollbar horizontal transitoria en cada carga

- **Observado** a 1440px: `{"scrollW":1480,"clientW":1440}` inmediato →
  `{"scrollW":1440}` tras 900 ms.
- **Causa:** `init()` llama siempre `applySkin(current, false)`, que aplica
  `translateX(2.5rem)` a todo el `<main>`. Se corrige en 0.4 s, pero es un parpadeo
  de scrollbar en **cada** carga. No cubierto por tests.

### H-3 — BAJA · ARIA inválida: `<html>` recibe `aria-pressed="true"`

- **Observado:** `htmlAriaPressed:"true"` en navegador real.
- **Causa (verificada de forma independiente):** `index.html:94`
  `document.querySelectorAll('[data-skin]')` — ese selector **también matchea
  `<html data-skin="…">`**, así que el bucle escribe `aria-pressed` en el `<html>`.
- Contradice el criterio de que *solo* el control del selector quede seleccionado.
- **Cobertura:** los tests cuentan solo `button[data-skin]`, así que no lo ven.

## Precisión sobre las ADR

**`ADR-004` se apoya en una premisa falsa.** Decidió no automatizar el navegador
para no instalar cientos de MB, y cerró con *"si no hay headless disponible, QA debe
declararlo como hueco"*. **Chrome 154 está instalado en la máquina**
(`/Applications/Google Chrome.app/…`), y esta verificación lo manejó por CDP **sin
instalar nada**. El hueco no era inevitable: se declaró a partir de una premisa que
nadie comprobó.

## Lo que NO se probó

- **FOUC a nivel de píxel/primer paint.** No medible de forma honesta headless sin
  instrumentar el compositor. Evidencia indirecta fuerte: el script está en `<head>`
  y fija los atributos a ~3.3 ms. `performance.getEntriesByType('paint')` devolvió
  `[]`.
- **`position:fixed` "visible al hacer scroll".** Solo inferido de CSS; sin scroll
  real de píxeles.
- **Cuadros intermedios de las transiciones CSS.** Se verificó que la clase y el
  `animation-name` se aplican y que `reduce` las desactiva; **no** la suavidad.
- **Apariencia visual real de cada piel/tipografía.** Sin capturas de las 20
  combinaciones ni verificación de renderizado tipográfico por piel.
- **Accesibilidad más allá de contraste y `aria-pressed`.** Sin auditoría axe/pa11y
  (ADR-004 la excluye): foco visible, orden de tabulación, lectores de pantalla,
  `aria-live` del contador — **no probados**.
- **Interacción táctil real** (tap vs click) y **rendimiento**.
- **Vistas intermedias** (768px) y orientación landscape.
- **Persistencia multi-pestaña.**
- **Otros motores** (Firefox/Safari): todo en Chromium 154.
- **Límites de artefacto:** `#hash` a sección inexistente; `localStorage` con cuota
  llena en escritura parcial.

## Veredicto final

- [ ] Aprobado
- [x] **Aprobado con observaciones** — los criterios funcionales pasan, verificados
      también en navegador real; pero el criterio de borde **375px está en rojo
      (H-1, ALTA)** y H-2/H-3 no tienen cobertura.
- [ ] Rechazado

**Justificación:** el contrato no puede declararse terminado mientras el DoD
*"Responsive correcto en 375px"* esté en rojo. **No se corrigen en esta corrida** —
el propósito de este ciclo es el proceso, no el producto: H-1/H-2/H-3 quedan
registrados como **hallazgos abiertos** y son los primeros candidatos de un próximo
ciclo.

---

**Gate G5:** cada veredicto trae comando y salida real. Sin evidencia ejecutable,
este reporte es inválido.

**Artefactos del QA:** `tests/.tmp/` — `harness.mjs`, `cdp.mjs`…`cdp5.mjs`,
`pub*.html`. **Nada del proyecto fue modificado.**
