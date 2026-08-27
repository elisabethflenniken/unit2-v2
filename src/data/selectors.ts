// data/selectors.ts
//
// Pure aggregation helpers over GeneratedData/DailyKpiSnapshot, shared across widgets so every
// graphic reads the same rollups and status logic instead of recomputing it per component.
import type { DailyKpiSnapshot, GeneratedData } from './types'
import {
  onTimeRateStatus,
  openExceptionsStatus,
  regionalOnTimeRateStatus,
  type StatusLevel,
  volumeStatus,
} from './thresholds'

export function getSnapshotsForRegion (data: GeneratedData, regionId: string): DailyKpiSnapshot[] {
  return data.dailySnapshots
    .filter(s => s.regionId === regionId)
    .toSorted((a, b) => a.date.localeCompare(b.date))
}

export function getLatestSnapshot (snapshots: DailyKpiSnapshot[]): DailyKpiSnapshot | undefined {
  return snapshots.at(-1)
}

/** Average of `field` over the `days` before the most recent snapshot (the most recent day excluded). */
export function getTrailingAverage (
  snapshots: DailyKpiSnapshot[],
  field: 'shipmentVolume' | 'onTimeRate',
  days: number,
): number {
  const window = snapshots.slice(-(days + 1), -1)
  if (window.length === 0) {
    return 0
  }
  return window.reduce((sum, s) => sum + s[field], 0) / window.length
}

export interface VolumeSummary {
  current: number
  trailingAvg: number
  pctChange: number
  status: StatusLevel
}

export function getVolumeSummary (allSnapshots: DailyKpiSnapshot[], trailingDays = 7): VolumeSummary | null {
  const latest = getLatestSnapshot(allSnapshots)
  if (!latest) {
    return null
  }
  const trailingAvg = getTrailingAverage(allSnapshots, 'shipmentVolume', trailingDays)
  const pctChange = trailingAvg > 0 ? (latest.shipmentVolume - trailingAvg) / trailingAvg : 0
  return { current: latest.shipmentVolume, trailingAvg, pctChange, status: volumeStatus(pctChange) }
}

export interface OnTimeSummary {
  rate: number
  trailingAvg: number
  diff: number
  status: StatusLevel
}

export function getOnTimeSummary (allSnapshots: DailyKpiSnapshot[], trailingDays = 7): OnTimeSummary | null {
  const latest = getLatestSnapshot(allSnapshots)
  if (!latest) {
    return null
  }
  const trailingAvg = getTrailingAverage(allSnapshots, 'onTimeRate', trailingDays)
  return { rate: latest.onTimeRate, trailingAvg, diff: latest.onTimeRate - trailingAvg, status: onTimeRateStatus(latest.onTimeRate) }
}

export interface ExceptionsSummary {
  count: number
  diffFromYesterday: number
  status: StatusLevel
}

export function getExceptionsSummary (allSnapshots: DailyKpiSnapshot[]): ExceptionsSummary | null {
  const latest = getLatestSnapshot(allSnapshots)
  if (!latest) {
    return null
  }
  const previous = allSnapshots.at(-2)
  const diffFromYesterday = previous ? latest.openExceptions - previous.openExceptions : 0
  return { count: latest.openExceptions, diffFromYesterday, status: openExceptionsStatus(latest.openExceptions) }
}

export interface RegionSummary {
  regionId: string
  name: string
  code: string
  onTimeRate: number
  volume: number
  status: StatusLevel
}

/** Averages each region's on-time rate over the trailing `days` (1 = latest day only). */
export function getRegionalSummaries (data: GeneratedData, days = 1): RegionSummary[] {
  return data.regions.map(region => {
    const window = getSnapshotsForRegion(data, region.id).slice(-days)
    const volume = window.reduce((sum, s) => sum + s.shipmentVolume, 0)
    const onTimeRate = window.length > 0 ? window.reduce((sum, s) => sum + s.onTimeRate, 0) / window.length : 0
    return {
      regionId: region.id,
      name: region.name,
      code: region.code,
      onTimeRate,
      volume,
      status: regionalOnTimeRateStatus(onTimeRate),
    }
  })
}

/** Restricts a sorted snapshot list to the trailing `days` (all history when `days` is falsy). */
export function applyDateRange (snapshots: DailyKpiSnapshot[], days: number): DailyKpiSnapshot[] {
  return days > 0 ? snapshots.slice(-days) : snapshots
}
