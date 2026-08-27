<template>
  <div class="dashboard-grid">
    <div
      v-for="def in activeWidgets"
      :key="def.id"
      :class="`widget-slot widget-slot--${def.size}`"
    >
      <component :is="def.component" v-bind="def.props" :widget-id="def.id" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useDashboardStore } from '@/stores/dashboard'
  import { getWidgetDefinition } from '@/widgets/registry'

  const dashboardStore = useDashboardStore()

  const activeWidgets = computed(() =>
    dashboardStore.activeWidgetIds
      .map(id => getWidgetDefinition(id))
      .filter((def): def is NonNullable<typeof def> => def !== undefined),
  )
</script>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

.widget-slot--small {
  grid-column: span 3;
}

.widget-slot--medium {
  grid-column: span 6;
}

.widget-slot--large {
  grid-column: span 12;
}

@media (max-width: 960px) {
  .widget-slot--small,
  .widget-slot--medium,
  .widget-slot--large {
    grid-column: span 12;
  }
}
</style>
