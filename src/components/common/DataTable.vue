<template>
  <v-table density="compact">
    <thead>
      <tr>
        <th scope="col">{{ labelHeader }}</th>
        <th scope="col">{{ valueHeader }}</th>
        <th v-if="rows[0]?.status" scope="col">Status</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, index) in rows" :key="`${row.label}-${index}`">
        <td>{{ row.label }}</td>
        <td>{{ row.value }}</td>

        <td v-if="row.status">
          <StatusChip :level="row.status" />
        </td>
      </tr>
    </tbody>
  </v-table>
</template>

<script lang="ts" setup>
  import type { StatusLevel } from '@/data/thresholds'
  import StatusChip from '@/components/common/StatusChip.vue'

  export interface DataTableRow {
    label: string
    value: string
    status?: StatusLevel
  }

  defineProps<{
    rows: DataTableRow[]
    labelHeader: string
    valueHeader: string
  }>()
</script>
