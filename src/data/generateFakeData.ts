// data/generateFakeData.ts
//
// Generates the entire fake dataset once, seeded, per DATA.md. Consumed via the `useFakeData()`
// module-level cache below so every widget reads the same generated records.
import type {
  Carrier,
  CarrierMode,
  DailyKpiSnapshot,
  ExceptionCategory,
  ExceptionEvent,
  ExceptionSeverity,
  GeneratedData,
  Region,
  Shipment,
  ShipmentStatus,
} from './types'
import { faker } from '@faker-js/faker'

const SEED = 20_260_827
const TRAILING_DAYS = 90
const MIN_SHIPMENTS_PER_DAY = 150
const MAX_SHIPMENTS_PER_DAY = 400

const REGION_DEFS: Array<{ id: string, name: string, code: string, reliability: number, volumeWeight: number }> = [
  { id: 'northeast', name: 'Northeast', code: 'NE', reliability: 0.96, volumeWeight: 1.2 },
  { id: 'southeast', name: 'Southeast', code: 'SE', reliability: 0.93, volumeWeight: 1 },
  { id: 'midwest', name: 'Midwest', code: 'MW', reliability: 0.97, volumeWeight: 1.3 },
  { id: 'southwest', name: 'Southwest', code: 'SW', reliability: 0.9, volumeWeight: 0.8 },
  { id: 'west', name: 'West', code: 'W', reliability: 0.86, volumeWeight: 0.9 },
]

const CARRIER_DEFS: Array<{ name: string, mode: CarrierMode, reliabilityModifier: number }> = [
  { name: 'Ironhide Freight Co.', mode: 'truckload', reliabilityModifier: 0.01 },
  { name: 'Meridian Trucking', mode: 'truckload', reliabilityModifier: -0.02 },
  { name: 'Blue Harbor Logistics', mode: 'ltl', reliabilityModifier: 0 },
  { name: 'Prairie Line LTL', mode: 'ltl', reliabilityModifier: -0.03 },
  { name: 'Summit Rail Lines', mode: 'rail', reliabilityModifier: 0.02 },
  { name: 'Falcon Air Cargo', mode: 'air', reliabilityModifier: 0.02 },
  { name: 'Tidewater Ocean Transport', mode: 'ocean', reliabilityModifier: -0.01 },
  { name: 'Redline Truckload Partners', mode: 'truckload', reliabilityModifier: 0 },
]

const TRANSIT_DAYS_BY_MODE: Record<CarrierMode, { min: number, max: number }> = {
  truckload: { min: 2, max: 4 },
  ltl: { min: 3, max: 6 },
  rail: { min: 5, max: 9 },
  air: { min: 1, max: 2 },
  ocean: { min: 14, max: 25 },
}

const WEIGHT_LBS_BY_MODE: Record<CarrierMode, { min: number, max: number }> = {
  truckload: { min: 5000, max: 45_000 },
  ltl: { min: 150, max: 15_000 },
  rail: { min: 20_000, max: 120_000 },
  air: { min: 50, max: 5000 },
  ocean: { min: 10_000, max: 150_000 },
}

const VALUE_PER_LB_BY_MODE: Record<CarrierMode, { min: number, max: number }> = {
  truckload: { min: 1.5, max: 4 },
  ltl: { min: 2, max: 6 },
  rail: { min: 0.5, max: 2 },
  air: { min: 6, max: 20 },
  ocean: { min: 0.3, max: 1.5 },
}

const EXCEPTION_CATEGORIES: ExceptionCategory[] = [
  'damage',
  'customs_hold',
  'weather_delay',
  'carrier_delay',
  'documentation',
  'lost',
]

function addDays (date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function addHours (date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000)
}

function dateOnly (date: Date): string {
  return date.toISOString().slice(0, 10)
}

