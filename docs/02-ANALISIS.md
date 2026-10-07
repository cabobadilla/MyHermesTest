# 02 — Análisis

> Fase 2. Dueño: **Product Owner**. Regla v0.2: **el PO decide con benchmark
> rápido, no interroga.** Cada duda queda resuelta aquí; solo sube al usuario lo
> caro de revertir o lo que cambie la propuesta de valor.

- **Proyecto:** MyHermesTest
- **Fecha:** 2026-10-07
- **Iteración:** 1

## El problema en una frase

Hoy la demo es una pila técnica de 10 bloques que repiten "Hello World", y quien
la muestra no puede presentarla como lo que quiere que sea: una vista creíble del
sitio de una consultora agéntica donde un visitante **explore los estilos y modos
viviéndolos**, en lugar de leer un catálogo apilado.

## ¿Quién lo sufre y con qué frecuencia?

- **El dueño del proyecto**, cada vez que comparte o presenta la pieza (GitHub
  Pages, demos, conversaciones con posibles clientes). Está pensada para *verse
  profesional* y hoy se lee como un experimento tipográfico.
- **El harness HermesHarness**, porque este repo es su primer POC end-to-end. Si
  el proceso no corre sobre un requerimiento ambiguo real, el harness no queda
  validado.
- Frecuencia: baja en volumen, **alta en importancia por visita** — cada visita
  tiene intención de persuadir o de evaluar.

## ¿Qué pasa si no hacemos nada?

- **Producto:** la demo sigue sirviendo de muestrario, pero no de landing. El
  trabajo de investigación de estilos ya hecho no se explota.
- **Proceso (el costo que decide el proyecto):** el harness nunca se prueba
  contra una entrada ambigua real. El costo de la inacción no es la página: es
  **no validar el proceso**.

## Dudas resueltas

> Regla v0.2: cada duda se cierra aquí. Lo que el usuario respondió se marca
> **[usuario]**; lo que decidió el PO con benchmark, **[PO]**. Toda decisión del
> PO queda como supuesto explícito en la sección siguiente.

1. **"Moverme a la derecha" — ¿qué gesto?**
   **[usuario]** Clickar la flecha. → **Decisión:** botones de flecha ← → en la
   barra superior, más las teclas ← / → equivalentes. Sin swipe ni scroll
   horizontal (eso complica en móvil sin aportar).

2. **"Vivir el sitio en diferentes modos" — ¿cuántos ejes?**
   **[usuario]** Los 10 estilos aplicados al contenido, en claro/oscuro.
   → **Decisión:** hay **dos ejes independientes**: *estilo* (10 pieles:
   paleta + tipografía) y *modo* (claro/oscuro). El sitio es **uno solo** que se
   re-piela completo; no son 10 secciones apiladas. Combinaciones: 10 × 2 = 20.

3. **"El mismo contenido" — ¿literal o de referencia?**
   **[usuario]** Escribir el contenido de una landing page corta para una empresa
   que vende servicios de consultoría agéntica.
   → **Decisión:** se escribe contenido real y breve. Se retira el "Hello World"
   repetido; el hero pasa a ser la propuesta de valor de la consultora.

4. **¿Quién es el público?**
   **[PO]** Benchmark: las landings de consultoras se optimizan para *cliente
   potencial*, y una buena landing persuasiva también sirve como demo interna.
   → **Decisión:** público primario = **cliente potencial**; secundario =
   evaluador del harness. Tono profesional-comercial, sin jerga técnica.

5. **¿Qué es la "barra superior"?**
   **[PO]** Benchmark (patrón estándar de theme switcher): controles de tema
   viven en un header persistente, con el estado seleccionado visible.
   → **Decisión:** una **barra superior fija** con: marca, selector de estilo,
   toggle claro/oscuro, controles ← → y contador `NN/10`.

6. **¿Catálogo de 10 estilos, o una sola marca?**
   **[PO]** La contradicción se resuelve por la respuesta 2: no es un catálogo ni
   una sola marca, es **un sitio con 10 pieles intercambiables**. La marca
   (nombre, contenido, estructura) es constante; solo cambia la capa visual.
   → **Decisión:** contenido y estructura idénticos en las 10 pieles; lo único
   que cambia es el sistema visual.

