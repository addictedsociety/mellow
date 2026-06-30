# Frontend — Vue 3 + TypeScript

Conventions for the frontend. These rules apply to all work in this directory.
Detailed guides live in `.claude/rules/` and are imported below.

## Scope hints (which guide applies where)
- `src/**/*.vue` → SFC structure (script setup + composition API) → @.claude/rules/component-structure.md
- `src/api/**/*.ts` → API service layer (axios + ApiService) → @.claude/rules/api-services.md
- `src/lib/**/*.ts` → composables (use*) → @.claude/rules/composables.md
- `src/stores/**/*.ts` → Pinia stores → @.claude/rules/stores.md
- `src/types/**/*.ts` → shared types/interfaces → @.claude/rules/types.md
- `src/**/*.spec.ts` → tests (Vitest) → @.claude/rules/testing.md
- `src/**/*.{ts,vue}` → i18n & error handling → @.claude/rules/i18n.md, @.claude/rules/error-handling.md
- everything → @.claude/rules/code-style.md

## Always-on guides
@.claude/rules/code-style.md
@.claude/rules/component-structure.md
@.claude/rules/api-services.md
@.claude/rules/composables.md
@.claude/rules/stores.md
@.claude/rules/types.md
@.claude/rules/error-handling.md
@.claude/rules/i18n.md
@.claude/rules/testing.md
