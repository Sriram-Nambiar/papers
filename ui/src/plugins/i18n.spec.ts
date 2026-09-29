/**
 * Unit tests for browser language detection
 */

import { describe, it, expect } from 'vitest'
import { matchBrowserLanguage, type Language } from './i18n'

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
