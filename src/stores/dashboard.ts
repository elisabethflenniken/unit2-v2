// stores/dashboard.ts
//
// Which widgets are active on the dashboard. Persisted to localStorage so a VP's customization
// survives a reload. WidgetLibraryPanel calls addWidget/removeWidget; DashboardGrid just renders
// whatever's active by looking components up in the registry — it never hardcodes a widget.
import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'ff-dashboard-widgets'

// Deliberately not derived from widgets/registry.ts: that module imports every widget component,
// which import WidgetCard.vue, which imports this store — importing the registry here would be a
// circular import. Keep these ids in sync with registry.ts by hand.
//
// Exceptions table starts in the library rather than on-screen, so the "add a graphic" flow has
// something to add on first load.
const DEFAULT_ACTIVE_IDS = [
  'kpi-volume',
  'kpi-on-time',
  'kpi-regions',
  'kpi-exceptions',
  'chart-volume-trend',
  'chart-on-time-rate',
  'chart-regional-performance',
]

function readStoredIds (): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return DEFAULT_ACTIVE_IDS
  }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(id => typeof id === 'string')) {
      return parsed as string[]
    }
  } catch {
    // Malformed storage — fall back to the default set below.
  }
  return DEFAULT_ACTIVE_IDS
}

export const useDashboardStore = defineStore('dashboard', () => {
  const activeWidgetIds = ref<string[]>(readStoredIds())

  function persist () {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activeWidgetIds.value))
  }

  function addWidget (id: string) {
    if (activeWidgetIds.value.includes(id)) {
      return
    }
    activeWidgetIds.value = [...activeWidgetIds.value, id]
    persist()
  }

  function removeWidget (id: string) {
    activeWidgetIds.value = activeWidgetIds.value.filter(activeId => activeId !== id)
    persist()
  }

  return { activeWidgetIds, addWidget, removeWidget }
})
