# Implementation Plan: FastForward Logistics Dashboard

Read `BRIEF.md` first for the *why*. This is the *how*.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Vue 3 (`<script setup>`, Composition API) | Requested; modern default. |
| Build tool | Vite | Vuetify's official scaffold uses it; fast dev server. |
| Components | Vuetify (latest major — **v4** as of this writing) | Requested; ships light/dark theming, accessible components, and a full layout/grid system out of the box. |
| State | Pinia | Standard Vue 3 state store; holds dashboard layout config, active filters, and theme mode. |
| Charts | `vue-chartjs` + `chart.js` | Lightweight, accessible (renders to canvas with a text/table fallback path we control), themeable to match Vuetify tokens. Alternative: `vue-echarts` if you want more chart types out of the box — swap freely, the widget system (below) doesn't care which lib renders a widget. |
| Dashboard grid | `grid-layout-plus` (actively-maintained Vue 3 fork of the classic `vue-grid-layout`) | Gives drag/resize/reflow for free. If you decide drag-and-drop is out of scope (see `BRIEF.md` open question #3), skip this and use a plain CSS grid with fixed slots instead — see Phase 3 below. |
| Fake data | `@faker-js/faker` | Generates realistic freight/logistics-shaped data; seedable for reproducible demos. |
| Fonts | `@fontsource/open-sans` (self-hosted npm package, not a CDN `<link>`) | Guarantees Open Sans loads offline/on a locked-down network and isn't dependent on Google Fonts uptime during a live leadership demo. |
| Routing | `vue-router` (optional) | Only needed if the full-screen widget view should be its own URL (`BRIEF.md` open question #4). Skip if it stays a modal/overlay. |

**Version note:** don't hand-pin exact version numbers into `package.json` from this doc — they'll be stale
by the time you build. Scaffold with `npm create vuetify@latest` (it resolves current Vue/Vuetify/Vite
versions for you), then `npm install` the remaining packages above at whatever their current `latest` is.

## Architecture overview

```
src/
  App.vue
  main.ts
  plugins/
    vuetify.ts          # theme definitions (light + dark), Open Sans as default font, defaults
  stores/
    dashboard.ts         # pinia: which widgets are active, their grid position/size, layout name
    filters.ts            # pinia: global filters (date range, region, carrier...)
    theme.ts               # pinia or composable: light/dark mode, persisted to localStorage
  data/
    generateFakeData.ts   # faker-based generator, seeded
    types.ts                # Shipment, Region, Carrier, ExceptionEvent, KpiSnapshot (see DATA.md)
    thresholds.ts            # good/watch/critical thresholds per KPI (see DATA.md) — single source of truth
  widgets/
    registry.ts            # the catalog of all available widgets: id, title, description, component, default size
    KpiCard.vue
    VolumeTrendChart.vue
    OnTimeRateChart.vue
    RegionalPerformanceChart.vue
    ExceptionsTable.vue
    ...
  components/
    dashboard/
      DashboardGrid.vue     # renders active widgets in the grid-layout-plus (or CSS grid) container
      WidgetCard.vue         # shared chrome: title, status chip, filter icon, expand icon, overflow menu
      WidgetLibraryPanel.vue # drawer listing inactive widgets with "add" action
      GlobalFilterBar.vue
      FullscreenWidgetDialog.vue  # or a route, per BRIEF.md open question #4
    common/
      StatusChip.vue          # color + icon + text, never color alone (see DESIGN.md)
  views/
    DashboardView.vue
  App.vue
```

**Widget registry pattern** (this is what makes the layout "customizable" without a developer): every
graphic is registered once in `widgets/registry.ts` as `{ id, title, description, component, defaultSize,
category }`. `WidgetLibraryPanel.vue` reads the registry, diffs it against `stores/dashboard.ts`'s active
widget list, and lets the user add/remove by id. `DashboardGrid.vue` never hardcodes which widgets exist —
it just renders whatever's active. Adding a *new kind* of graphic later means writing one component and
adding one registry entry; it doesn't touch the grid or the panel.

**Full-screen detail pattern**: `WidgetCard.vue`'s expand action passes the widget's id (and current
filters) to `FullscreenWidgetDialog.vue`, which renders the *same* widget component at a larger size with
`detailLevel="full"` — build each widget component to render a richer view (extra breakdown, underlying
data table) when that prop is set, rather than building a second "detail version" of every chart.

## Phased build plan

Work in this order; each phase should leave the app runnable. Ask Claude Code to commit (or at least pause
for a look) at the end of each phase.

**Phase 0 — Scaffold**
`npm create vuetify@latest` (Vue 3 + Vuetify, TypeScript, Pinia, ESLint). Install `@fontsource/open-sans`,
`@faker-js/faker`, `chart.js` + `vue-chartjs`. Confirm dev server runs.

**Phase 1 — Theme & shell**
Set up `plugins/vuetify.ts` with the light/dark theme tokens from `DESIGN.md`, wire Open Sans as the global
font, build the app shell (top bar with company name + dark-mode toggle, main content area), confirm dark
mode toggles cleanly with no unstyled/default-Vuetify-purple leftovers.

**Phase 2 — Fake data layer**
Build `data/types.ts` and `data/generateFakeData.ts` per `DATA.md`. Sanity-check output in the browser
console before wiring any UI to it — get the data right first.

**Phase 3 — Core widgets, static layout**
Build the KPI cards and the four core graphics (volume trend, on-time rate, regional performance,
exceptions) as widgets, laid out in a fixed grid (plain CSS grid is fine here — don't add `grid-layout-plus`
yet). Get these reading real (fake) data and showing correct status colors before touching customization.

**Phase 4 — Widget library & add/remove**
Build the registry, `WidgetLibraryPanel.vue`, and the add/remove flow against `stores/dashboard.ts`. At this
point "static layout" becomes "user-controlled set of widgets."

**Phase 5 — Full-screen detail view**
Build `FullscreenWidgetDialog.vue` (or the route version) and the `detailLevel` prop on each widget.

**Phase 6 — Filtering**
Build `GlobalFilterBar.vue` and wire `stores/filters.ts` through to each widget's data computation.

**Phase 7 — Drag/resize (optional, do this last)**
Only if you decided drag-and-drop matters (`BRIEF.md` open question #3): swap the Phase 3 static grid for
`grid-layout-plus`, persist layout to `localStorage`. This is the most disposable phase — the dashboard is
fully functional and demoable without it.

**Phase 8 — Accessibility & polish pass**
Full sweep against the `DESIGN.md` checklist: run Lighthouse and an axe scan, verify keyboard-only
operation of every interactive element (add/remove widget, expand, filter, theme toggle), verify contrast
in both themes, verify Open Sans is applied everywhere (see "Font audit" below).

## Font audit (do this explicitly, don't assume)

Vuetify components sometimes ship their own font-family declarations, and it's easy for a stray default
font to survive in a dialog, tooltip, or chart legend. Before calling the app done:

1. Set Open Sans as the `body` font *and* explicitly in the Vuetify theme's typography defaults.
2. Set Chart.js's global `Chart.defaults.font.family` to Open Sans too — charts render to canvas and don't
   inherit page CSS automatically.
3. Grep the built app / dev tools computed styles for any element still resolving to a fallback font
   (browser dev tools → inspect → Computed → font-family is the fastest check).

## Verification checklist before calling any phase "done"

- `npm run dev` runs with no console errors.
- `npm run lint` (and `type-check` if using TS) pass.
- Manual keyboard-only pass: tab through the whole dashboard, including inside the widget library drawer
  and full-screen dialog; nothing is a mouse-only trap.
- Toggle dark mode; check every screen, not just the dashboard.
- Resize the browser down to a laptop width; nothing overlaps or clips.

## Stretch ideas (only after v1 works end-to-end)

- "Simulate refresh" button that regenerates fake data to show the dashboard reacting to change.
- Export a widget or the whole dashboard to PNG/PDF for dropping into slides.
- Multiple named layout presets ("Leadership view" vs. "Ops daily view").
- CSV export of the underlying data behind any chart.