function clamp (value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function earlierOf (a: Date, b: Date): Date {
  return a.getTime() < b.getTime() ? a : b
}

function laterOf (a: Date, b: Date): Date {
  return a.getTime() > b.getTime() ? a : b
}

function weightedPick<T> (items: T[], weightOf: (item: T) => number): T {
  const total = items.reduce((sum, item) => sum + weightOf(item), 0)
  let roll = faker.number.float({ min: 0, max: total })
  for (const item of items) {
    roll -= weightOf(item)
    if (roll <= 0) {
      return item
    }
  }
  return items.at(-1)!
}

function buildRegions (): Region[] {
  return REGION_DEFS.map(r => ({ id: r.id, name: r.name, code: r.code }))
}

function buildCarriers (): Carrier[] {
  return CARRIER_DEFS.map((c, index) => ({
    id: `car_${index + 1}`,
    name: c.name,
    mode: c.mode,
  }))
}

function pickExceptionSeverity (): ExceptionSeverity {
  const roll = faker.number.float({ min: 0, max: 1 })
  if (roll < 0.5) {
    return 'low'
  }
  if (roll < 0.85) {
    return 'medium'
  }
  return 'high'
}

function buildExceptionForShipment (shipment: Shipment, regionId: string, now: Date): ExceptionEvent {
  const raisedAt = addHours(new Date(shipment.shippedAt), faker.number.float({ min: 2, max: 72 }))
  const cappedRaisedAt = raisedAt > now ? now : raisedAt
  const daysSinceRaised = (now.getTime() - cappedRaisedAt.getTime()) / (1000 * 60 * 60 * 24)
  const resolveProbability = clamp(daysSinceRaised / 6, 0, 0.98)
  const isResolved = faker.number.float({ min: 0, max: 1 }) < resolveProbability

  let resolvedAt: string | null = null
  if (isResolved) {
    const resolved = addHours(cappedRaisedAt, faker.number.float({ min: 4, max: 220 }))
    resolvedAt = earlierOf(resolved, now).toISOString()
  }

  return {
    id: `exc_${shipment.id}`,
    shipmentId: shipment.id,
    regionId,
    carrierId: shipment.carrierId,
    raisedAt: cappedRaisedAt.toISOString(),
    severity: pickExceptionSeverity(),
    category: faker.helpers.arrayElement(EXCEPTION_CATEGORIES),
    status: isResolved ? 'resolved' : 'open',
    resolvedAt,
    description: faker.lorem.sentence({ min: 6, max: 14 }),
  }
}

function buildShipment (params: {
  index: number
  dayIndex: number
  shipDate: Date
  now: Date
  regions: ReturnType<typeof buildRegions>
  carriers: Carrier[]
}): { shipment: Shipment, exception: ExceptionEvent | null } {
  const { index, dayIndex, shipDate, now, carriers } = params

  const origin = weightedPick(REGION_DEFS, r => r.volumeWeight)
  const sameRegionDelivery = faker.number.float({ min: 0, max: 1 }) < 0.15
  const dest = sameRegionDelivery
    ? origin
    : weightedPick(REGION_DEFS.filter(r => r.id !== origin.id), r => r.volumeWeight)

  const carrierIndex = faker.number.int({ min: 0, max: CARRIER_DEFS.length - 1 })
  const carrierDef = CARRIER_DEFS[carrierIndex]
  const carrier = carriers[carrierIndex]

  const shippedAt = addHours(shipDate, faker.number.float({ min: 6, max: 20 }))

  const transitRange = TRANSIT_DAYS_BY_MODE[carrierDef.mode]
  const transitDays = faker.number.float({ min: transitRange.min, max: transitRange.max })
  const promisedDeliveryAt = addHours(shippedAt, transitDays * 24)

  const weightRange = WEIGHT_LBS_BY_MODE[carrierDef.mode]
  const weightLbs = Math.round(faker.number.float({ min: weightRange.min, max: weightRange.max }))
  const valuePerLbRange = VALUE_PER_LB_BY_MODE[carrierDef.mode]
  const valueUsd = Math.round(weightLbs * faker.number.float({ min: valuePerLbRange.min, max: valuePerLbRange.max }))

  const id = `shp_${dayIndex}_${index}`

  const effectiveOnTimeProb = clamp(origin.reliability + carrierDef.reliabilityModifier, 0.5, 0.99)
  const exceptionProbability = 0.015 + (1 - origin.reliability) * 0.25

  let status: ShipmentStatus
  let actualDeliveryAt: string | null

  const isException = faker.number.float({ min: 0, max: 1 }) < exceptionProbability

  if (isException) {
    status = 'exception'
    actualDeliveryAt = null
  } else if (promisedDeliveryAt > now) {
    status = 'in_transit'
    actualDeliveryAt = null
  } else {
    const isOnTime = faker.number.float({ min: 0, max: 1 }) < effectiveOnTimeProb
    if (isOnTime) {
      const delivered = addHours(promisedDeliveryAt, -faker.number.float({ min: 0, max: 20 }))
      actualDeliveryAt = laterOf(delivered, shippedAt).toISOString()
      status = 'delivered'
    } else {
      const stillPending = faker.number.float({ min: 0, max: 1 }) < 0.1
      if (stillPending) {
        status = 'delayed'
        actualDeliveryAt = null
      } else {
        const delivered = addHours(promisedDeliveryAt, faker.number.float({ min: 1, max: 96 }))
        actualDeliveryAt = earlierOf(delivered, now).toISOString()
        status = 'delivered'
      }
    }
  }

  const shipment: Shipment = {
    id,
    originRegionId: origin.id,
    destRegionId: dest.id,
    carrierId: carrier.id,
    mode: carrierDef.mode,
    shippedAt: shippedAt.toISOString(),
    promisedDeliveryAt: promisedDeliveryAt.toISOString(),
    actualDeliveryAt,
    status,
    weightLbs,
    valueUsd,
  }

  const exception = status === 'exception' ? buildExceptionForShipment(shipment, origin.id, now) : null

  return { shipment, exception }
}

function buildDailySnapshots (
  regions: Region[],
  shipments: Shipment[],
  exceptions: ExceptionEvent[],
  now: Date,
): DailyKpiSnapshot[] {
  const regionIds = new Set(['all', ...regions.map(r => r.id)])
  const keyFor = (date: string, regionId: string) => `${date}|${regionId}`

  // Volume is keyed by ship date — every shipment counts the moment it ships.
  const volumeBuckets = new Map<string, number>()
  for (const shipment of shipments) {
    const date = dateOnly(new Date(shipment.shippedAt))
    for (const regionId of ['all', shipment.originRegionId]) {
      const key = keyFor(date, regionId)
      volumeBuckets.set(key, (volumeBuckets.get(key) ?? 0) + 1)
    }
  }

  // On-time rate is keyed by promised delivery date, counting only shipments whose promised
  // date has already passed — otherwise a shipment that shipped yesterday but isn't due for a
  // week yet would count as "on time" simply because it hasn't had the chance to be late.
  const nowIso = now.toISOString()
  const performanceBuckets = new Map<string, { resolved: number, onTime: number, transitDaysSum: number, transitCount: number }>()
  for (const shipment of shipments) {
    if (shipment.promisedDeliveryAt > nowIso) {
      continue
    }
    const date = dateOnly(new Date(shipment.promisedDeliveryAt))
    const onTime = shipment.actualDeliveryAt !== null && shipment.actualDeliveryAt <= shipment.promisedDeliveryAt
    const transitDays = shipment.actualDeliveryAt === null
      ? null
      : (new Date(shipment.actualDeliveryAt).getTime() - new Date(shipment.shippedAt).getTime()) / (1000 * 60 * 60 * 24)

    for (const regionId of ['all', shipment.originRegionId]) {
      const key = keyFor(date, regionId)
      const bucket = performanceBuckets.get(key) ?? { resolved: 0, onTime: 0, transitDaysSum: 0, transitCount: 0 }
      bucket.resolved += 1
      if (onTime) {
        bucket.onTime += 1
      }
      if (transitDays !== null) {
        bucket.transitDaysSum += transitDays
        bucket.transitCount += 1
      }
      performanceBuckets.set(key, bucket)
    }
  }

  // Point-in-time open count as of end-of-day D: raised by then, not yet resolved by then.
  function openExceptionsAsOf (endOfDayIso: string, regionId: string): number {
    let count = 0
    for (const exception of exceptions) {
      if (regionId !== 'all' && exception.regionId !== regionId) {
        continue
      }
      if (exception.raisedAt > endOfDayIso) {
        continue
      }
      if (exception.resolvedAt !== null && exception.resolvedAt <= endOfDayIso) {
        continue
      }
      count += 1
    }
    return count
  }

  const allKeys = new Set([...volumeBuckets.keys(), ...performanceBuckets.keys()])
  const snapshots: DailyKpiSnapshot[] = []
  for (const key of allKeys) {
    const [date, regionId] = key.split('|')
    if (!regionIds.has(regionId)) {
      continue
    }
    const perf = performanceBuckets.get(key)
    snapshots.push({
      date,
      regionId,
      shipmentVolume: volumeBuckets.get(key) ?? 0,
      onTimeRate: perf && perf.resolved > 0 ? perf.onTime / perf.resolved : 1,
      openExceptions: openExceptionsAsOf(`${date}T23:59:59.999Z`, regionId),
      avgTransitDays: perf && perf.transitCount > 0 ? perf.transitDaysSum / perf.transitCount : 0,
    })
  }

  snapshots.sort((a, b) => a.date.localeCompare(b.date) || a.regionId.localeCompare(b.regionId))
  return snapshots
}

export function generateFakeData (): GeneratedData {
  faker.seed(SEED)

  const regions = buildRegions()
  const carriers = buildCarriers()
  const shipments: Shipment[] = []
  const exceptions: ExceptionEvent[] = []

  const now = new Date()
  const startDay = addDays(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())), -(TRAILING_DAYS - 1))

  for (let dayIndex = 0; dayIndex < TRAILING_DAYS; dayIndex++) {
    const shipDate = addDays(startDay, dayIndex)
    const shipmentsToday = faker.number.int({ min: MIN_SHIPMENTS_PER_DAY, max: MAX_SHIPMENTS_PER_DAY })

    for (let index = 0; index < shipmentsToday; index++) {
      const { shipment, exception } = buildShipment({ index, dayIndex, shipDate, now, regions, carriers })
      shipments.push(shipment)
      if (exception) {
        exceptions.push(exception)
      }
    }
  }

  const dailySnapshots = buildDailySnapshots(regions, shipments, exceptions, now)

  return {
    regions,
    carriers,
    shipments,
    exceptions,
    dailySnapshots,
    generatedAt: now.toISOString(),
  }
}

let cached: GeneratedData | null = null

/** Generated once per app load; every widget reads this same object (DATA.md). */
export function useFakeData (): GeneratedData {
  if (!cached) {
    cached = generateFakeData()
  }
  return cached
}
