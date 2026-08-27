// data/thresholds.ts
//
// Single source of truth for good/watch/critical thresholds (DATA.md). StatusChip and every widget
// must call these functions rather than hardcoding a "≥95 is green" check locally.

export type StatusLevel = 'good' | 'watch' | 'critical'

export const thresholds = {
  onTimeRate: { good: 0.95, watch: 0.9 },
  openExceptionsCompanyWide: { good: 15, watch: 30 },
  regionalOnTimeRate: { good: 0.93, watch: 0.85 },
  /** Fractional drop vs. trailing 7-day avg. A volume spike is informational, never a bad status. */
  volumeDropVsTrailingAvg: { watch: 0.1, critical: 0.2 },
} as const

export function onTimeRateStatus (rate: number): StatusLevel {
  if (rate >= thresholds.onTimeRate.good) {
    return 'good'
  }
  if (rate >= thresholds.onTimeRate.watch) {
    return 'watch'
  }
  return 'critical'
}

export function openExceptionsStatus (count: number): StatusLevel {
  if (count < thresholds.openExceptionsCompanyWide.good) {
    return 'good'
  }
  if (count <= thresholds.openExceptionsCompanyWide.watch) {
    return 'watch'
  }
  return 'critical'
}

export function regionalOnTimeRateStatus (rate: number): StatusLevel {
  if (rate >= thresholds.regionalOnTimeRate.good) {
    return 'good'
  }
  if (rate >= thresholds.regionalOnTimeRate.watch) {
    return 'watch'
  }
  return 'critical'
}

/** @param pctChange (current - trailingAvg) / trailingAvg — negative is a drop. */
export function volumeStatus (pctChange: number): StatusLevel {
  if (pctChange >= -thresholds.volumeDropVsTrailingAvg.watch) {
    return 'good'
  }
  if (pctChange >= -thresholds.volumeDropVsTrailingAvg.critical) {
    return 'watch'
  }
  return 'critical'
}

export function exceptionSeverityStatus (severity: 'low' | 'medium' | 'high'): StatusLevel {
  if (severity === 'high') {
    return 'critical'
  }
  if (severity === 'medium') {
    return 'watch'
  }
  return 'watch'
}
