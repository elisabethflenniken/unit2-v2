<template>
  <v-chip
    :class="`status-chip status-chip--${level}`"
    size="small"
    variant="flat"
  >
    <v-icon aria-hidden="true" :icon="icon" start />
    {{ statusWord }}
    <v-tooltip activator="parent" content-class="status-chip-tooltip" location="top" max-width="280">
      {{ description || genericDescription }}
    </v-tooltip>
  </v-chip>
</template>

<script lang="ts" setup>
  import type { StatusLevel } from '@/data/thresholds'
  import { computed } from 'vue'

  const props = defineProps<{
    level: StatusLevel
    /** Metric-specific explanation, e.g. the exact thresholds behind this reading. */
    description?: string
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

  const genericDescription = computed(() => ({
    good: 'On target: performing within the expected range, no action needed.',
    watch: 'Watch: trending toward a risk threshold — worth keeping an eye on.',
    critical: 'Critical: has crossed the risk threshold and needs attention now.',
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
