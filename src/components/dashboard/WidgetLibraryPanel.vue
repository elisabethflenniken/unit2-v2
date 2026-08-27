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
        Add a graphic
      </h2>

      <v-btn
        aria-label="Close widget library"
        icon="mdi-close"
        variant="text"
        @click="isOpen = false"
      />
    </div>

    <v-divider />

    <v-list v-if="availableWidgets.length > 0" class="pa-2">
      <v-card
        v-for="def in availableWidgets"
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
          size="small"
          variant="tonal"
          @click="dashboardStore.addWidget(def.id)"
        >
          Add to dashboard
        </v-btn>
      </v-card>
    </v-list>

    <p v-else class="pa-4 text-body-2 text-on-surface-variant">
      Every available graphic is already on your dashboard.
    </p>
  </v-navigation-drawer>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useDashboardStore } from '@/stores/dashboard'
  import { widgetRegistry } from '@/widgets/registry'

  const isOpen = defineModel<boolean>({ required: true })

  const dashboardStore = useDashboardStore()

  const availableWidgets = computed(() =>
    widgetRegistry.filter(def => !dashboardStore.activeWidgetIds.includes(def.id)),
  )
</script>
