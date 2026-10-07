# 03 — Definición

> Fase 3. Dueño: **Product Owner**. Spec **verificable**. Termina con el gate
> humano G1.

- **Proyecto:** MyHermesTest
- **Fecha:** 2026-10-07
- **Iteración:** 1

---

## HU-1 — La landing comunica la oferta

**Como** visitante que llega al sitio por un enlace
**quiero** entender en segundos qué vende la consultora y cómo trabaja
**para** decidir si vale la pena contactarla

**Criterios de aceptación:**

- **Dado** que abro la página
  **cuando** carga
  **entonces** veo, en este orden, estas secciones: barra superior, hero con la
  propuesta de valor, servicios, método de trabajo, llamada a la acción y footer

- **Dado** que leo el hero
  **cuando** lo leo
  **entonces** encuentro una propuesta de valor de una frase, sin la cadena
  "Hello World"

- **Dado** que veo la sección de servicios
  **cuando** la leo
  **entonces** hay **3 servicios** de consultoría agéntica, cada uno con título y
  una línea de descripción

- **Dado** que veo la sección de método
  **cuando** la leo
  **entonces** hay **3 o 4 pasos** del proceso de trabajo, numerados

---

## HU-2 — Cambiar de piel desde la barra superior

**Como** visitante
**quiero** elegir el estilo visual del sitio desde la barra superior
**para** explorar cómo se ve la marca en distintos sistemas de color y tipografía

**Criterios de aceptación:**

- **Dado** que estoy en la página
  **cuando** la observo
  **entonces** hay una barra superior **fija** (visible al hacer scroll) con al
  menos: la marca, el selector de estilo y el contador `NN/10`

- **Dado** el selector de estilo
  **cuando** elijo una de las 10 pieles
  **entonces** **todo el sitio** cambia de paleta y tipografía, sin recargar la
  página y **sin cambiar el contenido ni la estructura**

- **Dado** que cambié de piel
  **cuando** miro el contador
  **entonces** muestra la posición correcta (`01/10` … `10/10`)

- **Dado** que elijo una piel
  **cuando** observo el control correspondiente
  **entonces** ese control aparece como seleccionado (`aria-pressed="true"`) y
  los demás como no seleccionados

---

## HU-3 — Cambiar de piel con las flechas

**Como** visitante
**quiero** avanzar y retroceder entre pieles con flechas
**para** recorrer la experiencia de forma continua, como si me moviera por el sitio

**Criterios de aceptación:**

- **Dado** que estoy en la página
  **cuando** miro la barra superior
  **entonces** hay dos botones de flecha, ← y →

- **Dado** que estoy en una piel que no es la última
  **cuando** clickeo la flecha derecha →
  **entonces** avanzo a la piel siguiente, con una **transición horizontal** visible

- **Dado** que estoy en una piel que no es la primera
  **cuando** clickeo la flecha izquierda ←
  **entonces** retrocedo a la piel anterior, con transición horizontal

- **Dado** que estoy en la **primera** piel (`01/10`)
  **cuando** clickeo la flecha izquierda ←
  **entonces** salta a la **última** piel (`10/10`)

- **Dado** que estoy en la **última** piel (`10/10`)
  **cuando** clickeo la flecha derecha →
  **entonces** vuelve a la **primera** piel (`01/10`), con la misma transición

- **Nota de decisión (usuario, 2026-10-07):** la navegación es **circular**
  (loop infinito). Se eligió por ser más fluido que deshabilitar los botones.

- **Dado** que uso un teclado
  **cuando** presiono ← o →
  **entonces** navego entre pieles (mejora progresiva; no aplica en móvil)

---

## HU-4 — Alternar modo claro / oscuro

**Como** visitante
**quiero** ver cada piel en modo claro y oscuro
**para** evaluar el sistema visual completo antes de decidir

**Criterios de aceptación:**

- **Dado** que estoy en cualquier piel
  **cuando** activo el modo oscuro
  **entonces** **todo el sitio** cambia a la variante oscura **de esa misma piel**
  (no a la de otra)

- **Dado** que estoy en modo oscuro con una piel elegida
  **cuando** cambio de piel
  **entonces** el modo oscuro se mantiene

- **Dado** que nunca elegí un modo
  **cuando** abro la página
  **entonces** el modo inicial respeta `prefers-color-scheme` del sistema

- **Dado** que hay 10 pieles × 2 modos
  **cuando** se verifica contraste
  **entonces** las **20 combinaciones** cumplen WCAG AA: texto de cuerpo ≥ 4.5:1
  y titulares grandes ≥ 3:1

---

## HU-5 — Recordar la elección

**Como** visitante que vuelve
**quiero** encontrar el sitio como lo dejé
**para** no tener que reconfigurarlo

**Criterios de aceptación:**

