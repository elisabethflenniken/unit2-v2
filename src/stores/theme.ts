// stores/theme.ts
//
// Light/dark mode, persisted to localStorage per DESIGN.md (default to light on first load
// rather than reading prefers-color-scheme — a presenter's laptop may not be in their preferred mode).
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'ff-theme-mode'

function readStoredMode (): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readStoredMode())

  function toggle () {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem(STORAGE_KEY, mode.value)
  }

  return { mode, toggle }
})
