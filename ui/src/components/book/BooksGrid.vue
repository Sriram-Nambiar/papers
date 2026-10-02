<script setup lang="ts">
import type { BookPreview } from '@/types'
import CollectionBookCard from './CollectionBookCard.vue'
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { BOOK_GRID, type BookGridVariant } from '@/constants/theme.ts'

const props = withDefaults(
  defineProps<{
    books: BookPreview[]
    columns: number
    variant?: BookGridVariant
  }>(),
  {
    variant: 'default'
  }
)

const { mobile } = useDisplay()

const sizes = computed(() => BOOK_GRID[props.variant])
const bookWidth = computed(() => (mobile.value ? sizes.value.widthMobile : sizes.value.width))
const coverHeight = computed(() =>
  mobile.value ? sizes.value.coverHeightMobile : sizes.value.coverHeight
)
</script>

<template>
  <div class="books-grid">
    <collection-book-card
      v-for="book in books"
      :key="book.id"
      :book="book"
      :cover-height="coverHeight"
    />
  </div>
</template>

<style scoped>
.books-grid {
  display: grid;
  /* Columns are at least bookWidth wide, and at least 1/columns of the
     available width, so there are never more than `columns` of them */
  grid-template-columns: repeat(
    auto-fill,
    minmax(max(v-bind(bookWidth + 'px'), calc(100% / v-bind(columns))), 1fr)
  );
  margin-bottom: 6rem;
}
</style>
