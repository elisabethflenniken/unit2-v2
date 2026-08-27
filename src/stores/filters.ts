// stores/filters.ts
//
// Global date range + region filters that every widget respects (BRIEF.md). Not persisted —
// a filtered view is a live-in-the-room state, not something that should silently carry over
// to the next meeting.
import { defineStore } from 'pinia'
import { ref } from 'vue'

export type DateRangeDays = 7 | 30 | 90

export const useFiltersStore = defineStore('filters', () => {
  const dateRangeDays = ref<DateRangeDays>(90)
  const regionId = ref<string>('all')

  function setDateRange (days: DateRangeDays) {
    dateRangeDays.value = days
  }

  function setRegion (id: string) {
    regionId.value = id
  }

  return { dateRangeDays, regionId, setDateRange, setRegion }
})
