<template>
  <v-card class="drawer-card mb-3 pa-3" variant="flat">
    <div class="text-subtitle-2 font-weight-bold mb-1">
      {{ title }}
    </div>

    <p class="text-body-2 text-on-surface-variant mb-3">
      {{ description }}
    </p>

    <slot />
  </v-card>
</template>

<script lang="ts" setup>
  defineProps<{
    title: string
    description: string
  }>()
</script>

<style scoped>
/* Matches WidgetCard's chrome so drawer cards read as the same product as the dashboard widgets. */
.drawer-card {
  border-radius: 16px;
}

.drawer-card.v-theme--light {
  box-shadow: 0 20px 45px -18px rgba(21, 101, 192, 0.22), 0 10px 25px -12px rgba(15, 23, 42, 0.12);
}

.drawer-card.v-theme--dark {
  box-shadow: 0 20px 45px -18px rgba(0, 0, 0, 0.6), 0 10px 25px -12px rgba(0, 0, 0, 0.4);
}
</style>
