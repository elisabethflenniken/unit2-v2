// widgets/registry.ts
//
// The catalog of every available graphic. WidgetLibraryPanel diffs this against the dashboard
// store's active widget list; DashboardGrid renders whatever's active by looking components up
// here. Adding a new graphic later means one component + one entry here — nothing else changes.
import type { Component } from 'vue'
import ExceptionsTable from './ExceptionsTable.vue'
import KpiCard from './KpiCard.vue'
import OnTimeRateChart from './OnTimeRateChart.vue'
import RegionalPerformanceChart from './RegionalPerformanceChart.vue'
import VolumeTrendChart from './VolumeTrendChart.vue'

export type WidgetSize = 'small' | 'medium' | 'large'

export interface WidgetDefinition {
  id: string
  title: string
  description: string
  component: Component
  props?: Record<string, unknown>
  size: WidgetSize
  category: 'kpi' | 'chart' | 'table'
}

export const widgetRegistry: WidgetDefinition[] = [
  {
    id: 'kpi-volume',
    title: 'Shipment Volume',
    description: 'Today\'s shipment volume vs. the trailing 7-day average.',
    component: KpiCard,
    props: { title: 'Shipment Volume', metric: 'volume' },
    size: 'small',
    category: 'kpi',
  },
  {
    id: 'kpi-on-time',
    title: 'On-Time Delivery Rate',
    description: 'Company-wide on-time delivery rate.',
    component: KpiCard,
    props: { title: 'On-Time Delivery Rate', metric: 'onTime' },
    size: 'small',
    category: 'kpi',
  },
  {
    id: 'kpi-regions',
    title: 'Regional Performance',
    description: 'How many regions are currently on target.',
    component: KpiCard,
    props: { title: 'Regional Performance', metric: 'regions' },
    size: 'small',
    category: 'kpi',
  },
  {
    id: 'kpi-exceptions',
    title: 'Open Exceptions',
    description: 'Company-wide open exception count.',
    component: KpiCard,
    props: { title: 'Open Exceptions', metric: 'exceptions' },
    size: 'small',
    category: 'kpi',
  },
  {
    id: 'chart-volume-trend',
    title: 'Volume Trend',
    description: 'Daily shipment volume over the trailing 90 days.',
    component: VolumeTrendChart,
    props: { title: 'Volume Trend' },
    size: 'large',
    category: 'chart',
  },
  {
    id: 'chart-on-time-rate',
    title: 'On-Time Delivery Trend',
    description: 'Daily on-time delivery rate over the trailing 90 days, vs. the 95% target.',
    component: OnTimeRateChart,
    props: { title: 'On-Time Delivery Trend' },
    size: 'large',
    category: 'chart',
  },
  {
    id: 'chart-regional-performance',
    title: 'Regional Performance',
    description: 'On-time delivery rate by region.',
    component: RegionalPerformanceChart,
    props: { title: 'Regional Performance' },
    size: 'medium',
    category: 'chart',
  },
  {
    id: 'table-exceptions',
    title: 'Exceptions',
    description: 'Open exception events, most severe first.',
    component: ExceptionsTable,
    props: { title: 'Exceptions' },
    size: 'large',
    category: 'table',
  },
]

export function getWidgetDefinition (id: string): WidgetDefinition | undefined {
  return widgetRegistry.find(w => w.id === id)
}
