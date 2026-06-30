# Setup — Claude Code Rules (Monorepo)

## Was hier drin ist

```
CLAUDE.md                      # Root: verweist auf beide Bereiche
backend/
  CLAUDE.md                    # wird geladen, wenn du in backend/ arbeitest
  .claude/rules/*.md           # einzelne Regel-Guides (Backend)
frontend/
  CLAUDE.md                    # wird geladen, wenn du in frontend/ arbeitest
  .claude/rules/*.md           # einzelne Regel-Guides (Frontend)
```

## Installation ins Repo

Lege die Dateien an die gleichen Stellen in deinem Repo:

    # vom entpackten Ordner aus, im Repo-Root:
    cp CLAUDE.md            <repo>/CLAUDE.md
    cp -r backend/CLAUDE.md backend/.claude   <repo>/backend/
    cp -r frontend/CLAUDE.md frontend/.claude <repo>/frontend/

Dann einchecken:

    git add CLAUDE.md backend/CLAUDE.md backend/.claude frontend/CLAUDE.md frontend/.claude
    git commit -m "chore: add Claude Code project rules"

## Wie Claude Code das nutzt

- `CLAUDE.md` wird beim Start automatisch geladen (Root + das Verzeichnis,
  in dem du arbeitest). Kein Frontmatter, kein globs-Mechanismus wie bei Cursor.
- Die `@pfad/datei.md`-Zeilen in den CLAUDE.md sind Imports: der Inhalt wird
  mitgeladen. So bleiben die einzelnen Guides getrennt und lesbar.
- Die "Scope hints" sagen Claude, welcher Guide für welche Dateien gilt
  (Ersatz für Cursors `globs`).

## Tuning

- Zu viel Kontext? Entferne selten gebrauchte `@imports` aus der "Always-on"-Liste
  und lass sie nur als Scope-Hint stehen — dann liest Claude sie bei Bedarf.
- Mit `/memory` in Claude Code kannst du die geladenen Memory-Dateien ansehen/bearbeiten.
- Persönliche, nicht eingecheckte Notizen: `CLAUDE.local.md` (in .gitignore).

## Hinweis

Die Original-`.mdc` (Cursor) hatten Frontmatter mit `globs`/`alwaysApply`.
Das wurde entfernt und in Klartext-Scope-Hints überführt, da Claude Code
dieses Format nicht auswertet. Inhalt der Regeln ist unverändert.
