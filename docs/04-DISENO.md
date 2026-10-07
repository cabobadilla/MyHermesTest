# 04 — Diseño

> Fase 4. Dueño: **Arquitecto**. Decidir *cómo* se construye. Termina con
> trazabilidad completa hacia la definición.

- **Proyecto:**
- **Fecha:**
- **Basado en:** `03-DEFINICION.md`

## Arquitectura

### Componentes

| Componente | Responsabilidad | Límite |
|---|---|---|
| … | … | … |

### Flujo de datos

> Diagrama o descripción paso a paso.

### Diagrama

> Opcional: generar con la skill `architecture-diagram`.

## Contratos

> Lo bastante precisos para que el Coder no tenga que adivinar nada.

### API / Interfaces

```
<endpoint o firma>
Entrada: …
Salida: …
Errores: …
```

### Esquemas de datos

```
<estructura>
```

## Stack y dependencias

| Elección | Versión | Justificación |
|---|---|---|
| … | … | … |

## Decisiones (ADRs)

> Una decisión técnica no obvia = un ADR. Ver `templates/ADR.md`.

- `ADR-001-<tema>.md` — …
- `ADR-002-<tema>.md` — …

## Estrategia de pruebas

| Nivel | Qué cubre | Herramienta | Criterio de éxito |
|---|---|---|---|
| Unidad | … | … | … |
| Integración | … | … | … |
| E2E / aceptación | … | … | … |

## Trazabilidad

> Cada criterio de la fase 3 debe estar cubierto. Cada tarea apunta a un criterio.

| Criterio (fase 3) | Tarea(s) | Cómo se prueba |
|---|---|---|
| HU-1 / Dado-cuando-entonces #1 | T-1 | … |

---

**Gate G2:** todo criterio tiene ≥1 tarea, toda tarea apunta a ≥1 criterio, cada ADR tiene alternativas descartadas.
