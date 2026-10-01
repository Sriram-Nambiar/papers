import { computed } from 'vue'
import { useMainStore } from '@/stores/main'

export function useHasMultipleCollections() {
  const main = useMainStore()
  return computed(() => main.config?.features.hasMultipleCollections !== false)
}
