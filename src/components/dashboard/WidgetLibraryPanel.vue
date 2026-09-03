<template>
  <v-navigation-drawer
    v-model="isOpen"
    aria-labelledby="widget-library-title"
    aria-modal="true"
    location="right"
    retain-focus
    role="dialog"
    temporary
    width="380"
  >
    <div class="d-flex align-center ga-2 pa-4">
      <h2 id="widget-library-title" class="text-h6 font-weight-bold flex-grow-1 mb-0">
        Customize Dashboard
      </h2>

      <v-btn
        aria-label="Close widget library"
        icon="mdi-close"
        variant="text"
        @click="isOpen = false"
      />
    </div>

    <v-divider />

    <div class="pa-4 pb-2">
      <h3 class="text-subtitle-2 font-weight-bold mb-3">
        Active Widgets
      </h3>

      <TransitionGroup v-if="activeWidgets.length > 0" class="widget-list" name="widget-move" tag="div">
        <v-card
          v-for="def in activeWidgets"
          :key="def.id"
          class="mb-3 pa-3"
          variant="outlined"
        >
          <div class="text-subtitle-2 font-weight-bold mb-1">
            {{ def.title }}
          </div>

          <p class="text-body-2 text-on-surface-variant mb-3">
            {{ def.description }}
          </p>

          <v-btn
            color="status-critical-subtle-text"
            prepend-icon="mdi-close-box-outline"
            size="small"
            variant="text"
            @click="dashboardStore.removeWidget(def.id)"
          >
            Remove from Dashboard
          </v-btn>
        </v-card>
      </TransitionGroup>

      <p v-else class="text-body-2 text-on-surface-variant">
        No widgets are currently on your dashboard.
      </p>
    </div>

    <v-divider />

    <div class="pa-4 pt-3">
      <h3 class="text-subtitle-2 font-weight-bold mb-3">
        Inactive Widgets
      </h3>

      <TransitionGroup v-if="inactiveWidgets.length > 0" class="widget-list" name="widget-move" tag="div">
        <v-card
          v-for="def in inactiveWidgets"
          :key="def.id"
          class="mb-3 pa-3"
          variant="outlined"
        >
          <div class="text-subtitle-2 font-weight-bold mb-1">
            {{ def.title }}
          </div>

          <p class="text-body-2 text-on-surface-variant mb-3">
            {{ def.description }}
          </p>

          <v-btn
            prepend-icon="mdi-plus-box-outline"
            size="small"
            variant="tonal"
            @click="dashboardStore.addWidget(def.id)"
          >
            Add to Dashboard
          </v-btn>
        </v-card>
      </TransitionGroup>

      <p v-else class="text-body-2 text-on-surface-variant">
        Every available graphic is already on your dashboard.
      </p>
    </div>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useDashboardStore } from '@/stores/dashboard'
  import { widgetRegistry } from '@/widgets/registry'

  const isOpen = defineModel<boolean>({ required: true })

  const dashboardStore = useDashboardStore()

  const activeWidgets = computed(() =>
    widgetRegistry.filter(def => dashboardStore.activeWidgetIds.includes(def.id)),
  )

  const inactiveWidgets = computed(() =>
    widgetRegistry.filter(def => !dashboardStore.activeWidgetIds.includes(def.id)),
  )
</script>

<style scoped>
.widget-list {
  position: relative;
}

.widget-move-move,
.widget-move-enter-active,
.widget-move-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.widget-move-enter-from,
.widget-move-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.widget-move-leave-active {
  position: absolute;
  width: 100%;
}

@media (prefers-reduced-motion: reduce) {
  .widget-move-move,
  .widget-move-enter-active,
  .widget-move-leave-active {
    transition: none;
  }
}
</style>
