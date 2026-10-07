# 04 — Diseño

> Fase 4. Dueño: **Arquitecto**. Decidir *cómo* se construye. Trazabilidad
> completa hacia la definición.

- **Proyecto:** MyHermesTest
- **Fecha:** 2026-10-07
- **Basado en:** `03-DEFINICION.md` (aprobada 2026-10-07)

## Arquitectura

### Componentes

| Componente | Responsabilidad | Límite |
|---|---|---|
| `index.html` (shell) | Estructura de contenido, tokens, UI y controlador. **Único archivo del sitio.** | No contiene lógica de negocio ni datos externos |
| Sistema de tokens | Define los valores visuales por piel y modo como CSS custom properties | Vive dentro del `<style>` del shell |
| Registro de pieles | Metadatos de las 10 pieles (id, etiqueta, fuentes) | Constante JS; la verdad visual vive en CSS |
| Controlador | Cambia piel y modo, navegación circular, persistencia, teclado | Vanilla JS, sin dependencias |
| Barra superior | UI de control (marca, selector, toggle, flechas, contador) | Presentacional; delega en el controlador |
| Suite de pruebas | Verifica estructura, tokens, contraste y empaquetado | `tests/` — **fuera del sitio, nunca se publica** |

### Flujo de datos

1. **Anti-FOUC (antes del primer paint).** Un `<script>` inline en `<head>` lee
   `localStorage`, valida los valores contra el registro de pieles y fija
   `data-skin` + `data-mode` en `<html>`. Si no hay valor válido, usa el default.
2. **Resolución de tokens.** El CSS resuelve `[data-skin="X"][data-mode="Y"]` y
   expone las custom properties en `:root`. **Los componentes solo referencian
   tokens, nunca colores literales.**
3. **Interacción.** El controlador escucha: cambio en el selector, click en las
   flechas, teclas ← / →, y el toggle de modo.
4. **Aplicación.** Cambia el atributo en `<html>` → el CSS re-resuelve → el
   contenedor ejecuta la transición horizontal.
5. **Persistencia.** Tras aplicar, escribe la elección en `localStorage`
   (dentro de `try/catch`: en modo privado puede fallar, y eso no debe romper nada).

### Diagrama

```
  localStorage ──┐
                 ▼
   [ script inline en <head> ]  ──►  <html data-skin data-mode>
                                             │
                                             ▼
                                    [ tokens CSS resuelven ]
                                             │
             selector / flechas / teclado ──►[ controlador ]──► cambia atributo
                                             │                      │
                                             └──── persistencia ◄───┘
                                                        ▼
                                            [ transición horizontal ]
```

## Contratos

> Precisos para que el Coder no adivine nada.

### Contrato DOM

```
<html data-skin="slate|indigo|emerald|amber|rose|violet|teal|cyan|zinc|mono"
      data-mode="light|dark">
```

Ambos atributos son **obligatorios y siempre presentes**. El CSS depende de ellos.

### Contrato de tokens

Cada piel debe definir **exactamente estos tokens en ambos modos**:

```
Color (9):  --bg  --surface  --surface-2  --text  --muted  --accent
            --on-accent  --border  --shadow
Tipo (2):   --font-heading  --font-body
Layout (2): --radius  --container
```

**Regla dura:** los componentes solo usan `var(--token)`. Cero colores literales
fuera de los bloques de piel. Esto es lo que hace que la piel 11 sea un bloque
nuevo y nada más.

### Contrato del registro de pieles

```
Skins = [
  { id, label, headingFont, bodyFont },   // 10 entradas, en orden de navegación
  ...
]
```

- `id` debe coincidir con el valor usado en `[data-skin="<id>"]`.
- El orden del array **es** el orden de navegación (define el circular).

### Contrato de almacenamiento

```
Clave: "mht.skin"  → uno de los 10 ids
Clave: "mht.mode"  → "light" | "dark"
Lectura: valor ausente o inválido → default (skins[0], prefers-color-scheme)
Escritura: siempre dentro de try/catch
```

### Contrato de la barra superior

```
<header>                       fijo, siempre visible
  marca                        texto, no enlace
  [selector de piel]           10 opciones, aria-pressed en el activo
  [toggle claro/oscuro]        aria-pressed
  [←]  NN/10  [→]              flechas + contador en vivo
</header>
```

## Stack y dependencias

