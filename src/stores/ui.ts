// stores/ui.ts
//
// Transient UI state that doesn't belong in dashboard/filters/theme: which widget (if any) is
// currently expanded to full screen. FullscreenWidgetDialog watches this; WidgetCard sets it.
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const expandedWidgetId = ref<string | null>(null)

  function expandWidget (id: string) {
    expandedWidgetId.value = id
  }

  function closeExpandedWidget () {
    expandedWidgetId.value = null
  }

  return { expandedWidgetId, expandWidget, closeExpandedWidget }
})
