# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run check        # Type-check with svelte-check
npm run lint         # Prettier + ESLint check
npm run format       # Auto-format with Prettier
npm run test         # Run all tests (single run)
npm run test:unit    # Run tests in watch mode
```

Run a single test file:
```bash
npx vitest run src/lib/path/to/file.spec.ts
```

## Architecture

SvelteKit 2 + Svelte 5 app with Tailwind CSS v4, TypeScript, and Vitest.

**Svelte 5 runes mode** is enforced project-wide via `svelte.config.js` — all components use the runes API (`$props()`, `$state()`, `$derived()`, etc.), not the legacy Options API.

**Test split** (configured in `vite.config.ts`):
- `*.svelte.spec.ts` / `*.svelte.test.ts` — browser tests via Playwright (Chromium, headless), for component rendering
- `*.spec.ts` / `*.test.ts` (non-svelte) — Node environment, for pure logic

**Path alias**: `$lib` → `src/lib/`

**CSS**: Tailwind v4 is loaded as a Vite plugin (`@tailwindcss/vite`); global base styles live in `src/routes/layout.css`.

## Module map

```
src/lib/
  types/index.ts          — all shared TypeScript types
  i18n/
    de.ts                 — German translation strings (source of truth)
    index.ts              — t() helper; swap for real i18n library here
  parsing/
    kml.ts / gpx.ts       — format-specific parsers using DOMParser
    index.ts              — auto-detects format from file extension
  processing/
    coordinates.ts        — WGS84 ↔ LV95 conversion + haversine distance
    simplify.ts           — Douglas-Peucker polyline simplification
    snap.ts               — snap a marker to nearest route point
    pipeline.ts           — main processing pipeline (validate → build → assemble)
  providers/
    swisstopo.ts          — Swisstopo elevation profile API (no auth required)
  calculation/
    leistungskilometer.ts — SAC Leistungskilometer formula
    index.ts              — full RouteCalculation + time formatting helpers
  stores/
    app.svelte.ts         — single AppStore class with $state; handles
                            recalc, localStorage hydration/persistence
  components/
    FileUpload.svelte     — drag-and-drop; triggers full processing pipeline
    RouteMap.svelte       — Leaflet map (lazy-loaded; Swisstopo tile layer)
    ElevationChart.svelte — Chart.js area chart (lazy-loaded)
    RouteTable.svelte     — per-leg table; inline editing of names & breaks
    RouteSummary.svelte   — summary stat cards
    SpeedSettings.svelte  — speed preset + custom speed + departure time

src/routes/
  +page.svelte            — main app (idle → loading → error → ready states)
  print/+page.svelte      — printable Marschzeittabelle; reads from localStorage
```

## Key data flow

```
File drop → parseFile() → validateRegion() → prepareForApi()
         → fetchElevationProfile() [Swisstopo API]
         → assembleRoute() → app.setReady()
         → calculate() [pure, re-runs on settings change]
```

The `AppStore` in `app.svelte.ts` is the single source of truth. Components read `app.route`, `app.calculation`, `app.settings` and mutate via store methods (`app.setSpeed()`, `app.updateMarkerBreak()`, etc.) which trigger `recalculate()` automatically.

## i18n

All user-visible strings are in `src/lib/i18n/de.ts`. The `t()` function in `src/lib/i18n/index.ts` is the only call site — replacing it with `$t` from svelte-i18n or Paraglide is the only change needed to add a real i18n library.
