<template>
  <v-dialog v-model="isOpen" fullscreen transition="dialog-bottom-transition">
    <v-card v-if="widgetDef">
      <v-toolbar color="surface" density="comfortable">
        <v-spacer />

        <v-btn
          aria-label="Close full screen view"
          icon="mdi-close"
          @click="uiStore.closeExpandedWidget()"
        />
      </v-toolbar>

      <v-card-text class="pa-6">
        <component
          :is="widgetDef.component"
          v-bind="widgetDef.props"
          detail-level="full"
          :widget-id="widgetDef.id"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useUiStore } from '@/stores/ui'
  import { getWidgetDefinition } from '@/widgets/registry'

  const uiStore = useUiStore()

  const isOpen = computed({
    get: () => uiStore.expandedWidgetId !== null,
    set: (value: boolean) => {
      if (!value) uiStore.closeExpandedWidget()
    },
  })

  const widgetDef = computed(() => uiStore.expandedWidgetId ? getWidgetDefinition(uiStore.expandedWidgetId) : undefined)
</script>
