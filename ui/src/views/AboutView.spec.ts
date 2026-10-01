/**
 * Component tests for AboutView
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import en from '../../../locales/en.json'
import AboutView from './AboutView.vue'

const { messages } = vi.hoisted(() => ({ messages: { current: {} as Record<string, string> } }))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => messages.current[key] ?? key,
    te: (key: string) => key in messages.current
  })
}))

type Json = { [key: string]: string | Json }

function flatten(source: Json, prefix = '', into: Record<string, string> = {}) {
  for (const [key, value] of Object.entries(source)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      into[fullKey] = value
    } else {
      flatten(value, fullKey, into)
    }
  }
  return into
}

function merged(source: keyof typeof en): Record<string, string> {
  const data = en as unknown as Record<string, Json>
  return { ...flatten(data.common!), ...flatten(data[source] as Json) }
}

function setSource(source: keyof typeof en) {
  messages.current = merged(source)
}

describe('AboutView', () => {
  beforeEach(() => {
    setSource('wikisource')
  })

  describe('Introduction', () => {
    it('renders the source heading and introduction paragraphs', () => {
      const wrapper = mount(AboutView)

      expect(wrapper.find('h1').text()).toBe('About Wikisource')
      expect(wrapper.text()).toContain(
        'Wikisource is a free online library of source texts that anyone can improve.'
      )
      expect(wrapper.text()).toContain(
        'This library makes those texts available for offline reading.'
      )
    })

    it('always renders the attribution footer', () => {
      const wrapper = mount(AboutView)

      expect(wrapper.find('footer.attribution').text()).toBe(
        'Text provided by Wikisource, the free library.'
      )
    })
  })

  describe('Mission section', () => {
    it('renders the mission heading and author for Wikisource', () => {
      const wrapper = mount(AboutView)

      expect(wrapper.find('h2.mission-title').exists()).toBe(true)
      expect(wrapper.find('h2.mission-title').text()).toBe('Our mission')
      expect(wrapper.find('.mission-by').text()).toBe('The Wikisource community')
    })

    it('renders every mission paragraph the source defines', () => {
      const wrapper = mount(AboutView)

      const text = wrapper.text()
      for (const [key, value] of Object.entries(messages.current)) {
        if (key.startsWith('about.missionParagraph')) {
          expect(text).toContain(value)
        }
      }
    })

    it('does not render paragraphs the source leaves undefined', () => {
      const wrapper = mount(AboutView)

      const defined = Object.keys(messages.current).filter((key) =>
        key.startsWith('about.missionParagraph')
      )
      expect(defined).toHaveLength(4)

      expect(wrapper.text()).not.toContain('about.missionParagraph5')
      expect(wrapper.text()).not.toContain('about.missionParagraph17')
    })

    it('never leaks a raw translation key', () => {
      const wrapper = mount(AboutView)

      expect(wrapper.text()).not.toMatch(/about\.\w+/)
    })

    it('renders all 17 paragraphs for a source that defines them', () => {
      setSource('gutenberg')
      const wrapper = mount(AboutView)

      const paragraphs = wrapper
        .findAll('article > p')
        .filter((p) => !p.classes().includes('mission-by'))
      expect(paragraphs).toHaveLength(4 + 17)
      expect(wrapper.find('h2.mission-title').text()).toBe('Mission Statement')
    })

    it('hides the whole section when a source has no mission', () => {
      const stripped = Object.fromEntries(
        Object.entries(merged('wikisource')).filter(([key]) => !key.startsWith('about.mission'))
      )
      messages.current = stripped

      const wrapper = mount(AboutView)

      expect(wrapper.find('h2.mission-title').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Our mission')
      expect(wrapper.text()).not.toMatch(/about\.\w+/)
      expect(wrapper.text()).toContain('About Wikisource')
    })

    it('hides the author line when only the heading is defined', () => {
      const partial = Object.fromEntries(
        Object.entries(merged('wikisource')).filter(
          ([key]) => key === 'about.missionHeading' || !key.startsWith('about.mission')
        )
      )
      messages.current = partial

      const wrapper = mount(AboutView)

      expect(wrapper.find('h2.mission-title').exists()).toBe(true)
      expect(wrapper.find('.mission-by').exists()).toBe(false)
    })
  })

  describe('Variable paragraph count', () => {
    function withParagraphs(section: string, count: number) {
      const numbered = new RegExp(`^about\\.${section}Paragraph\\d+$`)
      const base = Object.fromEntries(
        Object.entries(merged('wikisource')).filter(([key]) => !numbered.test(key))
      )
      return {
        ...base,
        ...Object.fromEntries(
          Array.from({ length: count }, (_, index) => [
            `about.${section}Paragraph${index + 1}`,
            `${section} paragraph ${index + 1}`
          ])
        )
      }
    }

    function missionParagraphs(wrapper: ReturnType<typeof mount>) {
      return wrapper
        .findAll('article > p')
        .filter((p) => !p.classes().includes('mission-by'))
        .map((p) => p.text())
    }

    it.each([1, 2, 3, 7, 17, 23])('renders exactly %i mission paragraphs', (count) => {
      messages.current = withParagraphs('mission', count)

      const wrapper = mount(AboutView)

      expect(wrapper.find('h2.mission-title').exists()).toBe(true)
      for (let index = 1; index <= count; index += 1) {
        expect(wrapper.text()).toContain(`mission paragraph ${index}`)
      }
    })

    it('renders an arbitrary number of introduction paragraphs', () => {
      messages.current = withParagraphs('intro', 2)

      const wrapper = mount(AboutView)

      expect(wrapper.text()).toContain('intro paragraph 1')
      expect(wrapper.text()).toContain('intro paragraph 2')
      expect(wrapper.text()).not.toContain('intro paragraph 3')
    })

    it('stops at the first missing mission paragraph', () => {
      messages.current = {
        ...withParagraphs('mission', 2),
        'about.missionParagraph4': 'should never be reached'
      }

      const wrapper = mount(AboutView)

      expect(wrapper.text()).toContain('mission paragraph 2')
      expect(wrapper.text()).not.toContain('should never be reached')
      expect(missionParagraphs(wrapper)).toHaveLength(4 + 2)
    })

    it('stops at the first missing introduction paragraph', () => {
      messages.current = {
        ...withParagraphs('intro', 1),
        'about.introParagraph3': 'should never be reached'
      }

      const wrapper = mount(AboutView)

      expect(wrapper.text()).toContain('intro paragraph 1')
      expect(wrapper.text()).not.toContain('should never be reached')
    })

    it('omits the section when the first paragraph is missing', () => {
      messages.current = {
        ...merged('wikisource'),
        'about.missionHeading': 'Our mission'
      }
      delete messages.current['about.missionParagraph1']

      const wrapper = mount(AboutView)

      expect(wrapper.find('h2.mission-title').exists()).toBe(true)
      expect(wrapper.text()).not.toMatch(/about\.\w+/)
      expect(missionParagraphs(wrapper)).toHaveLength(4)
    })
  })
})
