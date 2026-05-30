# ADR-0001: Documentation architecture

## Status

Accepted

## Context

`sumar-app` ya venía avanzando, pero el repo no tenía una baseline documental humana suficiente para sostener continuidad, onboarding ni colaboración futura. Al mismo tiempo, `.atl/` ya existe y cumple un rol útil como soporte machine-oriented para agentes.

También surgió la duda de si convenía agregar `AGENTS.md` a nivel repo.

## Decision

Se adopta una arquitectura documental por capas:

- **`README.md`** queda como entrypoint corto del repositorio.
- **`docs/`** pasa a ser la fuente humana principal para onboarding, arquitectura, modelo de datos, alcance funcional, despliegue y decisiones.
- **`.atl/`** se preserva como contexto machine-oriented y no reemplaza documentación para personas.
- **`AGENTS.md`** queda **deferred / no file por ahora**. Solo se crea si aparecen reglas repo-specific de ejecución, workflow o mantenimiento que no estén ya cubiertas por las instrucciones globales y el skill registry existente.

## Consequences

### Positivas

- El proyecto gana discoverability para humanos.
- El onboarding deja de depender de contexto implícito.
- Se reduce el riesgo de drift entre código y documentación al exigir `Update when` por archivo.
- Se mantiene el valor de `.atl/` sin mezclar audiencias.

### Costos

- Cada cambio relevante ahora debe tocar documentación en el mismo PR/cambio.
- Habrá que revisar periódicamente que `docs/` siga alineado con hooks, rutas, migraciones y CI.

### Señal para revisar esta decisión

Reabrir esta ADR si:

- aparecen workflows locales que justifiquen `AGENTS.md`
- `docs/` se vuelve demasiado grande y necesita sub-taxonomías nuevas
- `.atl/` y la capa humana empiezan a duplicar contenido en lugar de complementarse

## Update when

Actualizá esta ADR si cambia la separación entre `README.md`, `docs/`, `.atl/` y `AGENTS.md`, o si finalmente se decide versionar un `AGENTS.md` local.
