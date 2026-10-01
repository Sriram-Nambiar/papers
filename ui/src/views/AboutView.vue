<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { TYPOGRAPHY } from '@/constants/theme'

const { t, te } = useI18n()

function paragraphKeys(prefix: string): string[] {
  const keys: string[] = []
  for (let index = 1; ; index += 1) {
    const key = `${prefix}Paragraph${index}`
    if (!te(key)) {
      break
    }
    keys.push(key)
  }
  return keys
}

const introParagraphs = computed(() => paragraphKeys('about.intro'))
const missionParagraphs = computed(() => paragraphKeys('about.mission'))
</script>

<template>
  <div class="about-page">
    <article class="content-card">
      <h1 class="section-title">{{ t('about.introHeading') }}</h1>

      <p v-for="key in introParagraphs" :key="key">{{ t(key) }}</p>

      <template v-if="te('about.missionHeading')">
        <h2 class="section-title mission-title">{{ t('about.missionHeading') }}</h2>
        <p v-if="te('about.missionAuthor')" class="mission-by">
          {{ t('about.missionAuthor') }}
        </p>

        <p v-for="key in missionParagraphs" :key="key">{{ t(key) }}</p>
      </template>

      <footer class="attribution">
        <p>{{ t('about.attribution') }}</p>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.about-page {
  position: relative;
  min-height: 100vh;
  padding: 2.5rem 2rem;
}

.about-page::before {
  content: '';
  position: sticky;
  top: 0;
  display: block;
  height: 100dvh;
  margin: -2.5rem -2rem;
  background-image: url('/about-bg.jpg');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.content-card {
  position: relative;
  z-index: 1;
  background: rgb(var(--v-theme-background));
  max-width: 801px;
  width: 100%;
  margin: calc(-100dvh + 2.5rem) auto 0;
  padding: 3rem 4rem;
}

/* Keep the text column at its original width (760px card minus 4rem
   padding each side) while the card itself spans wider */
.content-card > * {
  max-width: 632px;
  margin-inline: auto;
}

.section-title {
  font-family: v-bind(TYPOGRAPHY.FONT_FAMILY);
  font-size: v-bind(TYPOGRAPHY.H1_SIZE);
  font-weight: v-bind(TYPOGRAPHY.H1_WEIGHT);
  color: rgb(var(--v-theme-text));
  margin-bottom: 1rem;
}

.mission-title {
  margin-top: 2.5rem;
  margin-bottom: 0.5rem;
}

.mission-by {
  font-family: v-bind(TYPOGRAPHY.FONT_FAMILY);
  font-size: v-bind(TYPOGRAPHY.BODY_SIZE);
  font-weight: v-bind(TYPOGRAPHY.BODY_WEIGHT);
  opacity: 0.85;
  margin-bottom: 1rem;
}

p {
  font-family: v-bind(TYPOGRAPHY.FONT_FAMILY);
  font-size: v-bind(TYPOGRAPHY.BODY_SIZE);
  font-weight: v-bind(TYPOGRAPHY.BODY_WEIGHT);
  line-height: 1.6;
  color: rgb(var(--v-theme-text));
  opacity: 0.9;
  margin-bottom: 1rem;
}

.attribution {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid rgb(var(--v-theme-grid));
}

.attribution p {
  font-size: v-bind(TYPOGRAPHY.CAPTION_SIZE);
  font-weight: v-bind(TYPOGRAPHY.CAPTION_WEIGHT);
  opacity: 0.7;
  margin-bottom: 0;
}

@media (max-width: 767px) {
  .about-page {
    padding: 3rem 1rem;
  }

  .about-page::before {
    margin: -3rem -1rem;
  }

  .content-card {
    padding: 2rem 1.5rem;
    max-width: 80%;
  }

  .section-title {
    font-size: v-bind(TYPOGRAPHY.H1_SIZE_MOBILE);
  }

  .mission-by {
    font-size: v-bind(TYPOGRAPHY.BODY_SIZE_MOBILE);
  }

  p {
    font-size: v-bind(TYPOGRAPHY.BODY_SIZE_MOBILE);
  }

  .attribution p {
    font-size: v-bind(TYPOGRAPHY.CAPTION_SIZE_MOBILE);
  }
}
</style>