| Elección | Versión | Justificación |
|---|---|---|
| HTML + CSS + JS vanilla | — | Un solo archivo, sin build, apto para GitHub Pages |
| Google Fonts (CDN) | — | Las 15 familias ya definidas; es la única dependencia externa permitida |
| Node built-in test runner | Node ≥ 18 | Tests **sin dependencias**; no se instala nada |
| Calculadora WCAG propia | — | ~30 líneas; evita meter `axe`/`pa11y` en un POC |

## Decisiones (ADRs)

- `ADR-001-pieles-token-driven.md` — pieles por atributo + custom properties
- `ADR-002-transicion-horizontal.md` — transición por `transform`
- `ADR-003-contenido-unico.md` — contenido escrito una vez
- `ADR-004-tests-sin-dependencias.md` — `node --test` fuera del sitio

## Estrategia de pruebas

| Nivel | Qué cubre | Herramienta | Criterio de éxito |
|---|---|---|---|
| Estructura | 6 secciones presentes, 10 pieles definidas, contador `NN/10` | `node --test` | todos los asserts pasan |
| Tokens | Cada una de las 10 pieles define los 13 tokens en ambos modos | `node --test` | 10 × 2 × 13 completo, sin faltantes |
| **Contraste** | Las 20 combinaciones (piel × modo) | `node --test` + calculadora WCAG | cuerpo ≥ 4.5:1, titulares ≥ 3:1 |
| Empaquetado | Sin recursos externos salvo Google Fonts | `node --test` | 0 URLs no-fonts |
| Sintaxis | El JS inline parsea | `node --check` | sin error |
| Comportamiento | Circular, persistencia, `aria-pressed`, anti-FOUC | navegador headless **si está disponible** | si no hay headless, se declara como hueco de cobertura en QA |

> **Nota de honestidad:** el único nivel que no se puede automatizar sin
> dependencias es el de comportamiento real en navegador. Si no hay headless
> disponible, **QA debe declararlo como hueco** en vez de darlo por bueno.

## Trazabilidad

| Criterio (fase 3) | Tarea(s) | Cómo se prueba |
|---|---|---|
| HU-1 · secciones en orden (barra→hero→servicios→método→CTA→footer) | T-1 | Test de estructura |
| HU-1 · hero sin "Hello World" | T-1 | Test de estructura (assert ausencia) |
| HU-1 · 3 servicios con título y descripción | T-1 | Test de estructura (conteo) |
| HU-1 · 3–4 pasos de método numerados | T-1 | Test de estructura (conteo) |
| HU-2 · barra superior fija con marca, selector y contador | T-2 | Test de estructura |
| HU-2 · cambiar piel re-tematiza todo sin recargar | T-3 | Comportamiento (o hueco declarado) |
| HU-2 · contador muestra la posición correcta | T-3, T-4 | Test de estructura + comportamiento |
| HU-2 · control activo con `aria-pressed="true"` | T-3 | Test de estructura + comportamiento |
| HU-3 · existen botones ← y → | T-2 | Test de estructura |
| HU-3 · flecha derecha avanza con transición | T-4, T-5 | Comportamiento |
| HU-3 · flecha izquierda retrocede | T-4, T-5 | Comportamiento |
| HU-3 · circular: última→primera, primera→última | T-4 | Test unitario del índice circular |
| HU-3 · teclado ← / → | T-4 | Comportamiento (o hueco declarado) |
| HU-4 · modo oscuro re-tematiza la **misma** piel | T-3 | Comportamiento + tokens |
| HU-4 · cambiar de piel conserva el modo | T-3 | Comportamiento |
| HU-4 · default según `prefers-color-scheme` | T-6 | Test del script de arranque |
| HU-4 · **AA en las 20 combinaciones** | T-7 | Test de contraste |
| HU-5 · restaurar piel y modo al recargar | T-6 | Test del script de arranque |
| HU-5 · sin parpadeo de tema (anti-FOUC) | T-6 | Inspección: script inline en `<head>`, antes del `<body>` |
| Borde · `localStorage` corrupto → default sin romper | T-6 | Test con valores inválidos |
| Borde · almacenamiento bloqueado → funciona igual | T-6 | try/catch + comportamiento |
| Borde · Google Fonts no carga → legible con fallback | T-1 | `font-family` con stack de fallback |
| Borde · `prefers-reduced-motion` desactiva transición | T-5 | Test de estructura (media query presente) |
| Borde · 375px y 1440px correctos | T-2 | Inspección / hueco declarado |

---

**Gate G2:** todo criterio tiene ≥1 tarea ✅ · toda tarea apunta a ≥1 criterio ✅ ·
cada ADR tiene alternativas descartadas ✅
