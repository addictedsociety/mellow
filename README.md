# Mellow

Mellow ist ein lokaler Desktop-Zeittracker für Aufgaben, Arbeitssessions, manuelle Zeiteinträge und Markdown-Notizen. Alle Daten bleiben lokal auf deinem Rechner.

## Features

- Lokale Benutzerverwaltung mit Mehrfach-Accounts (z. B. getrennt für Arbeit und Privat)
- Aufgaben mit Markdown-Beschreibung, Status und manuellen oder getrackten Zeiteinträgen
- Dashboard mit Tagesübersicht und laufendem Timer
- Mehrere Themes (Violet Bloom, Vercel, Twitter, Tangerine, T3 Chat, Supabase, Solar Dusk, Mono, Doom 64, Neutral) – jeweils mit Light- und Dark-Modus
- Sprachen Deutsch und Englisch

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

Frontend bauen:

```bash
npm run build
```

Desktop-App bauen:

```bash
npm run tauri:build
```

## Themes und Modi

Die Theme-Definitionen liegen in `src/styles/style.css` und werden über zwei Attribute am `<html>`-Element ausgewählt:

- `data-theme="violet-bloom"` – Theme-Variante
- `data-mode="dark"` oder `data-mode="light"` – Hell- oder Dunkel-Modus

Die Auswahl passiert in den **Einstellungen** der App. Jedes Theme zeigt drei kleine Farbkreise mit den Hauptfarben (Primary, Accent, Background) zur schnellen Vorschau. Light- und Dark-Modus werden separat über einen Toggle umgeschaltet und unabhängig vom gewählten Theme gespeichert.

Die Auswahl wird pro Benutzer in der lokalen Datenbank persistiert (`users.theme`, `users.mode`).

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

Es wird keine externe API, keine Cloud und keine externe Datenbank verwendet. Zum vollständigen Zurücksetzen kann die Datei einfach gelöscht werden.

## Lizenz

MIT License
