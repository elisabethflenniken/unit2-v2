// composables/useWidgetData.ts
//
// Every widget needs loading/empty/error states, not just the happy path (DESIGN.md). This
// centralizes that pattern instead of duplicating it in each widget component. Pass `watchSource`
// (e.g. the filters store's region/date range) to recompute — with a fresh loading flash — when
// a global filter changes, since widgets stay mounted rather than remounting per filter change.
import { onMounted, ref, shallowRef, watch } from 'vue'

export type WidgetLoadState = 'loading' | 'ready' | 'empty' | 'error'

export function useWidgetData<T> (
  compute: () => T,
  isEmpty: (value: T) => boolean = () => false,
  options: { delayMs?: number, watchSource?: () => unknown } = {},
) {
  const { delayMs = 350, watchSource } = options
  const state = ref<WidgetLoadState>('loading')
  const data = shallowRef<T | null>(null)
  const errorMessage = ref('')

  function run () {
    state.value = 'loading'
    globalThis.setTimeout(() => {
      try {
        const result = compute()
        data.value = result
        state.value = isEmpty(result) ? 'empty' : 'ready'
      } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Something went wrong loading this widget.'
        state.value = 'error'
      }
    }, delayMs)
  }

  onMounted(run)

  if (watchSource) {
    watch(watchSource, run)
  }

  return { state, data, errorMessage, refresh: run }
}
