# Design & Accessibility Guide

This is the style contract for the whole app. Every screen Claude Code builds should be checked against
this file, not just the first one.

## Typography — Open Sans, everywhere, no exceptions

- Install `@fontsource/open-sans` (weights 400, 500, 600, 700) and import it once in `main.ts`. Do **not**
  load it from a Google Fonts `<link>` — self-hosting avoids a flash of fallback font and works with no
  network access during a live demo.
- Set it as the `body` font in global CSS **and** explicitly in the Vuetify theme/typography defaults —
  Vuetify components don't reliably inherit `body`'s font-family for every internal element.
- Set Chart.js's global default (`Chart.defaults.font.family = '"Open Sans", sans-serif'`) — canvas-rendered
  charts do not inherit page CSS at all.
- Fallback stack: `"Open Sans", -apple-system, "Segoe UI", Roboto, sans-serif` (fallback only matters in the
  instant before the font loads).
- **Before shipping, verify.** Vuetify ships its own default font in a few components (dialogs, tooltips,
  menus have caused this before). Open dev tools, inspect several different component types (a chip, a
  dialog, a chart legend, a table header), and check the *computed* `font-family` is Open Sans on each —
  don't trust that setting it once at the top propagated everywhere.
- Type scale: use Vuetify's default type scale (`text-h1`...`text-body-2`, etc.) rather than inventing
  custom font sizes — keeps things consistent and already accessible-by-default (no need to hand-tune line
  heights).

## Color system

**Principle: color is the *least* important signal, never the only one.** Every status indicator pairs
color with an icon and a text label. A colorblind VP in the room, or a black-and-white printout of a slide,
should still be legible.

**Blue is the brand/interactive color. Red/yellow/green are reserved exclusively for status.** Don't use
green for a "primary" button or blue for a "success" state — keeping the vocabulary strict is what makes
status scannable at a glance.

### Light theme (default)

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `primary` | `#1565C0` | Brand color: header, primary buttons, links, active nav, chart accent lines | 5.75:1 on white |
| `primary-darken` | `#0D47A1` | Hover/pressed states, text needing extra contrast | 8.63:1 on white |
| `primary-lighten` | `#E3F2FD` | Subtle backgrounds (selected row, active filter chip fill) | background only, not text |
| `background` | `#F5F7FA` | App background | — |
| `surface` | `#FFFFFF` | Card/panel background | — |
| `on-surface` (body text) | `#212121` | Primary text | 16.1:1 on white |
| `on-surface-variant` (secondary text) | `#616161` | Captions, secondary labels, axis labels | 6.19:1 on white |
| `outline` | `#E0E0E0` | Borders, dividers | non-text |

### Status colors (light theme)

| Status | Fill (chip/badge bg) | Text-on-fill | Icon | Notes |
|---|---|---|---|---|
| Good / On-target | `#2E7D32` (filled) or `#E8F5E9` (subtle bg) | white on filled / `#1B5E20` on subtle | `mdi-check-circle` | 5.13:1 (white on filled) |
| Watch / At-risk | `#FFD54F` (filled) | dark text `#3E2723` | `mdi-alert` | 9.80:1 — **amber only works as a filled chip with dark text.** Amber/orange text directly on white background fails AA (measured 2.3–3.8:1 depending on shade) — never use amber as standalone colored text or a thin icon-only cue. |
| Critical / Exception | `#C62828` (filled) or `#FFEBEE` (subtle bg) | white on filled / `#B71C1C` on subtle | `mdi-close-circle` | 5.62:1 (white on filled) |

### Dark theme

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `primary` | `#90CAF9` | Brand/interactive color on dark backgrounds | 10.71:1 on `#121212` |
| `background` | `#121212` | App background | — |
| `surface` | `#1E1E1E` | Card/panel background | — |
| `on-surface` (body text) | `#E0E0E0` | Primary text | 14.19:1 |
| `on-surface-variant` | `#B0B0B0` | Secondary text | 8.64:1 |
| `outline` | `#3A3A3A` | Borders, dividers | non-text |

