# Project Brief: FastForward Logistics Operations Dashboard

## The story

FastForward Logistics is a fictional mid-size freight and supply chain company. Their ops team currently
runs on spreadsheets. The VP of Operations wants one internal dashboard she can pull up live in leadership
meetings to answer, at a glance: **how is the business running right now?**

FastForward has no in-house dev team — that's why "we" (you + Claude Code) are building it.

## Who this is for

- **Primary user: VP of Operations.** Non-technical, time-poor, presenting to leadership. She needs the
  story of the business in under 10 seconds per screen, with the ability to drill in live if someone in
  the room asks a follow-up question.
- **Secondary user: the ops team.** They may use the same dashboard day-to-day to spot problems (a region
  slipping, exceptions piling up) before they become a leadership-meeting surprise.

Design for the VP's meeting first, the ops team's daily use second.

## Problem statement

There is no single source of truth for operational health. Volume, on-time performance, regional
breakdowns, and exceptions all live in separate spreadsheets that someone manually assembles before every
meeting. We're replacing that manual assembly with a living dashboard.

## Goals

1. **Answer "is the business healthy?" at a glance** — top-level KPIs and status indicators visible
   without scrolling or clicking.
2. **Support "why?" follow-ups live in the room** — filtering and a full-screen/detail view for any chart,
   without leaving the dashboard or breaking presentation flow.
3. **Let the dashboard grow without a developer** — a widget library / "add a graphic" panel so the VP (or
   whoever owns this later) can customize what's on screen without touching code.
4. **Be presentable on a projector and readable on a laptop** — high contrast, no dependence on color alone,
   legible at a distance, professional and calm (not "startup dashboard" neon).

## Core capabilities (must-have)

- **KPI / health overview**: shipment volume, on-time delivery rate, regional performance, open exceptions
  — each with a clear status indicator (good / watch / at-risk), not just a raw number.
- **Data graphics**: trend charts (volume over time), a delivery-performance visualization, a
  region-by-region comparison, and an exceptions list/table with severity.
- **Customizable layout**:
  - A panel/drawer listing available graphics not currently on the dashboard, with an "add" action.
  - Ability to remove a graphic from the dashboard.
  - Ability to reorder / resize graphics (stretch: drag-and-drop; minimum: a defined set of layout slots).
  - Any graphic can be expanded to full screen for a detailed view (more granular breakdown, larger chart,
    underlying data table).
- **Filtering**: at minimum a global date range and region filter that all graphics respect; nice-to-have —
  per-widget filter overrides.
- **Theming**: light mode by default, user-toggleable dark mode, persisted across sessions.
- **Accessibility**: WCAG 2.1 AA across the whole app (see `DESIGN.md`).

## Explicitly out of scope (v1)

- Real backend, real authentication, or a real database — this is a front-end prototype driven entirely by
  a generated fake dataset (see `DATA.md`). Building it with a realistic data *shape* now means swapping in
  a real API later is a data-layer change, not a redesign.
- Multi-user accounts, saved-layout-per-user, or permissions.
- Real-time push updates (a "refresh" affordance that re-randomizes/re-fetches fake data is enough to
  demonstrate the concept).
- Mobile-first design — optimize for desktop/laptop and projector; a reasonable tablet breakpoint is a
  bonus, not a requirement.

## Success criteria

- A VP-persona user can open the dashboard cold and correctly describe overall company health within 10
  seconds.
- Every number on screen has a status color *and* a text/icon cue — color blindness doesn't hide meaning.
- At least one chart can be filtered, expanded to full screen, and removed/re-added via the widget panel,
  end to end, without a page reload.
- Dark mode toggle works everywhere with no unreadable text or broken contrast.
- Lighthouse accessibility score ≥ 95, and a manual pass finds no WCAG AA violations (see `DESIGN.md`
  checklist).

## Assumptions (flag if wrong)

- "Fake data set" means realistically-shaped, generated/mock data bundled with the app — not a live API.
- One shared dashboard configuration is fine for v1 (no per-user login).
- Vue 3 + Vuetify per your request; see `PLAN.md` for the full stack and rationale.
- This will be developed and run locally in VS Code (dev server), not deployed to production infrastructure,
  unless you tell Claude Code otherwise later.

## Open questions for you

These don't block starting — Claude Code can make reasonable defaults per `PLAN.md` — but worth deciding
early:

1. Any real FastForward branding/logo, or is "FastForward Logistics" purely a placeholder name/wordmark?
2. Roughly how many regions/carriers should the fake data simulate (e.g., 5 regions, 8 carriers)? `DATA.md`
   defaults to something reasonable if you don't have a preference.
3. Is drag-and-drop rearranging a must for v1, or is "add/remove from a fixed grid of slots" enough to
   start? (`PLAN.md` phases this so you can stop after the simpler version if time-boxed.)
4. Should the full-screen detail view live in a modal/overlay, or navigate to its own route (shareable URL)?

## Companion documents

- `PLAN.md` — tech stack, architecture, and phased build plan.
- `DESIGN.md` — visual style guide: color, typography, theming, and accessibility rules.
- `DATA.md` — the fake dataset schema and generation approach.
- `CLAUDE.md` — standing instructions for Claude Code while working in this repo.
