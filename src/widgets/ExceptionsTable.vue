<template>
  <WidgetCard :hide-controls="detailLevel === 'full'" :title="title" :widget-id="widgetId">
    <template v-if="state === 'ready' && result" #header-actions>
      <StatusChip :level="result.status" />
    </template>

    <div v-if="state === 'loading'">
      <v-skeleton-loader type="table-row@6" />
    </div>

    <div v-else-if="state === 'error'" class="text-body-2" role="alert">
      <v-icon aria-hidden="true" color="status-critical" icon="mdi-alert-circle" start />
      {{ errorMessage || 'This widget could not be loaded.' }}
    </div>

    <div v-else-if="state === 'empty'" class="text-body-2 text-on-surface-variant">
      No open exceptions for the current filters.
    </div>

    <div v-else-if="result">
      <p class="text-body-2 text-on-surface-variant mb-2">
        <template v-if="detailLevel === 'full'">
          Showing all {{ result.openCount }} open exceptions, most severe first.
        </template>

        <template v-else>
          Showing {{ result.rows.length }} of {{ result.openCount }} open exceptions, most severe first.
        </template>
      </p>

      <v-table density="comfortable">
        <thead>
          <tr>
            <th scope="col">Raised</th>
            <th scope="col">Region</th>
            <th scope="col">Carrier</th>
            <th scope="col">Category</th>
            <th scope="col">Severity</th>
            <th scope="col">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="row in result.rows" :key="row.id">
            <td>{{ formatShortDate(row.date) }}</td>
            <td>{{ row.regionName }}</td>
            <td>{{ row.carrierName }}</td>
            <td>{{ categoryLabels[row.category] }}</td>

            <td>
              <StatusChip :level="row.severityStatus" />
            </td>

            <td>
              <v-chip
                :prepend-icon="row.isOpen ? 'mdi-progress-alert' : 'mdi-check'"
                size="small"
                variant="outlined"
              >
                {{ row.isOpen ? 'Open' : 'Resolved' }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </WidgetCard>
</template>

<script lang="ts" setup>
  import type { ExceptionCategory } from '@/data/types'
  import StatusChip from '@/components/common/StatusChip.vue'
  import WidgetCard from '@/components/dashboard/WidgetCard.vue'
  import { useWidgetData } from '@/composables/useWidgetData'
  import { useFakeData } from '@/data/generateFakeData'
  import { exceptionSeverityStatus, openExceptionsStatus, type StatusLevel } from '@/data/thresholds'
  import { useFiltersStore } from '@/stores/filters'
  import { formatShortDate } from '@/utils/formatDate'

  const props = withDefaults(defineProps<{
    title: string
    widgetId: string
    detailLevel?: 'summary' | 'full'
  }>(), {
    detailLevel: 'summary',
  })

  const categoryLabels: Record<ExceptionCategory, string> = {
    damage: 'Damage',
    customs_hold: 'Customs hold',
    weather_delay: 'Weather delay',
    carrier_delay: 'Carrier delay',
    documentation: 'Documentation',
    lost: 'Lost',
  }

  const severityRank: Record<StatusLevel, number> = { critical: 0, watch: 1, good: 2 }

  interface ExceptionRow {
    id: string
    date: string
    regionName: string
    carrierName: string
    category: ExceptionCategory
    severityStatus: StatusLevel
    isOpen: boolean
  }

  const filtersStore = useFiltersStore()

  function compute () {
    const data = useFakeData()
    const regionNames = new Map(data.regions.map(r => [r.id, r.name]))
    const carrierNames = new Map(data.carriers.map(c => [c.id, c.name]))

    const cutoffIso = new Date(
      new Date(data.generatedAt).getTime() - filtersStore.dateRangeDays * 24 * 60 * 60 * 1000,
    ).toISOString()

    const openExceptions = data.exceptions.filter(e =>
      e.status === 'open'
      && e.raisedAt >= cutoffIso
      && (filtersStore.regionId === 'all' || e.regionId === filtersStore.regionId),
    )
    const sortedRows: ExceptionRow[] = openExceptions
      .map(e => ({
        id: e.id,
        date: e.raisedAt.slice(0, 10),
        regionName: regionNames.get(e.regionId) ?? e.regionId,
        carrierName: carrierNames.get(e.carrierId) ?? e.carrierId,
        category: e.category,
        severityStatus: exceptionSeverityStatus(e.severity),
        isOpen: true,
      }))
      .toSorted((a, b) => severityRank[a.severityStatus] - severityRank[b.severityStatus] || b.date.localeCompare(a.date))

    const rows = props.detailLevel === 'full' ? sortedRows : sortedRows.slice(0, 10)

    return {
      rows,
      openCount: openExceptions.length,
      status: openExceptionsStatus(openExceptions.length),
    }
  }

  const { state, data: result, errorMessage } = useWidgetData(
    compute,
    value => value.openCount === 0,
    { watchSource: () => [filtersStore.regionId, filtersStore.dateRangeDays] },
  )
</script>
