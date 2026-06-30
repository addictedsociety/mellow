# Project — Monorepo

This repo is split into `backend/` (NestJS + TypeORM) and `frontend/` (Vue 3 + TS).

Claude Code automatically loads the nearest `CLAUDE.md` for the directory you are
working in. When working under `backend/` or `frontend/`, the area-specific rules
in `<area>/CLAUDE.md` apply.

- Backend conventions: @backend/CLAUDE.md
- Frontend conventions: @frontend/CLAUDE.md

When a change spans both areas, follow each area's own conventions for the files
that belong to it.
