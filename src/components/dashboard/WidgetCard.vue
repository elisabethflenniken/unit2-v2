<template>
  <v-card class="widget-card h-100" variant="flat">
    <div class="widget-card__header d-flex align-center ga-2 pa-4 pb-2">
      <h2 class="text-subtitle-1 font-weight-bold mb-0 flex-grow-1">
        {{ title }}
      </h2>

      <slot name="header-actions" />

      <template v-if="!hideControls">
        <v-btn
          aria-label="Expand to full screen"
          icon="mdi-fullscreen"
          size="small"
          variant="text"
          @click="uiStore.expandWidget(widgetId)"
        />

        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              aria-label="Widget options"
              icon="mdi-dots-vertical"
              size="small"
              variant="text"
            />
          </template>

          <v-list class="widget-menu-list" density="compact">
            <v-list-item
              prepend-icon="mdi-close-box-outline"
              title="Remove from dashboard"
              @click="dashboardStore.removeWidget(widgetId)"
            />
          </v-list>
        </v-menu>
      </template>
    </div>

    <v-card-text class="pt-0 h-100">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
  import { useDashboardStore } from '@/stores/dashboard'
  import { useUiStore } from '@/stores/ui'

  withDefaults(defineProps<{
    title: string
    widgetId: string
    hideControls?: boolean
  }>(), {
    hideControls: false,
  })

  const dashboardStore = useDashboardStore()
  const uiStore = useUiStore()
</script>

<style scoped>
/* Vuetify's default icon-to-text gap in a v-list-item (32px) reads too wide for a compact menu. */
.widget-menu-list {
  --v-list-prepend-gap: 12px;
}

.widget-card {
  border-radius: 16px;
}

.widget-card.v-theme--light {
  box-shadow: 0 20px 45px -18px rgba(21, 101, 192, 0.22), 0 10px 25px -12px rgba(15, 23, 42, 0.12);
}

.widget-card.v-theme--dark {
  box-shadow: 0 20px 45px -18px rgba(0, 0, 0, 0.6), 0 10px 25px -12px rgba(0, 0, 0, 0.4);
}
</style>
