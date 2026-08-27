// utils/chartTheme.ts
//
// Vuetify's theme.colors type is a broad union (string | HSV | RGB | ...) even though every value
// we define in plugins/vuetify.ts is a hex string. Chart.js wants a plain string; this narrows it.
import type { useTheme } from 'vuetify'

export function themeColor (theme: ReturnType<typeof useTheme>, key: string): string {
  return String(theme.current.value.colors[key])
}
