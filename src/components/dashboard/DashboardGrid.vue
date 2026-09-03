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
/*
 * Flexbox, not a fixed-column grid: small/medium widgets share whatever row they land in via
 * flex-grow, so two of them split it evenly, one alone stretches to fill it, and on narrow
 * viewports they naturally wrap to one per row — no separate breakpoint rules needed.
 */
.dashboard-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 16px;
}

.widget-slot {
  flex-grow: 1;
}

.widget-slot--small,
.widget-slot--medium {
  flex-basis: 46%;
  min-width: 340px;
}

.widget-slot--large {
  flex-basis: 100%;
  min-width: 100%;
}
</style>
