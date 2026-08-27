<template>
  <WidgetCard :hide-controls="detailLevel === 'full'" :title="title" :widget-id="widgetId">
    <template v-if="state === 'ready' && result" #header-actions>
      <StatusChip :level="result.status" />
    </template>

    <div v-if="state === 'loading'">
      <v-skeleton-loader type="heading, text, text" />
    </div>

    <div v-else-if="state === 'error'" class="text-body-2" role="alert">
      <v-icon aria-hidden="true" color="status-critical" icon="mdi-alert-circle" start />
      {{ errorMessage || 'This widget could not be loaded.' }}
    </div>

    <div v-else-if="state === 'empty'" class="text-body-2 text-on-surface-variant">
      No data available for the current filters.
    </div>

    <div v-else-if="result">
      <div class="text-h3 font-weight-bold">
        {{ result.displayValue }}
      </div>

      <div class="text-body-2 text-on-surface-variant d-flex align-center ga-1 mt-1">
        <v-icon
          v-if="result.trendDirection"
          aria-hidden="true"
          :icon="result.trendDirection === 'up' ? 'mdi-arrow-up-thin' : 'mdi-arrow-down-thin'"
          size="16"
        />
        {{ result.subtitle }}
      </div>

      <Sparkline v-if="detailLevel === 'summary' && result.sparklineValues.length > 1" class="mt-3" :values="result.sparklineValues" />

      <div v-if="detailLevel === 'full' && result.breakdown.length > 0" class="mt-4">
        <h3 class="text-subtitle-2 font-weight-bold mb-2">
          Underlying data
        </h3>

        <DataTable
          :label-header="result.breakdownLabelHeader"
          :rows="result.breakdown"
          :value-header="result.breakdownValueHeader"
        />
      </div>
    </div>
  </WidgetCard>
</template>

<script lang="ts" setup>
  import type { StatusLevel } from '@/data/thresholds'
  import DataTable, { type DataTableRow } from '@/components/common/DataTable.vue'
  import Sparkline from '@/components/common/Sparkline.vue'
  import StatusChip from '@/components/common/StatusChip.vue'
  import WidgetCard from '@/components/dashboard/WidgetCard.vue'
  import { useWidgetData } from '@/composables/useWidgetData'
  import { useFakeData } from '@/data/generateFakeData'
  import {
    applyDateRange,
    getExceptionsSummary,
    getOnTimeSummary,
    getRegionalSummaries,
    getSnapshotsForRegion,
    getVolumeSummary,
  } from '@/data/selectors'
  import { useFiltersStore } from '@/stores/filters'
  import { formatShortDate } from '@/utils/formatDate'

  export type KpiMetric = 'volume' | 'onTime' | 'regions' | 'exceptions'

  const props = withDefaults(defineProps<{
    title: string
    widgetId: string
    metric: KpiMetric
    detailLevel?: 'summary' | 'full'
  }>(), {
    detailLevel: 'summary',
  })

  interface KpiResult {
    displayValue: string
    subtitle: string
    status: StatusLevel
    trendDirection: 'up' | 'down' | null
    sparklineValues: number[]
    breakdown: DataTableRow[]
    breakdownLabelHeader: string
    breakdownValueHeader: string
  }

  const noData: KpiResult = {
    displayValue: '—',
    subtitle: 'No data',
    status: 'critical',
    trendDirection: null,
    sparklineValues: [],
    breakdown: [],
    breakdownLabelHeader: '',
    breakdownValueHeader: '',
  }

  const filtersStore = useFiltersStore()

  function computeKpi (metric: KpiMetric): KpiResult {
    const data = useFakeData()
    // "Regions on target" is inherently company-wide; the region filter doesn't narrow it.
    const fullSnapshots = getSnapshotsForRegion(data, metric === 'regions' ? 'all' : filtersStore.regionId)
    const rangeSnapshots = applyDateRange(fullSnapshots, filtersStore.dateRangeDays)
    const trailingDays = filtersStore.dateRangeDays

    if (metric === 'volume') {
      const summary = getVolumeSummary(fullSnapshots, trailingDays)
      if (!summary) return noData
      return {
        displayValue: summary.current.toLocaleString(),
        subtitle: `${summary.pctChange >= 0 ? '+' : ''}${(summary.pctChange * 100).toFixed(1)}% vs. ${trailingDays}-day avg`,
        status: summary.status,
        trendDirection: summary.pctChange >= 0 ? 'up' : 'down',
        sparklineValues: rangeSnapshots.slice(-14).map(s => s.shipmentVolume),
        breakdown: rangeSnapshots.toReversed().map(s => ({ label: formatShortDate(s.date), value: s.shipmentVolume.toLocaleString() })),
        breakdownLabelHeader: 'Date',
        breakdownValueHeader: 'Shipment volume',
      }
    }

    if (metric === 'onTime') {
      const summary = getOnTimeSummary(fullSnapshots, trailingDays)
      if (!summary) return noData
      return {
        displayValue: `${(summary.rate * 100).toFixed(1)}%`,
        subtitle: `${summary.diff >= 0 ? '+' : ''}${(summary.diff * 100).toFixed(1)} pts vs. ${trailingDays}-day avg`,
        status: summary.status,
        trendDirection: summary.diff >= 0 ? 'up' : 'down',
        sparklineValues: rangeSnapshots.slice(-14).map(s => s.onTimeRate * 100),
        breakdown: rangeSnapshots.toReversed().map(s => ({ label: formatShortDate(s.date), value: `${(s.onTimeRate * 100).toFixed(1)}%` })),
        breakdownLabelHeader: 'Date',
        breakdownValueHeader: 'On-time rate',
      }
    }

    if (metric === 'exceptions') {
      const summary = getExceptionsSummary(fullSnapshots)
      if (!summary) return noData
      return {
        displayValue: String(summary.count),
        subtitle: `${summary.diffFromYesterday > 0 ? '+' : ''}${summary.diffFromYesterday} vs. yesterday`,
        status: summary.status,
        trendDirection: summary.diffFromYesterday === 0 ? null : (summary.diffFromYesterday > 0 ? 'up' : 'down'),
        sparklineValues: rangeSnapshots.slice(-14).map(s => s.openExceptions),
        breakdown: rangeSnapshots.toReversed().map(s => ({ label: formatShortDate(s.date), value: String(s.openExceptions) })),
        breakdownLabelHeader: 'Date',
        breakdownValueHeader: 'Open exceptions',
      }
    }

    // metric === 'regions'
    const regionSummaries = getRegionalSummaries(data, trailingDays)
    const goodCount = regionSummaries.filter(r => r.status === 'good').length
    const hasCritical = regionSummaries.some(r => r.status === 'critical')
    const hasWatch = regionSummaries.some(r => r.status === 'watch')
    const status: StatusLevel = hasCritical ? 'critical' : (hasWatch ? 'watch' : 'good')
    return {
      displayValue: `${goodCount}/${regionSummaries.length}`,
      subtitle: `${goodCount} of ${regionSummaries.length} regions on target`,
      status,
      trendDirection: null,
      sparklineValues: [],
      breakdown: regionSummaries.map(r => ({ label: r.name, value: `${(r.onTimeRate * 100).toFixed(1)}%`, status: r.status })),
      breakdownLabelHeader: 'Region',
      breakdownValueHeader: 'On-time rate',
    }
  }

  const { state, data: result, errorMessage } = useWidgetData(
    () => computeKpi(props.metric),
    value => value.displayValue === '—',
    { watchSource: () => [filtersStore.regionId, filtersStore.dateRangeDays] },
  )
</script>
