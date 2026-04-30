# Mellow

Mellow ist ein lokaler Desktop-Zeittracker für Aufgaben, Arbeitssessions, manuelle Zeiteinträge und Markdown-Notizen. Alle Daten bleiben lokal auf deinem Rechner.

## Voraussetzungen

- Node.js
- npm
- Rust mit Cargo
- Tauri-Systemabhängigkeiten für dein Betriebssystem

Unter Windows muss `cargo` im Terminal verfügbar sein. Prüfen kannst du das mit:

```bash
cargo --version
```

## Installation

```bash
npm install
```

## Entwicklung starten

Für die Desktop-App:

```bash
npm run tauri:dev
```

Nur das Vue-Frontend im Browser starten:

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

## Lokale Daten

Mellow verwendet SQLite über das Tauri-Backend. Die Datenbank wird im App-Data-Verzeichnis des Betriebssystems abgelegt. Es wird keine externe API, keine Cloud und keine externe Datenbank verwendet.

## Lizenz

MIT License
