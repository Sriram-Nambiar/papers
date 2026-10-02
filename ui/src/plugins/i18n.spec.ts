/**
 * Unit tests for browser language detection and pluralization
 */

import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import { matchBrowserLanguage, translatePlural, type Language } from './i18n'

const languages: Language[] = ['en', 'fr', 'pt', 'pt-br', 'zh', 'zh-hans', 'zh-hant'].map(
  (code) => ({ code, display: code, rtl: false })
)

function match(browserLanguages: string[]) {
  return matchBrowserLanguage(browserLanguages, languages)?.code
}

describe('matchBrowserLanguage', () => {
  it('matches base language from a regional tag', () => {
    expect(match(['fr-FR'])).toBe('fr')
  })

  it('prefers an exact regional match', () => {
    expect(match(['pt-BR'])).toBe('pt-br')
    expect(match(['pt-PT'])).toBe('pt')
  })

  it('matches script variants', () => {
    expect(match(['zh-TW'])).toBe('zh-hant')
    expect(match(['zh-CN'])).toBe('zh-hans')
    expect(match(['zh'])).toBe('zh')
  })

  it('uses the first supported language in preference order', () => {
    expect(match(['xx-YY', 'fr-CA', 'en-US'])).toBe('fr')
  })

  it('returns undefined when nothing matches', () => {
    expect(match(['xx'])).toBeUndefined()
    expect(match([])).toBeUndefined()
  })
})

describe('translatePlural', () => {
  const messages: Record<string, Record<string, Record<string, string>>> = {
    en: {
      books: { one: '{count} book', other: '{count} books' },
      withZero: { zero: 'No book', one: 'One book', other: '{n} books' },
      onlyOther: { other: 'Books' }
    },
    pl: {
      books: { one: '{count} książka', few: '{count} książki', other: '{count} książek' }
    },
    de: {
      withZero: { one: 'Ein Buch', other: '{n} Bücher' }
    }
  }

  function makeI18n(locale: string) {
    return createI18n({
      legacy: false,
      locale,
      fallbackLocale: 'en',
      missingWarn: false,
      fallbackWarn: false,
      messages
    }).global
  }

  it('picks the CLDR plural category of the current locale', () => {
    const i18n = makeI18n('pl')
    expect(translatePlural(i18n, 'books', 1)).toBe('1 książka')
    expect(translatePlural(i18n, 'books', 3)).toBe('3 książki')
    // CLDR says "many" for 5 in Polish, which is missing here
    expect(translatePlural(i18n, 'books', 5)).toBe('5 książek')
  })

  it('uses the other form for an unbounded amount', () => {
    expect(translatePlural(makeI18n('en'), 'onlyOther', null)).toBe('Books')
  })

  it('uses the zero form for 0 when present', () => {
    const i18n = makeI18n('en')
    expect(translatePlural(i18n, 'withZero', 0)).toBe('No book')
    expect(translatePlural(i18n, 'books', 0)).toBe('0 books')
  })

  it('falls back to the other form, never to another language', () => {
    // German has no zero form, the English one must not be used
    expect(translatePlural(makeI18n('de'), 'withZero', 0)).toBe('0 Bücher')
  })

  it('falls back to English when the message is missing in the locale', () => {
    expect(translatePlural(makeI18n('fr'), 'books', 1)).toBe('1 book')
    expect(translatePlural(makeI18n('fr'), 'books', 2)).toBe('2 books')
  })

  it('returns the key when the message is missing everywhere', () => {
    expect(translatePlural(makeI18n('en'), 'missing', 1)).toBe('missing')
  })
})