### Status colors (dark theme)

| Status | Color | Contrast on `#121212` |
|---|---|---|
| Good | `#81C784` | 9.31:1 |
| Watch | `#FFD54F` (pair with dark-on-chip as in light mode, or use as text directly here — it's dark-surface safe) | 13.28:1 |
| Critical | `#E57373` | 6.27:1 |

All numbers above are calculated WCAG relative-luminance contrast ratios, not estimates — re-verify with a
contrast checker (or the same formula) if you change any hex value.

### Implementation

Define both themes in `plugins/vuetify.ts` using Vuetify's `theme` config (`themes: { light: {...}, dark:
{...} }`, `defaultTheme: 'light'`). Toggle via a Pinia store or composable that also writes the choice to
`localStorage` so it persists across reloads; on first load with no stored preference, it's fine to default
to light per the brief rather than reading `prefers-color-scheme` (leadership-meeting laptop won't
necessarily be in the presenter's preferred mode).

## Component patterns

- **StatusChip**: the one component that renders status everywhere (KPI cards, table rows, widget
  headers). Always icon + label + color fill, per the table above. Never let a second, ad-hoc "just color
  the text red" pattern creep in elsewhere.
- **KPI card**: big number, label, trend indicator (↑/↓ + %), StatusChip, and a sparkline if space allows.
  Keep hierarchy: number is the largest element on the card, everything else is secondary.
- **WidgetCard chrome**: every graphic on the dashboard shares the same header — title, optional filter
  icon, expand-to-fullscreen icon, overflow menu ("remove from dashboard"). Consistent chrome is what makes
  the "customizable layout" read as one coherent product instead of a pile of different widgets.
- **Empty / loading / error states**: every widget needs all three (skeleton loader while fake data
  "loads," a clear empty state if a filter returns nothing, an error state if a widget fails to render) —
  don't let a widget silently show nothing.
- Keep visual density moderate: this is read from across a conference room, not squinted at up close.
  Prefer fewer, larger, clearer graphics over cramming everything onto one screen.

## Accessibility checklist (WCAG 2.1 AA)

Run through this at the end of every phase in `PLAN.md`, not just once at the end of the project:

- **Contrast**: all text meets 4.5:1 (normal) / 3:1 (large text, 18pt+/14pt+bold) against its background in
  *both* themes — use the tokens above, don't introduce new colors ad hoc.
- **Color independence**: every status/meaning conveyed by color also has a text label or icon (see
  StatusChip above). Test by viewing a screenshot in grayscale.
- **Keyboard operability**: every interactive element — add/remove widget, expand to full screen, close
  full screen, apply a filter, toggle dark mode, drag/resize if implemented — is reachable and operable via
  Tab/Shift+Tab/Enter/Space/Escape alone. No mouse-only affordances.
- **Focus visibility**: a visible focus ring on every focusable element in both themes (don't let a custom
  style accidentally remove Vuetify's default focus outline).
- **Semantic structure**: proper heading hierarchy (one `h1`, logical `h2`/`h3` nesting), landmark regions
  (`<nav>`, `<main>`), and real `<button>`/`<a>` elements rather than clickable `<div>`s.
- **Charts have a non-visual fallback**: each chart widget's full-screen/detail view includes (or links to)
  the underlying data as a real HTML `<table>` — screen reader users and printouts shouldn't be locked out
  of the data a canvas chart renders.
- **`aria-label`s** on icon-only buttons (expand, remove, filter icons) — an icon alone is not accessible.
- **Motion**: respect `prefers-reduced-motion` for any transition/animation (widget expand, theme
  crossfade); keep them subtle regardless.
- **Text resize**: layout doesn't break at 200% browser zoom / text-size increase.
- **Don't rely on placeholder/hint text as the only label** for any filter input — use real `<label>`s
  (Vuetify's `label` prop handles this correctly by default; don't override it away).

Automated tools (axe DevTools browser extension, Lighthouse accessibility audit) catch maybe 30–40% of real
issues — always pair them with the manual keyboard/grayscale passes above.
