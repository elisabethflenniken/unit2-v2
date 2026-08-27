<template>
  <v-app>
    <v-app-bar color="surface" elevation="1">
      <v-app-bar-title class="font-weight-bold text-primary">
        FastForward Logistics
      </v-app-bar-title>

      <v-spacer />

      <v-btn
        class="mr-2"
        prepend-icon="mdi-view-dashboard-edit-outline"
        variant="tonal"
        @click="isLibraryOpen = true"
      >
        Add a graphic
      </v-btn>

      <v-btn
        :aria-label="themeStore.mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        :icon="themeStore.mode === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
        variant="text"
        @click="themeStore.toggle()"
      />
    </v-app-bar>

    <WidgetLibraryPanel v-model="isLibraryOpen" />
    <FullscreenWidgetDialog />

    <v-main>
      <DashboardView />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue'
  import { useTheme } from 'vuetify'
  import FullscreenWidgetDialog from '@/components/dashboard/FullscreenWidgetDialog.vue'
  import WidgetLibraryPanel from '@/components/dashboard/WidgetLibraryPanel.vue'
  import { useThemeStore } from '@/stores/theme'
  import DashboardView from '@/views/DashboardView.vue'

  const themeStore = useThemeStore()
  const vuetifyTheme = useTheme()

  vuetifyTheme.global.name.value = themeStore.mode
  watch(() => themeStore.mode, mode => {
    vuetifyTheme.global.name.value = mode
  })

  const isLibraryOpen = ref(false)
</script>
