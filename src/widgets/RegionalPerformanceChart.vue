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
      No regional data available for the current filters.
    </div>

    <div v-else-if="result">
      <div :aria-label="chartAriaLabel" class="chart-wrap" role="img">
        <Bar aria-hidden="true" :data="chartData" :options="chartOptions" />
      </div>

      <ul v-if="detailLevel === 'summary'" class="region-legend d-flex flex-wrap ga-2 mt-4 pa-0">
        <li v-for="region in result" :key="region.regionId" class="d-flex align-center ga-2">
          <span class="text-body-2">{{ region.name }} ({{ (region.onTimeRate * 100).toFixed(1) }}%)</span>
          <StatusChip :description="regionalThresholdDescription" :level="region.status" />
        </li>
      </ul>

      <div v-else class="mt-4">
        <h3 class="text-subtitle-2 font-weight-bold mb-2">
          Underlying data
        </h3>

        <DataTable
          label-header="Region"
          :rows="breakdownRows"
          :status-description="regionalThresholdDescription"
          value-header="On-time rate"
        />
      </div>
    </div>
  </WidgetCard>
</template>

<script lang="ts" setup>
  import type { ChartData, ChartOptions } from 'chart.js'
  import { computed } from 'vue'
  import { Bar } from 'vue-chartjs'
  import { useTheme } from 'vuetify'
  import DataTable from '@/components/common/DataTable.vue'
  import StatusChip from '@/components/common/StatusChip.vue'
  import WidgetCard from '@/components/dashboard/WidgetCard.vue'
  import { useWidgetData } from '@/composables/useWidgetData'
  import { useFakeData } from '@/data/generateFakeData'
  import { getRegionalSummaries, type RegionSummary } from '@/data/selectors'
  import { describeRegionalOnTimeRateThreshold, type StatusLevel } from '@/data/thresholds'
  import { useFiltersStore } from '@/stores/filters'
  import { themeColor } from '@/utils/chartTheme'

  const props = withDefaults(defineProps<{
    title: string
    widgetId: string
    detailLevel?: 'summary' | 'full'
  }>(), {
    detailLevel: 'summary',
  })

  const statusLabels: Record<StatusLevel, string> = {
    good: 'On target',
    watch: 'Watch',
    critical: 'Critical',
  }

  const statusColorKey: Record<StatusLevel, string> = {
    good: 'status-good',
    watch: 'status-watch',
    critical: 'status-critical',
  }

  const theme = useTheme()
  const filtersStore = useFiltersStore()
  const regionalThresholdDescription = describeRegionalOnTimeRateThreshold()

  function compute (): RegionSummary[] {
    return getRegionalSummaries(useFakeData(), filtersStore.dateRangeDays)
  }

  const { state, data: result, errorMessage } = useWidgetData(
    compute,
    value => value.length === 0,
    { watchSource: () => filtersStore.dateRangeDays },
  )

  const chartData = computed<ChartData<'bar'>>(() => {
    const regions = result.value ?? []
    return {
      labels: regions.map(r => r.code),
      datasets: [
        {
          label: 'On-time rate',
          data: regions.map(r => Number((r.onTimeRate * 100).toFixed(1))),
          backgroundColor: regions.map(r => themeColor(theme, statusColorKey[r.status])),
          borderRadius: 4,
          maxBarThickness: 48,
        },
      ],
    }
  })

  const chartOptions = computed<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: themeColor(theme, 'on-surface-variant') },
        grid: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        ticks: { color: themeColor(theme, 'on-surface-variant'), callback: (v: string | number) => `${v}%` },
        grid: { color: themeColor(theme, 'outline') },
      },
    },
  }))

  const chartAriaLabel = computed(() => {
    if (!result.value) return props.title
    const parts = result.value.map(r => `${r.name} ${(r.onTimeRate * 100).toFixed(1)}% (${statusLabels[r.status]})`)
    return `${props.title}: ${parts.join(', ')}.`
  })

  const breakdownRows = computed(() => (result.value ?? []).map(r => ({
    label: r.name,
    value: `${(r.onTimeRate * 100).toFixed(1)}%`,
    status: r.status,
  })))
</script>

<style scoped>
.chart-wrap {
  height: 220px;
  width: 100%;
}

.region-legend {
  list-style: none;
}
</style>
