<template>
  <div class="d-flex flex-wrap align-center ga-4 mb-6">
    <v-select
      density="comfortable"
      hide-details
      :items="regionItems"
      label="Region"
      :model-value="filtersStore.regionId"
      style="max-width: 220px;"
      variant="outlined"
      @update:model-value="filtersStore.setRegion($event)"
    />

    <v-select
      density="comfortable"
      hide-details
      :items="dateRangeItems"
      label="Date range"
      :model-value="filtersStore.dateRangeDays"
      style="max-width: 220px;"
      variant="outlined"
      @update:model-value="filtersStore.setDateRange($event)"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useFakeData } from '@/data/generateFakeData'
  import { useFiltersStore } from '@/stores/filters'

  const filtersStore = useFiltersStore()
  const data = useFakeData()

  const regionItems = computed(() => [
    { title: 'All regions', value: 'all' },
    ...data.regions.map(r => ({ title: r.name, value: r.id })),
  ])

  const dateRangeItems = [
    { title: 'Last 7 days', value: 7 },
    { title: 'Last 30 days', value: 30 },
    { title: 'Last 90 days', value: 90 },
  ]
</script>
