# Fake Dataset Spec

The dashboard is driven entirely by generated fake data — no backend. This file defines the shape so every
widget computes KPIs from the same consistent source.

## Generation approach

- Use `@faker-js/faker`, called from `src/data/generateFakeData.ts`.
- **Seed it** (`faker.seed(20260827)` or similar) so the demo looks the same every time you reload — a VP
  clicking refresh mid-meeting and seeing wildly different numbers than the last run undermines trust in the
  "data." A separate, explicit "Simulate new data" action (stretch goal in `PLAN.md`) can re-seed on demand.
- Generate once at app start into a Pinia store (or a composable with a module-level cache) rather than
  regenerating per-component-mount — every widget must be reading the *same* generated dataset.
- Default volumes (adjust freely, or use `BRIEF.md` open question #2 if you have real preferences):
  - 5 regions, 8 carriers, ~90 trailing days of daily data, ~150–400 shipments/day → roughly 20–35k
    shipment records. That's enough to make trends and regional differences look real without being slow to
    generate client-side.

## Entities

### Region
```ts
interface Region {
  id: string;          // e.g. "northeast"
  name: string;         // "Northeast"
  code: string;          // "NE"
}
```
Suggested defaults: Northeast, Southeast, Midwest, Southwest, West.

### Carrier
```ts
interface Carrier {
  id: string;
  name: string;          // faker.company.name() flavored as a freight carrier, or a curated fake list
  mode: 'truckload' | 'ltl' | 'rail' | 'air' | 'ocean';
}
```

### Shipment
```ts
interface Shipment {
  id: string;
  originRegionId: string;
  destRegionId: string;
  carrierId: string;
  mode: Carrier['mode'];
  shippedAt: string;       // ISO date
  promisedDeliveryAt: string; // ISO date
  actualDeliveryAt: string | null; // null if in-transit / not yet delivered
  status: 'in_transit' | 'delivered' | 'delayed' | 'exception';
  weightLbs: number;
  valueUsd: number;
}
```
Derivation: `onTime = actualDeliveryAt !== null && actualDeliveryAt <= promisedDeliveryAt`.

### ExceptionEvent
```ts
interface ExceptionEvent {
  id: string;
  shipmentId: string;
  regionId: string;
  carrierId: string;
  raisedAt: string;         // ISO date
  severity: 'low' | 'medium' | 'high';
  category: 'damage' | 'customs_hold' | 'weather_delay' | 'carrier_delay' | 'documentation' | 'lost';
  status: 'open' | 'resolved';
  resolvedAt: string | null;
  description: string;      // short faker-generated sentence
}
```
Severity → status-color mapping follows `DESIGN.md`'s status palette: `high` = critical/red, `medium` =
watch/amber, `low` = informational (can still render as amber at lower visual weight, or a neutral chip —
your call, just stay consistent).

### DailyKpiSnapshot (precomputed rollups — build these from the raw records above, don't hand-author them)
```ts
interface DailyKpiSnapshot {
  date: string;               // ISO date
  regionId: string | 'all';
  shipmentVolume: number;
  onTimeRate: number;          // 0–1
  openExceptions: number;
  avgTransitDays: number;
}
```
Compute this by aggregating `Shipment`/`ExceptionEvent` per day per region (plus an `'all'` region rollup)
once at generation time, and have widgets read from these snapshots rather than re-aggregating thousands of
shipment records on every render.

## KPI → status thresholds (starting point, tune to taste)

| KPI | Good (green) | Watch (amber) | Critical (red) |
|---|---|---|---|
| On-time delivery rate | ≥ 95% | 90–95% | < 90% |
| Open exceptions (company-wide) | < 15 | 15–30 | > 30 |
| Regional on-time rate (per region) | ≥ 93% | 85–93% | < 85% |
| Volume vs. trailing 7-day avg | within ±10% | −10% to −20% | more than −20% (a volume *drop* is the risk signal; a spike is informational, not a "bad" status) |

Keep these thresholds in one place (e.g. `data/thresholds.ts`) so `DESIGN.md`'s StatusChip logic and every
widget reference the same numbers — don't hardcode a "≥95 is green" check inside an individual chart
component.

## Example generated shipment (for reference)

```json
{
  "id": "shp_8f2a1c",
  "originRegionId": "midwest",
  "destRegionId": "northeast",
  "carrierId": "car_3",
  "mode": "truckload",
  "shippedAt": "2026-08-21T14:32:00Z",
  "promisedDeliveryAt": "2026-08-24T17:00:00Z",
  "actualDeliveryAt": "2026-08-24T21:10:00Z",
  "status": "delivered",
  "weightLbs": 18420,
  "valueUsd": 42750
}
```
This one is *not* on-time (`actualDeliveryAt` is after `promisedDeliveryAt`) despite `status: "delivered"` —
that distinction (delivered-but-late vs. actually on-time) is exactly the kind of nuance the real ops team
cares about; make sure the on-time-rate widget computes from the timestamps, not just the `status` field.
