# 05 — Tareas

> Fase 4 (salida del Arquitecto). Descomposición en unidades ejecutables por el
> Coder. **Una tarea = un ciclo TDD.**

- **Proyecto:** MyHermesTest
- **Fecha:** 2026-10-07
- **Basado en:** `03-DEFINICION.md` + `04-DISENO.md` + `ADR-001..004`

## Reglas

1. Cada tarea es ejecutable de forma **independiente**.
2. Cada tarea apunta a ≥1 criterio de aceptación de `03-DEFINICION.md`.
3. Cada tarea se implementa con **tests primero** (RED → GREEN → REFACTOR).
4. Una tarea a la vez, en el workdir del Coder.
5. Los tests viven en `tests/` y **nunca** se referencian desde `index.html`.

---

### T-1 — Suite de pruebas base

- **Cubre:** infraestructura para todos los criterios (habilita G3)
- **Entrada:** `04-DISENO.md` (contratos), `ADR-004`
- **Salida:** `tests/dom.mjs` (parser mínimo de `index.html`), `tests/contrast.mjs` (calculadora WCAG), `tests/*.test.mjs`
- **Test primero:** no aplica RED aquí — es el andamiaje que permite escribir los RED de las demás tareas
- **Criterio de terminado:** `node --test tests/` corre y **falla** de forma limpia contra un `index.html` inexistente o vacío
- **Nota:** sin dependencias. `tests/` no se publica.

- [ ] `node --test tests/` ejecuta
- [ ] Falla con mensaje claro si `index.html` no existe

---

### T-2 — Estructura de contenido de la landing

- **Cubre:** HU-1 (todas sus variantes)
- **Entrada:** T-1
- **Salida:** secciones en `index.html`: barra, hero, servicios, método, CTA, footer
- **Test primero:** asserts que exigen las 6 secciones en orden, que **no** exista la cadena "Hello World", que haya exactamente **3 servicios** con título+descripción y **3–4 pasos** de método numerados
- **Criterio de terminado:** los tests de estructura pasan; el copy es de consultora agéntica en español

- [ ] Test escrito y **fallando** (RED) — evidencia:
- [ ] Contenido implementado (GREEN)
- [ ] `font-family` con stack de fallback (fuente ausente → legible)
- [ ] Commit

---

### T-3 — Barra superior

- **Cubre:** HU-2 (barra, selector, contador), HU-3 (flechas)
- **Entrada:** T-2
- **Salida:** `<header>` fijo con marca, selector de 10 opciones, toggle de modo, flechas ← → y contador `NN/10`
- **Test primero:** asserts de existencia y estructura: hay `<header>`, 10 opciones en el selector, exactamente 2 botones de flecha con etiqueta accesible, y un nodo de contador
- **Criterio de terminado:** tests pasan; la barra es visible y no desborda a 375px

- [ ] Test escrito y **fallando** (RED) — evidencia:
- [ ] Barra implementada (GREEN)
- [ ] Commit

---

### T-4 — Sistema de tokens y las 3 pieles de la Etapa 1

- **Cubre:** HU-2 (re-tematizado completo), HU-4 (modo por piel), HU-4 (AA)
- **Entrada:** T-3, `ADR-001`, `ADR-003`, **corte en etapas** (`03-DEFINICION.md`)
- **Salida:** bloques `[data-skin="X"][data-mode="Y"]` con los **13 tokens**, para
  las **3 pieles de la Etapa 1**: `slate` (Inter/Inter), `rose` (Playfair
  Display/Inter), `mono` (Libre Baskerville/Source Sans 3)
- **Test primero:** (a) completitud — cada piel define los 13 tokens en ambos
  modos; (b) **contraste — las 6 combinaciones cumplen AA** (cuerpo ≥4.5,
  titulares ≥3); (c) cero colores literales fuera de los bloques de piel
