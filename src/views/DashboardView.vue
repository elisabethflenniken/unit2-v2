<template>
  <div class="pa-4 pa-md-6">
    <h1 class="text-h4 font-weight-bold mb-1">Operations Dashboard</h1>

    <p class="text-body-2 text-on-surface-variant mb-6">
      Live snapshot of shipment volume, on-time performance, and exceptions across all regions.
    </p>

    <GlobalFilterBar />
    <DashboardGrid />
  </div>
</template>

<script lang="ts" setup>
  import DashboardGrid from '@/components/dashboard/DashboardGrid.vue'
  import GlobalFilterBar from '@/components/dashboard/GlobalFilterBar.vue'
</script>
