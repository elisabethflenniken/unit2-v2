# CLAUDE.md — instructions for Claude Code in this repo

This file is read automatically by Claude Code when you work in this project folder. Keep it in sync if
plans change — it's the source of truth for *how* to work here, not *what* to build (that's `BRIEF.md`).

## What this project is

FastForward Logistics operations dashboard — a Vue 3 + Vuetify front-end prototype, driven by generated
fake data, for a fictional VP of Operations to use in leadership meetings. Full context: `BRIEF.md`.
Technical plan and phase order: `PLAN.md`. Visual/accessibility rules: `DESIGN.md`. Data shape: `DATA.md`.

**Read all four before writing code.** They're short by design — this isn't optional context.

## Stack quick reference

Vue 3 (Composition API, `<script setup>`, TypeScript) · Vuetify (latest) · Vite · Pinia · Chart.js /
vue-chartjs · @faker-js/faker · @fontsource/open-sans. Full rationale in `PLAN.md`.

## Working conventions

- Build in the phase order from `PLAN.md`. Don't jump to drag-and-drop layout (Phase 7) before the static
  widgets and widget-library add/remove flow (Phases 3–4) work end to end.
- One component per file, `PascalCase.vue`. Composition API with `<script setup lang="ts">` throughout —
  don't mix in Options API.
- New graphic types get one component in `src/widgets/` plus one entry in `src/widgets/registry.ts`. Don't
  hardcode a widget into `DashboardGrid.vue` directly — if it's not going through the registry, the
  "customizable layout" requirement breaks.
- Status colors, thresholds, and the good/watch/critical vocabulary come from `DESIGN.md` and
  `data/thresholds.ts` — don't invent a new color or a fourth status tier ad hoc in a component.
- Every widget needs loading/empty/error states (`DESIGN.md`), not just the happy path.
- Don't add a UI library, CSS framework, or icon set beyond what's in `PLAN.md`'s stack table without
  flagging it first — extra dependencies are easy to add and hard to notice creeping in.
- Run `npm run lint` (and type-check, if configured) before considering a phase finished, and fix warnings
  rather than suppressing them.

## Non-negotiables (re-check these, they're easy to silently regress)

- **Font**: Open Sans, everywhere, including inside Vuetify's own components and Chart.js canvases. See the
  font audit steps in `DESIGN.md` — actually check computed styles, don't assume.
- **Color discipline**: blue = brand/interactive; red/yellow/green = status only, and always paired with an
  icon + text label, never color alone.
- **Theming**: light mode is the default; dark mode is a full, complete theme (not an afterthought) and the
  choice persists across reloads.
- **Accessibility**: WCAG 2.1 AA. Run the checklist in `DESIGN.md` at the end of every phase, not just once
  at the very end of the project.
- **Fake data only**: no real backend calls. If a future task asks you to wire this up to a real API, that's
  a deliberate scope change — flag it rather than assuming.

## When something in the docs is ambiguous or wrong

`BRIEF.md` has an "Open questions" section — if you hit one of those decisions while building, make the
reasonable default called out there, note what you assumed in your response, and keep going rather than
stalling. If you hit an ambiguity *not* covered by that section, same approach: state the assumption
plainly and proceed, don't block on it.