- **Criterio de terminado:** los tres tests pasan; ninguna de las 6 falla contraste
- **Nota:** el test de contraste **debe** fallar antes de escribir las pieles
- **Nota de etapa:** las 7 pieles restantes son **Etapa 2**. El registro de pieles
  y el selector deben declarar las 3 activas; dejar el mecanismo listo para
  sumar más sin tocar nada más.

- [ ] Test de completitud y contraste **fallando** (RED) — evidencia:
- [ ] 3 pieles × 2 modos implementadas (GREEN)
- [ ] Registro y selector coherentes con las 3 pieles activas
- [ ] Commit

---

### T-5 — Controlador

- **Cubre:** HU-2 (contador, `aria-pressed`), HU-3 (avance, retroceso, **circular**, teclado)
- **Entrada:** T-3, T-4
- **Salida:** lógica en el `<script>` del shell
- **Test primero:** **test unitario del índice circular** — de `9` con `+1` → `0`; de `0` con `-1` → `9`. Es lógica pura y se extrae para poder testearla sin DOM
- **Criterio de terminado:** el test circular pasa; selector, flechas y teclado convergen al mismo estado (piel + modo)

- [ ] Test circular **fallando** (RED) — evidencia:
- [ ] Controlador implementado (GREEN)
- [ ] Contador y `aria-pressed` reflejan el estado activo
- [ ] Commit

---

### T-6 — Transición horizontal

- **Cubre:** HU-3 (transición visible)
- **Entrada:** T-5, `ADR-002`
- **Salida:** transición por `transform` + `opacity`, con dirección según la flecha
- **Test primero:** assert de que existe el bloque `@media (prefers-reduced-motion: reduce)` que desactiva la transición
- **Criterio de terminado:** la transición se percibe al avanzar y retroceder; con reduced-motion no hay animación

- [ ] Test de `prefers-reduced-motion` **fallando** (RED) — evidencia:
- [ ] Transición implementada (GREEN)
- [ ] Commit

---

### T-7 — Arranque anti-FOUC y persistencia

- **Cubre:** HU-4 (default por `prefers-color-scheme`), HU-5 (restaurar, sin parpadeo), bordes de `localStorage`
- **Entrada:** T-5, `ADR-001`
- **Salida:** `<script>` inline en `<head>`, **antes** del `<body>`
- **Test primero:** asserts sobre la lógica de arranque con valores inválidos — `localStorage` con valor desconocido → cae al default **sin romper**; ausencia de valor → `prefers-color-scheme`; escritura envuelta en `try/catch`
- **Criterio de terminado:** tests pasan; el script está en `<head>` (verificable por posición en el archivo)

- [ ] Test de arranque **fallando** (RED) — evidencia:
- [ ] Arranque implementado (GREEN)
- [ ] Commit

---

### T-8 — Publicación

- **Cubre:** definición de "terminado" (publicado en Pages)
- **Entrada:** T-1..T-7 verdes
- **Salida:** `index.html` en `main`, Pages sirviendo
- **Test primero:** no aplica (tarea de despliegue); se verifica con HTTP real
- **Criterio de terminado:** `curl` a la URL devuelve **200** y el HTML contiene el hero nuevo

- [ ] `node --test tests/` completamente verde
- [ ] `git push` a `main`
- [ ] Pages reconstruido (`built`)
- [ ] `curl` → HTTP 200 con el contenido nuevo
- [ ] Commit

---

## Estado

| Tarea | Estado | Gate G3 (tests primero) | Notas |
|---|---|---|---|
| T-1 | pendiente | n/a (andamiaje) | |
| T-2 | pendiente | — | |
| T-3 | pendiente | — | |
| T-4 | pendiente | — | riesgo más alto: contraste ×20 |
| T-5 | pendiente | — | test unitario circular |
| T-6 | pendiente | — | |
| T-7 | pendiente | — | anti-FOUC |
| T-8 | pendiente | n/a (despliegue) | |

---

**Gate G2 (salida de fase 4):** trazabilidad completa definición ↔ tareas ✅
