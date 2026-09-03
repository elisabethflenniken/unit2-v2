<template>
  <WidgetCard :hide-controls="detailLevel === 'full'" :title="title" :widget-id="widgetId">
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
          Showing all {{ result.openCount }} open exceptions, most severe first. Select a row for details.
        </template>

        <template v-else>
          Showing {{ result.rows.length }} of {{ result.openCount }} open exceptions, most severe first. Select a row for details.
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
            <th class="text-right" scope="col">Details</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="row in result.rows"
            :key="row.id"
            class="exception-row"
            @click="selectedException = row"
          >
            <td>{{ formatShortDate(row.date) }}</td>
            <td>{{ row.regionName }}</td>
            <td>{{ row.carrierName }}</td>
            <td>{{ categoryLabels[row.category] }}</td>

            <td>
              <StatusChip :description="severityMappingDescription" :level="row.severityStatus" />
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

            <td class="text-right">
              <v-btn
                :aria-label="`View details for exception raised ${formatShortDate(row.date)}, ${row.regionName}, ${categoryLabels[row.category]}`"
                icon="mdi-information-outline"
                size="small"
                variant="text"
                @click.stop="selectedException = row"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <v-dialog
      v-model="isDetailOpen"
      aria-labelledby="exception-detail-title"
      max-width="520"
    >
      <v-card v-if="selectedException" rounded="lg">
        <div class="d-flex align-center ga-2 pa-4 pb-2">
          <h2 id="exception-detail-title" class="text-h6 font-weight-bold flex-grow-1 mb-0">
            {{ categoryLabels[selectedException.category] }}
          </h2>

          <v-btn
            aria-label="Close exception details"
            icon="mdi-close"
            variant="text"
            @click="selectedException = null"
          />
        </div>

        <v-card-text class="pt-0">
          <div class="d-flex ga-2 mb-4">
            <StatusChip :description="severityMappingDescription" :level="selectedException.severityStatus" />

            <v-chip
              :prepend-icon="selectedException.isOpen ? 'mdi-progress-alert' : 'mdi-check'"
              size="small"
              variant="outlined"
            >
              {{ selectedException.isOpen ? 'Open' : 'Resolved' }}
            </v-chip>
          </div>

          <p class="text-body-1 mb-4">
            {{ selectedException.description }}
          </p>

          <dl class="exception-detail-grid">
            <dt>Shipment</dt>
            <dd>{{ selectedException.shipmentId }}</dd>

            <dt>Region</dt>
            <dd>{{ selectedException.regionName }}</dd>

            <dt>Carrier</dt>
            <dd>{{ selectedException.carrierName }}</dd>

            <dt>Raised</dt>
            <dd>{{ formatDateTime(selectedException.raisedAtIso) }}</dd>

            <dt>Resolved</dt>
            <dd>{{ selectedException.resolvedAtIso ? formatDateTime(selectedException.resolvedAtIso) : 'Not yet resolved' }}</dd>
          </dl>
        </v-card-text>
      </v-card>
    </v-dialog>
  </WidgetCard>
</template>

<script lang="ts" setup>
  import type { ExceptionCategory } from '@/data/types'
  import { computed, ref } from 'vue'
  import StatusChip from '@/components/common/StatusChip.vue'
  import WidgetCard from '@/components/dashboard/WidgetCard.vue'
  import { useWidgetData } from '@/composables/useWidgetData'
  import { useFakeData } from '@/data/generateFakeData'
  import {
    describeExceptionSeverityMapping,
    exceptionSeverityStatus,
    type StatusLevel,
  } from '@/data/thresholds'
  import { useFiltersStore } from '@/stores/filters'
  import { formatDateTime, formatShortDate } from '@/utils/formatDate'

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
    shipmentId: string
    regionName: string
    carrierName: string
    category: ExceptionCategory
    severityStatus: StatusLevel
    isOpen: boolean
    description: string
    raisedAtIso: string
    resolvedAtIso: string | null
  }

  const filtersStore = useFiltersStore()
  const severityMappingDescription = describeExceptionSeverityMapping()

  const selectedException = ref<ExceptionRow | null>(null)
  const isDetailOpen = computed({
    get: () => selectedException.value !== null,
    set: (value: boolean) => {
      if (!value) selectedException.value = null
    },
  })

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
        shipmentId: e.shipmentId,
        regionName: regionNames.get(e.regionId) ?? e.regionId,
        carrierName: carrierNames.get(e.carrierId) ?? e.carrierId,
        category: e.category,
        severityStatus: exceptionSeverityStatus(e.severity),
        isOpen: true,
        description: e.description,
        raisedAtIso: e.raisedAt,
        resolvedAtIso: e.resolvedAt,
      }))
      .toSorted((a, b) => severityRank[a.severityStatus] - severityRank[b.severityStatus] || b.date.localeCompare(a.date))

    const rows = props.detailLevel === 'full' ? sortedRows : sortedRows.slice(0, 10)

    return {
      rows,
      openCount: openExceptions.length,
    }
  }

  const { state, data: result, errorMessage } = useWidgetData(
    compute,
    value => value.openCount === 0,
    { watchSource: () => [filtersStore.regionId, filtersStore.dateRangeDays] },
  )
</script>

<style scoped>
.exception-row {
  cursor: pointer;
}

.exception-row:hover {
  background-color: rgb(var(--v-theme-primary-lighten));
}

.exception-detail-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
}

.exception-detail-grid dt {
  color: rgb(var(--v-theme-on-surface-variant));
}

.exception-detail-grid dd {
  margin: 0;
}
</style>
