# FastForward Logistics — Operations Dashboard

A front-end prototype of an internal operations dashboard for FastForward Logistics, a fictional mid-size
freight and supply chain company. Built so a VP of Operations can open one screen and answer "how is the
business running right now?" in a leadership meeting — no spreadsheets, no manual assembly.

The app is driven entirely by generated fake data (see `DATA.md`); there is no backend, database, or
authentication in this version.

## Documentation

- [`BRIEF.md`](BRIEF.md) — who this is for, goals, and scope
- [`PLAN.md`](PLAN.md) — tech stack, architecture, and phased build plan
- [`DESIGN.md`](DESIGN.md) — visual style guide: color, typography, theming, accessibility rules
- [`DATA.md`](DATA.md) — the fake dataset schema and generation approach
- [`CLAUDE.md`](CLAUDE.md) — standing instructions for Claude Code while working in this repo

## Stack

- Vue 3 (Composition API, `<script setup>`, TypeScript)
- Vuetify — component library and theming
- Vite — dev server and build
- Pinia — state (dashboard layout, filters, theme)
- Chart.js / vue-chartjs — trend and comparison charts
- @faker-js/faker — fake dataset generation
- @fontsource/open-sans — self-hosted brand typeface

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run dev
```

The dev server prints a local URL (defaults to `http://localhost:3000`).

## Available scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run build-only` | Build without type-checking |
| `npm run preview` | Serve the production build locally |
| `npm run type-check` | Run `vue-tsc` across the project |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with autofix |

Run lint and type-check before considering any change finished.

## What's on the dashboard

- **KPI cards** — shipment volume, on-time delivery rate, open exceptions
- **Trend charts** — shipment volume and on-time delivery rate over time
- **Regional performance** — on-time delivery rate by region
- **Exceptions table** — open exception events by severity, with a detail view per row
- **Global filters** — date range and region, applied across every widget
- **Widget customization** — a "Customize Dashboard" panel to add/remove graphics from the layout
- **Light/dark theme** — user-toggleable, persisted across reloads

## Project structure

```
src/
  App.vue                  — root component (app bar, theme toggle, layout)
  views/DashboardView.vue  — the dashboard screen
  components/
    dashboard/              — dashboard chrome: widget card, grid, filter bar,
                              widget library panel, fullscreen widget dialog
    common/                 — shared UI: StatusChip, DataTable, Sparkline
  widgets/                  — one component per graphic type, plus registry.ts
                              (the catalog DashboardGrid and WidgetLibraryPanel
                              read from — add a widget here, not by hardcoding
                              it into the grid)
  stores/                   — Pinia stores: dashboard layout, filters, theme, UI state
  data/                     — fake data generation, selectors, status thresholds, types
  composables/               — useWidgetData: shared loading/empty/error state handling
  plugins/                  — Vuetify, Chart.js setup
  utils/                    — date formatting, chart theme helpers
  styles/                   — global CSS and Vuetify SCSS settings
```

## Notes for contributors

- One component per file, PascalCase, Composition API throughout — see `CLAUDE.md` for the full working
  conventions.
- New graphic types are added via `src/widgets/` + one entry in `src/widgets/registry.ts`, never hardcoded
  into `DashboardGrid.vue`.
- Status colors and the good/watch/critical vocabulary live in `DESIGN.md` and `src/data/thresholds.ts` —
  don't invent new ones ad hoc.
- Every widget needs loading, empty, and error states, not just the happy path.
