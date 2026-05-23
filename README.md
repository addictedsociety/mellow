# Mellow

Mellow ist ein lokaler Desktop-Zeittracker für Aufgaben, Arbeitssessions und Markdown-Notizen. Alle Daten bleiben lokal auf deinem Rechner – keine Cloud, keine externe API.

## Features

### Aufgaben & Zeiterfassung

- Aufgaben mit Markdown-Beschreibung, Status (`todo`, `in_progress`, `blocked`, `done`) und Zeiterfassung in Sekunden-Granularität
- **Mehrere Timer parallel** – pro Aufgabe ein eigener Timer, beliebig viele gleichzeitig laufend
- **Kumulative Zeit-Anzeige** – Timer-Display zählt nahtlos auf der bisher erfassten Zeit weiter (Stop/Start verliert keine Sekunde)
- Manuelle Zeiteinträge mit Markdown-Notizen
- **Such- und Filterleiste** auf Aufgaben-, Dashboard- und Erledigt-Ansicht (Fuse.js Fuzzy-Search, Sortierung nach Titel, Status, Erstellzeit, erfasster Zeit)
- **Einklappbare Beschreibung** im Task-Card-Layout (default eingeklappt, Markdown wird beim Aufklappen voll gerendert)
- **Lösch-Bestätigungsdialog** für Aufgaben
- Erledigte Aufgaben bleiben editierbar und können bei Bedarf wieder reaktiviert werden

### Pomodoro

- Klassischer Pomodoro-Timer mit drei Modi (Fokus, kurze Pause, lange Pause)
- **Einstellbare Dauer pro Modus** über Settings-Dialog mit Shadcn `NumberField` Steppern
- Persistenz der Einstellungen über `localStorage`
- Theme-aware animierter Three.js-Hintergrund pro Modus

### Dashboard

- Tagesübersicht mit Summe aller heute erfassten Sekunden
- Live-Anzeige aller aktiven Timer mit Gesamtelapsed-Zeit
- Drei-Spalten-Layout (Todo / In Arbeit / Erledigt) mit gemeinsamer Such- und Sortier-Bar

### UI & Themes

