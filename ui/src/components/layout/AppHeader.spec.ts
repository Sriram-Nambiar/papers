/**
 * Unit tests for AppHeader component
 * Tests that the "Collections" nav item is hidden when the ZIM has a single collection
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from './AppHeader.vue'
import { useMainStore } from '@/stores/main'

describe('AppHeader', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }]
    })
    await router.push('/')
    await router.isReady()
  })

  function setConfigHasMultipleCollections(hasMultipleCollections: boolean) {
    useMainStore().config = {
      title: 'Test',
      description: null,
      source: { slug: 'test', name: 'Test', description: 'Test' },
      theme: { formatIcons: {}, routeLabels: {}, collectionIconStyle: 'classification' },
      features: {
        epubReader: true,
        pdfReader: true,
        noscriptFallback: true,
        hasMultipleCollections
      }
    }
  }

  const mountHeader = () => mount(AppHeader, { global: { plugins: [router] } })

  // jsdom has no real viewport/matchMedia, so Vuetify's useDisplay() always
  // reports `mobile: true` here, rendering the drawer nav instead of the
  // desktop nav. Open the drawer to assert on its links in both cases.
  async function openDrawerLinks(wrapper: ReturnType<typeof mountHeader>) {
    await wrapper.find('[aria-label="common.toggleNavigationMenu"]').trigger('click')
    return wrapper.findAll('.nav-drawer__link')
  }

  it('shows the Collections nav item when there are multiple collections', async () => {
    setConfigHasMultipleCollections(true)

    const links = await openDrawerLinks(mountHeader())

    expect(links.some((link) => link.attributes('href') === '/collections')).toBe(true)
  })

  it('hides the Collections nav item when there is a single collection', async () => {
    setConfigHasMultipleCollections(false)

    const links = await openDrawerLinks(mountHeader())

    expect(links.some((link) => link.attributes('href') === '/collections')).toBe(false)
  })

  it('shows the Collections nav item before config has loaded', async () => {
    const links = await openDrawerLinks(mountHeader())

    expect(links.some((link) => link.attributes('href') === '/collections')).toBe(true)
  })
})
