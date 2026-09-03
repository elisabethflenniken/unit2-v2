<template>
  <div aria-hidden="true" class="sparkline">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts" setup>
  import type { ChartData, ChartOptions } from 'chart.js'
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { useTheme } from 'vuetify'
  import { themeColor } from '@/utils/chartTheme'

  const props = defineProps<{
    values: number[]
  }>()

  const theme = useTheme()

  const chartData = computed<ChartData<'line'>>(() => ({
    labels: props.values.map((_, index) => index),
    datasets: [
      {
        data: props.values,
        borderColor: themeColor(theme, 'primary'),
        backgroundColor: `${themeColor(theme, 'primary')}26`,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }))

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  }
</script>

<style scoped>
.sparkline {
  height: 40px;
  width: 100%;
}
</style>
