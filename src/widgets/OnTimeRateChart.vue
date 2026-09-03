<template>
  <WidgetCard :hide-controls="detailLevel === 'full'" :title="title" :widget-id="widgetId">
    <div v-if="state === 'loading'">
      <v-skeleton-loader type="image" />
    </div>

    <div v-else-if="state === 'error'" class="text-body-2" role="alert">
      <v-icon aria-hidden="true" color="status-critical" icon="mdi-alert-circle" start />
      {{ errorMessage || 'This widget could not be loaded.' }}
    </div>

    <div v-else-if="state === 'empty'" class="text-body-2 text-on-surface-variant">
      No delivery data available for the current filters.
    </div>

    <div v-else-if="result">
      <div :aria-label="chartAriaLabel" class="chart-wrap" role="img">
        <Line aria-hidden="true" :data="chartData" :options="chartOptions" />
      </div>

      <div v-if="detailLevel === 'full'" class="mt-4">
        <h3 class="text-subtitle-2 font-weight-bold mb-2">
          Underlying data
        </h3>

        <DataTable label-header="Date" :rows="breakdownRows" value-header="On-time rate" />
      </div>
    </div>
  </WidgetCard>
</template>

<script lang="ts" setup>
  import type { DailyKpiSnapshot } from '@/data/types'
  import type { ChartData, ChartOptions } from 'chart.js'
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { useTheme } from 'vuetify'
  import DataTable from '@/components/common/DataTable.vue'
  import WidgetCard from '@/components/dashboard/WidgetCard.vue'
  import { useWidgetData } from '@/composables/useWidgetData'
  import { useFakeData } from '@/data/generateFakeData'
  import { applyDateRange, getOnTimeSummary, getSnapshotsForRegion } from '@/data/selectors'
  import { thresholds } from '@/data/thresholds'
  import { useFiltersStore } from '@/stores/filters'
  import { themeColor } from '@/utils/chartTheme'
  import { formatShortDate } from '@/utils/formatDate'

  const props = withDefaults(defineProps<{
    title: string
    widgetId: string
    detailLevel?: 'summary' | 'full'
  }>(), {
    detailLevel: 'summary',
  })

  const theme = useTheme()
  const filtersStore = useFiltersStore()

  function compute () {
    const data = useFakeData()
    const fullSnapshots = getSnapshotsForRegion(data, filtersStore.regionId)
    const snapshots = applyDateRange(fullSnapshots, filtersStore.dateRangeDays)
    const summary = getOnTimeSummary(fullSnapshots, filtersStore.dateRangeDays)
    if (!summary) throw new Error('No on-time delivery data available.')
    return { snapshots, summary }
  }

  const { state, data: result, errorMessage } = useWidgetData(
    compute,
    value => value.snapshots.length === 0,
    { watchSource: () => [filtersStore.regionId, filtersStore.dateRangeDays] },
  )

  function toChartData (snapshots: DailyKpiSnapshot[]): ChartData<'line'> {
    return {
      labels: snapshots.map(s => formatShortDate(s.date)),
      datasets: [
        {
          label: 'On-time rate',
          data: snapshots.map(s => Number((s.onTimeRate * 100).toFixed(1))),
          borderColor: themeColor(theme, 'primary'),
          backgroundColor: `${themeColor(theme, 'primary')}26`,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Target (95%)',
          data: snapshots.map(() => thresholds.onTimeRate.good * 100),
          borderColor: themeColor(theme, 'on-surface-variant'),
          borderDash: [6, 6],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    }
  }

  const chartData = computed<ChartData<'line'>>(() => result.value ? toChartData(result.value.snapshots) : { labels: [], datasets: [] })

  const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { maxTicksLimit: 8, color: themeColor(theme, 'on-surface-variant') },
        grid: { display: false },
      },
      y: {
        min: 70,
        max: 100,
        ticks: { color: themeColor(theme, 'on-surface-variant'), callback: (v: string | number) => `${v}%` },
        grid: { color: themeColor(theme, 'outline') },
      },
    },
  }))

  const chartAriaLabel = computed(() => {
    if (!result.value) return props.title
    const { summary } = result.value
    return `${props.title}: currently ${(summary.rate * 100).toFixed(1)}% on-time, `
      + `${summary.diff >= 0 ? 'up' : 'down'} ${Math.abs(summary.diff * 100).toFixed(1)} points vs. the trailing ${filtersStore.dateRangeDays}-day average. `
      + 'Target is 95%.'
  })

  const breakdownRows = computed(() => (result.value?.snapshots ?? []).toReversed().map(s => ({ label: formatShortDate(s.date), value: `${(s.onTimeRate * 100).toFixed(1)}%` })))
</script>

<style scoped>
.chart-wrap {
  height: 260px;
  width: 100%;
}
</style>
