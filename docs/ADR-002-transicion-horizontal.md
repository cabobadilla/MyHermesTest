# ADR-002 — Transición horizontal por `transform`

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

El requerimiento original decía que moverse a la derecha permitiera "vivir la
experiencia". El usuario resolvió el gesto (clickar la flecha) pero la intención
expresaba **movimiento**, no solo un cambio de estado. Una piel que cambia de
color sin más se siente como un toggle, no como recorrer un sitio.

Restricción: el contenido es el mismo en las 10 pieles, así que no hay
"pantallas" distintas que deslizar. El movimiento tiene que ser un gesto
visual, no un desplazamiento real de contenido distinto.

## Decisión

Al cambiar de piel se aplica una **transición horizontal breve** (deslizamiento +
fundido) al contenedor del sitio mediante `transform: translateX()` y `opacity`,
con dirección derivada de la flecha usada (derecha → viene desde la derecha).

Se desactiva con `@media (prefers-reduced-motion: reduce)`.

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| Sin transición (cambio instantáneo) | Cumple la función pero traiciona la intención de "vivir la experiencia moviéndose". Se siente roto |
| `scroll-snap` horizontal con 10 paneles | Implica 10 copias del DOM o scroll real; contradice ADR-003 y complica accesibilidad y foco |
| Crossfade (solo opacidad, sin desplazamiento) | Más seguro, pero no comunica dirección: al usar ← y → el usuario no percibe hacia dónde fue |
| Animación de colores por elemento | Costosa en rendimiento y visualmente ruidosa; animar 13 tokens por elemento es peor que animar el contenedor |
| `View Transitions API` | Bonita, pero soporte irregular y no es progresiva: donde no existe, se degrada raro |

## Consecuencias

**Positivas:**
- Comunica **dirección** — se siente como avanzar/retroceder por el sitio
- Barata: anima un solo elemento, en GPU (`transform` + `opacity`)
- Respeta `prefers-reduced-motion`

**Negativas / costo asumido:**
- Hay que gestionar el momento del cambio de tokens para que no se vea el
  contenido "salir" ya con la piel nueva (o se ve doble)
- Riesgo de que la animación se sienta lenta si dura demasiado

**Qué se vuelve difícil después de esto:**
- Animaciones complejas sobre el contenido mientras se cambia de piel; la
  transición ocupa el contenedor y compite con cualquier otra animación.
