import { computed } from 'vue'
import { useMainStore } from '@/stores/main'

export function useHasPopularity() {
  const main = useMainStore()
  return computed(() => main.config?.features.hasPopularity !== false)
}
