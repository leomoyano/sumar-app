# Documentación de Sumar

Esta carpeta es la **capa humana** del proyecto. Su objetivo es permitir continuidad de trabajo, onboarding y colaboración futura sin obligar a leer `.atl/`.

## Audiencia

- Maintainers actuales del proyecto.
- Futuras personas del equipo que necesiten contexto funcional y técnico.
- Colaboradores que entren por primera vez al repo.

## Alcance

- **README.md**: puerta de entrada breve del repositorio.
- **`docs/`**: documentación legible para humanos.
- **`.atl/`**: soporte machine-oriented para agentes y automatizaciones; no reemplaza onboarding ni documentación operativa para personas.

## Taxonomía documental

| Documento | Propósito |
| --- | --- |
| [`onboarding.md`](./onboarding.md) | Primer arranque, setup local, variables y rutina diaria. |
| [`architecture.md`](./architecture.md) | Providers, auth, rutas protegidas, hooks y límites del frontend. |
| [`data-model.md`](./data-model.md) | Entidades de Supabase, relaciones, constraints y migraciones fuente. |
| [`product-scope.md`](./product-scope.md) | Qué está productivo, qué está parcial/mock y qué deuda visible existe. |
| [`deployment-runbook.md`](./deployment-runbook.md) | CI, secretos, deploy y rollback. |
| [`decisions/README.md`](./decisions/README.md) | Convención para ADRs y decisiones persistentes. |
| [`decisions/ADR-0001-documentation-architecture.md`](./decisions/ADR-0001-documentation-architecture.md) | Decisión fundacional sobre la arquitectura documental por capas. |

## Regla anti-drift

Cada documento de esta carpeta debe incluir una sección **Update when**. Si cambiás código, flujos o infraestructura y eso altera el source of truth del doc, actualizalo en el mismo cambio.

## Decisión sobre `AGENTS.md`

Por ahora **no se crea `AGENTS.md` en el repo**. La razón es simple: hoy no apareció una regla repo-specific nueva que no esté ya cubierta por las instrucciones globales y por `.atl/skill-registry.md`. Si en el futuro aparecen workflows locales, comandos obligatorios o restricciones de ejecución propias de `sumar-app`, ahí sí conviene versionar `AGENTS.md` como archivo process-oriented.

## Update when

Actualizá este índice cuando se agregue, elimine, renombre o cambie de propósito cualquier documento humano bajo `docs/`, o cuando cambie la decisión de `AGENTS.md`.