- Mehrere Themes (Violet Bloom, Vercel, Twitter, Tangerine, T3 Chat, Supabase, Solar Dusk, Mono, Doom 64, Neutral) – jeweils mit Light- und Dark-Modus
- **Globaler animierter Three.js-Hintergrund** auf allen authentifizierten Routen, reagiert auf Theme-Wechsel via `MutationObserver` über CSS-Variablen
- Sprachen Deutsch und Englisch (vue-i18n)
- Komponenten auf Basis von [shadcn-vue](https://www.shadcn-vue.com/) / [reka-ui](https://reka-ui.com/) und Tailwind CSS v4

### Backend

- Tauri 2 + Rust mit SQLite über `rusqlite`
- Lokale Benutzerverwaltung (Mehrfach-Accounts, Hashing mit `argon2`)

## Voraussetzungen

- Node.js und npm
- Rust mit `cargo` (für Tauri)
- Tauri-Systemabhängigkeiten für dein Betriebssystem

Prüfen, ob `cargo` verfügbar ist:

```bash
cargo --version
```

Falls nicht im Pfad, einmalig laden:

```bash
source "$HOME/.cargo/env"
```

Damit das dauerhaft gilt:

```bash
echo 'source "$HOME/.cargo/env"' >> ~/.zshrc
```

## Installation

```bash
npm install
```

## Entwicklung starten

Desktop-App mit Hot Reload (empfohlen):

```bash
npm run tauri:dev
```

Nur das Vue-Frontend im Browser (Login/Datenbank funktionieren dort nicht, weil Tauri-IPC fehlt):

```bash
npm run dev
```

## Checks und Build

TypeScript prüfen:

```bash
npm run typecheck
```

Linter ausführen:

```bash
npm run lint
```

Frontend bauen:

```bash
npm run build
```

Desktop-App bauen:

```bash
npm run tauri:build
```

## Projektstruktur

```
src/
├── components/
│   ├── Nxr*.vue              # generische, wiederverwendbare Komponenten
│   │                         # (NxrAnimatedBackground, NxrConfirmDialog,
│   │                         #  NxrFilterBar, NxrTimePill)
│   ├── markdown/             # Markdown-Editor + Preview
│   ├── pomodoro/             # PomodoroTimer, PomodoroBackground,
│   │                         # PomodoroSettingsDialog
│   ├── tasks/                # TaskCard, TaskList, StatusBadge
│   ├── timer/                # TimerCard
│   ├── layout/               # AppSidebar
│   └── ui/                   # shadcn-vue Komponenten
├── services/                 # Tauri-IPC-Wrapper (task.service.ts, ...)
├── stores/                   # Pinia (auth, tasks, timer, pomodoro, settings)
├── styles/                   # style.css (Themes), main.css, transitions.css
├── types/                    # *.type.ts
├── utils/                    # useTaskFilter, time, ...
├── views/                    # Routen-Views (Dashboard, Tasks, Pomodoro, ...)
└── i18n/                     # de.json, en.json

src-tauri/
└── src/lib.rs                # Rust-Backend, SQLite-Schema und alle IPC-Commands
```

## Themes und Modi

Die Theme-Definitionen liegen in `src/styles/style.css` und werden über zwei Attribute am `<html>`-Element ausgewählt:

- `data-theme="violet-bloom"` – Theme-Variante
- `data-mode="dark"` oder `data-mode="light"` – Hell- oder Dunkel-Modus

Die Auswahl passiert in den **Einstellungen** der App. Jedes Theme zeigt drei kleine Farbkreise mit den Hauptfarben (Primary, Accent, Background) zur schnellen Vorschau. Light- und Dark-Modus werden separat über einen Toggle umgeschaltet und unabhängig vom gewählten Theme gespeichert.

Die Auswahl wird pro Benutzer in der lokalen Datenbank persistiert (`users.theme`, `users.mode`).

Die animierten Three.js-Hintergründe (`NxrAnimatedBackground` und `PomodoroBackground`) lesen die CSS-Variablen (`--primary`, `--chart-1..5`, `--background`, `--foreground`) zur Laufzeit und reagieren via `MutationObserver` auf Theme-Wechsel.

## Logo und App-Icon

Das Quell-Logo liegt unter `src-tauri/icons/mellow_logo.png` und muss als RGBA-PNG vorliegen. Aus dieser Quelle erzeugt der Tauri-CLI alle plattformspezifischen Icons:

```bash
npx tauri icon src-tauri/icons/mellow_logo.png
```

Damit werden u. a. `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns` (macOS), `icon.ico` (Windows) sowie iOS-, Android- und Appx-Sets erstellt. Die referenzierten App-Icons sind in `src-tauri/tauri.conf.json` hinterlegt.

Für das UI (Sidebar, Login) wird das Logo zusätzlich als `src/assets/mellow_logo.png` gepflegt und per Vite gebündelt.

## Lokale Daten

Mellow verwendet SQLite über das Tauri-Backend. Die Datenbank wird im App-Data-Verzeichnis des Betriebssystems abgelegt:

- macOS: `~/Library/Application Support/dev.nexron.mellow/mellow.sqlite`
- Linux: `~/.local/share/dev.nexron.mellow/mellow.sqlite`
- Windows: `%APPDATA%/dev.nexron.mellow/mellow.sqlite`

Pomodoro-Einstellungen werden zusätzlich im Browser-`localStorage` unter dem Key `mellow:pomodoro:durations` persistiert.

Es wird keine externe API, keine Cloud und keine externe Datenbank verwendet. Zum vollständigen Zurücksetzen kann die SQLite-Datei einfach gelöscht werden.

## Lizenz

MIT License
