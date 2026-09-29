<script setup lang="ts">
import { computed } from 'vue'
import type { BookPreview } from '@/types'
import BooksGrid from '@/components/book/BooksGrid.vue'
import { useHasPopularity } from '@/composables/useHasPopularity'

const props = defineProps<{
  books: BookPreview[]
}>()

const hasPopularity = useHasPopularity()

const topBooks = computed(() =>
  [...props.books]
    .sort((a, b) =>
      hasPopularity.value ? b.popularity - a.popularity : a.title.localeCompare(b.title)
    )
    .slice(0, 12)
)
</script>

<template>
  <div class="popular-collection-books">
    <books-grid :books="topBooks" :columns="6" centered />
  </div>
</template>

<style scoped>
.popular-collection-books {
  padding: 0.75rem 0 1.5rem;
}
</style>
