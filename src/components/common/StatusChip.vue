<template>
  <v-chip
    :class="`status-chip status-chip--${level}`"
    size="small"
    variant="flat"
  >
    <v-icon aria-hidden="true" :icon="icon" start />
    {{ statusWord }}
  </v-chip>
</template>

<script lang="ts" setup>
  import type { StatusLevel } from '@/data/thresholds'
  import { computed } from 'vue'

  const props = defineProps<{
    level: StatusLevel
  }>()

  const statusWord = computed(() => ({
    good: 'On target',
    watch: 'Watch',
    critical: 'Critical',
  }[props.level]))

  const icon = computed(() => ({
    good: 'mdi-check-circle',
    watch: 'mdi-alert',
    critical: 'mdi-close-circle',
  }[props.level]))
</script>

<style scoped>
.status-chip--good {
  background-color: rgb(var(--v-theme-status-good));
  color: rgb(var(--v-theme-on-status-good));
}

.status-chip--watch {
  background-color: rgb(var(--v-theme-status-watch));
  color: rgb(var(--v-theme-status-watch-text));
}

.status-chip--critical {
  background-color: rgb(var(--v-theme-status-critical));
  color: rgb(var(--v-theme-on-status-critical));
}
</style>
