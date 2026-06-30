# Backend — NestJS + TypeORM

Conventions for the backend. These rules apply to all work in this directory.
Detailed guides live in `.claude/rules/` and are imported below.

## Scope hints (which guide applies where)
- `**/*.controller.ts` → Swagger/OpenAPI docs → @.claude/rules/controller-api-docs.md
- `**/*.dto.ts` → DTO design (class-validator + Swagger) → @.claude/rules/dto-design.md
- `src/database/**/*.ts` → TypeORM entity/repository design → @.claude/rules/entity-design.md
- `src/**/*.service.ts`, `src/**/*.module.ts` → repository/service layer → @.claude/rules/repository-service-layer.md
- `src/db/migrations/**/*.ts` → migration conventions → @.claude/rules/typeorm-migrations.md
- `**/*.spec.ts` → tests (Vitest + NestJS) → @.claude/rules/testing.md
- everything → @.claude/rules/code-style.md & @.claude/rules/error-handling.md

## Always-on guides
@.claude/rules/code-style.md
@.claude/rules/error-handling.md
@.claude/rules/controller-api-docs.md
@.claude/rules/dto-design.md
@.claude/rules/entity-design.md
@.claude/rules/repository-service-layer.md
@.claude/rules/testing.md
@.claude/rules/typeorm-migrations.md