7. **¿Se mantienen las restricciones técnicas actuales?**
   **[PO]** El valor del POC es la simplicidad de publicación.
   → **Decisión:** sí — un solo `index.html` autocontenido, sin build step,
   servido desde el root de GitHub Pages, Google Fonts por CDN, WCAG AA en
   ambos modos.

8. **¿Qué significa "vivir la experiencia", medible?**
   **[PO]** Es medible como un conjunto de capacidades observables.
   → **Decisión:** cuenta como cumplido si el visitante puede **cambiar de piel
   sin recargar**, **ver el cambio de inmediato**, **saber en qué piel está**
   (contador), **alternar modo claro/oscuro**, y **volver a encontrar su
   elección** al regresar.

9. **¿Dispositivo primario?**
   **[PO]** Se presenta en escritorio, pero se comparte por enlace y se abre en
   móvil.
   → **Decisión:** **mobile-first en CSS**, layouts correctos en 375px y 1440px.
   Las flechas del teclado son mejora progresiva, no requisito en móvil.

## Supuestos

- Se **evoluciona** el `index.html` existente; no se reescribe desde cero.
- Las **10 combinaciones de paleta + tipografía** de `BRIEF.md` siguen siendo
  las correctas; no se investigan más.
- El idioma del contenido es **español**.
- La pieza sigue siendo **estática**: sin backend, sin base de datos, sin login.
- El objetivo dual (producto + POC del harness) se mantiene y ninguno cancela
  al otro.
- El mecanismo de "piel" es **token-driven**: un cambio de atributo re-tematiza
  todo. No se escriben 20 versiones del contenido.

## Alcance propuesto

- Convertir `index.html` en una **landing page breve de una consultora agéntica**
  con contenido real (hero, servicios, método, cierre/CTA, footer).
- **Un sitio, 10 pieles**: cambiar la piel re-tematiza todo el sitio.
- **Barra superior fija** con marca, selector de estilo, toggle claro/oscuro,
  flechas ← → y contador.
- **Transición de deslizamiento horizontal** al cambiar de piel, para que se
  sienta como "moverse a la derecha".
- **Persistencia** de la elección de piel y modo en `localStorage`.
- Mantener autocontenido, estático y apto para GitHub Pages.
- **WCAG AA en las 20 combinaciones** (10 pieles × 2 modos).

## Anti-alcance (lo que NO entra)

- Sitio corporativo multi-página, blog, casos de éxito reales o testimonios
  verificables.
- Backend, CMS, formularios que envíen correo, analytics, cualquier estado en
  servidor.
- Ruteo o multi-página: se mantiene una sola página estática.
- ~~Reemplazar las 10 combinaciones por una sola~~ — descartado por respuesta 2.
- Autenticación, perfiles, i18n/multilenguaje.
- Sistema de diseño nuevo o paletas adicionales más allá de las 10 documentadas.
- Logos de clientes, métricas de negocio o cualquier afirmación verificable que
  no tengamos.

## Riesgos

- **Accesibilidad a escala:** 10 pieles × 2 modos = 20 superficies donde AA
  puede fallar en silencio → se verifica numéricamente, no a ojo.
- **Peso tipográfico:** 15 familias puede degradar la carga → cargar solo los
  pesos usados y medir.
- **Contradicción residual "una voz de marca vs 10 pieles":** se mitiga
  manteniendo contenido y estructura constantes.
- **Ambigüedad de "a la derecha" mal implementada** generaría retrabajo casi
  total del mecanismo de navegación → cerrada en la duda 1.
- **Doble propósito no reconciliado:** si no se separa producto de proceso, el
  alcance se infla y falla en ambos frentes.

## Veredicto

- [x] **Vale la pena**
- [ ] No vale la pena → razón:
- [ ] Todavía no → qué falta:

**Razón:** el proyecto es pequeño (una página estática), de alto valor en dos
frentes, y **ya no tiene incertidumbre bloqueante**: las 9 dudas quedaron
cerradas. Corre a fase 3.

---

**Gate G1a (v0.2 — Análisis decidido):** cada duda resuelta por benchmark o por
decisión del usuario ✅ · decisiones del PO registradas como supuesto ✅ ·
anti-alcance explícito ✅ · veredicto con razón ✅