- **Dado** que elegí una piel y un modo
  **cuando** recargo la página
  **entonces** se restauran la misma piel y el mismo modo

- **Dado** que abro la página por primera vez (sin elección previa)
  **cuando** carga
  **entonces** no hay parpadeo de tema: el tema se aplica **antes** del primer
  render

---

## Etapas

> **Regla v0.4.** El diseño multiplica dos ejes: **10 pieles × 2 modos = 20
> superficies** donde el contraste puede fallar. Eso arriesga la entrega rápida,
> así que se corta. Documentado por el PO a pedido del Arquitecto.

### Etapa 1 (este ciclo) — valor visible rápido

**Entra:**
- El **mecanismo completo**, de punta a punta: contenido real de landing, barra
  superior, flechas ← →, navegación circular, persistencia, anti-FOUC y
  transición horizontal.
- **3 pieles** en vez de 10: `slate` (sans + sans), `rose` (serif display + sans)
  y `mono` (serif + sans, alto contraste). Elegidas por ser las más distintas
  entre sí en paleta **y** tipografía.
- Contraste AA sobre **3 × 2 = 6 combinaciones**.

**Por qué esto prueba el mecanismo completo:** el riesgo del proyecto no está en
la cantidad de pieles — está en el **mecanismo** (re-tematizado por atributo,
circular, persistencia, anti-FOUC, transición) y en la **verificación de
contraste**. Con 3 pieles se ejercitan los tres perfiles tipográficos
(sans/sans, serif-display/sans, serif/sans) y las dos familias de paleta (fría y
cálida) sobre el mismo mecanismo. La piel 4 no enseña nada que la 3 no haya
enseñado.

**Diferido a la Etapa 2**

- Las **7 pieles restantes** (`indigo`, `emerald`, `amber`, `violet`, `teal`,
  `cyan`, `zinc`) y su verificación AA — 14 combinaciones más.
- **Verificación de comportamiento en navegador real** (flechas, persistencia,
  `aria-pressed`) — hoy declarada como hueco de cobertura por `ADR-004`.
- **Responsive fino** a 375px y 1440px más allá de lo estructural.
- **Piel "de marca" por defecto** — descartada por el usuario en G1; queda
  registrada como candidata futura.

**Por qué las pieles se pueden diferir sin romper la Etapa 1:** por
`ADR-001`, una piel es **datos, no complejidad** — un bloque de 13 tokens CSS.
Agregar la piel 4 no toca ni el mecanismo, ni el contenido, ni los tests. Si eso
deja de ser cierto, el corte estaba mal hecho.

## Casos borde y de error

| Caso | Comportamiento esperado |
|---|---|
| Última piel + flecha derecha | Vuelve a `01/10` (navegación circular) |
| Primera piel + flecha izquierda | Salta a `10/10` (navegación circular) |
| `localStorage` corrupto o con valor desconocido | Se ignora y se usa el valor por defecto; no rompe |
| Almacenamiento bloqueado (modo privado) | La página funciona igual; solo no persiste |
| Google Fonts no carga | El sitio sigue legible con las fuentes de fallback del sistema |
| `prefers-reduced-motion: reduce` | La transición horizontal se desactiva |
| Ancho 375px | Barra superior usable, sin desbordamiento horizontal |
| Ancho 1440px | El contenido no se estira más allá del ancho de lectura cómodo |

## Definición de "terminado" para esta iteración

- [ ] Contenido real de landing de consultora agéntica (5 secciones + footer)
- [ ] 10 pieles intercambiables aplicadas a todo el sitio
- [ ] Barra superior fija con marca, selector, toggle de modo, flechas y contador
- [ ] Transición horizontal al cambiar de piel
- [ ] Persistencia en `localStorage`
- [ ] 20 combinaciones (10 pieles × 2 modos) verificadas AA numéricamente
- [ ] Un solo `index.html` autocontenido, sin build step
- [ ] Publicado y funcionando en GitHub Pages
- [ ] Responsive correcto en 375px y 1440px

## Fuera de esta iteración

- Casos de éxito, testimonios, logos de clientes o métricas de negocio
- Formularios funcionales de contacto
- Multi-página, blog, i18n
- Pieles adicionales más allá de las 10
- **Piel "de marca" por defecto** — decisión del usuario (2026-10-07): no por
  ahora. El contenido es **idéntico en las 10 pieles**; solo cambia la capa visual.

---

## Aprobación

- [x] **Aprobado por el usuario** — fecha: 2026-10-07
- Decisiones cerradas en la aprobación:
  - **Sin piel de marca** — el contenido es el mismo en las 10 pieles
  - **Navegación circular** — de la última piel vuelve a la primera (y al revés)
- [ ] Cambios solicitados: ninguno

---

**Gate G1 ⭐ (humano):** cada criterio es convertible en un test concreto. Sin
aprobación explícita del usuario, no se avanza a diseño.
