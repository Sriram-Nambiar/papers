import type { PiniaPluginContext } from 'pinia'
import { createI18n, type ComposerTranslation } from 'vue-i18n'
import languageData from '@wikimedia/language-data'

const LOCALE_STORAGE_KEY = 'papers-ui-locale-choice'

export type Language = {
  code: string
  display: string
  rtl: boolean
}

const localesFiles = import.meta.glob('../../../locales/*.json')
let sourceLocaleNamespace: string | null = null

// Overrides for codes not in @wikimedia/language-data or where the autonym
// differs significantly from what we want to display
const AUTONYM_OVERRIDES: Record<string, string> = {
  arp: 'Arapaho',
  enm: 'Middle English'
}

function getLocaleCodesFromFiles(): string[] {
  return Object.keys(localesFiles)
    .map((path) => {
      const match = path.match(/\/locales\/([^/]+)\.json$/)
      return match ? match[1] : null
    })
    .filter((code): code is string => code !== null && code !== 'qqq')
}

function buildSupportedLanguages(): Language[] {
  return getLocaleCodesFromFiles().map((code) => {
    const override = AUTONYM_OVERRIDES[code]
    const autonym = override || languageData.getAutonym(code)
    return {
      code,
      display: autonym && autonym !== code ? autonym : code,
      rtl: languageData.isRtl(code)
    }
  })
}

export const supportedLanguages: Language[] = buildSupportedLanguages()

// Candidate locale codes for a BCP 47 tag, most specific first:
// e.g. `zh-TW` gives `zh-tw`, `zh-hant`, `zh`
function candidateCodes(tag: string): string[] {
  const candidates = [tag.toLowerCase()]
  try {
    const locale = new Intl.Locale(tag).maximize()
    if (locale.script) {
      candidates.push(`${locale.language}-${locale.script}`.toLowerCase())
    }
    candidates.push(locale.language.toLowerCase())
  } catch {
    candidates.push(tag.split('-')[0]!.toLowerCase())
  }
  return [...new Set(candidates)]
}

export function matchBrowserLanguage(
  browserLanguages: readonly string[],
  languages: Language[]
): Language | undefined {
  for (const tag of browserLanguages) {
    for (const code of candidateCodes(tag)) {
      const language = languages.find((lang) => lang.code === code)
      if (language) return language
    }
  }
  return undefined
}

function getBrowserLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return []
  if (navigator.languages?.length) return navigator.languages
  return navigator.language ? [navigator.language] : []
}

const defaultLanguage: Language =
  matchBrowserLanguage(getBrowserLanguages(), supportedLanguages) ||
  supportedLanguages.find((lang) => lang.code === 'en')!

const i18n = createI18n({
  legacy: false,
  locale: defaultLanguage.code,
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  warnHtmlMessage: true
})

const loadedLocales: string[] = []

type LocaleMessages = Record<string, unknown>

function deepMerge(base: LocaleMessages, override: LocaleMessages): LocaleMessages {
  const merged: LocaleMessages = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key]
    if (
      typeof baseValue === 'object' &&
      baseValue !== null &&
      !Array.isArray(baseValue) &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value)
    ) {
      merged[key] = deepMerge(baseValue as LocaleMessages, value as LocaleMessages)
    } else {
      merged[key] = value
    }
  }

  return merged
}

async function loadLocaleFile(code: string): Promise<LocaleMessages | null> {
  const localeLoader = localesFiles[`../../../locales/${code}.json`]
  if (!localeLoader) return null

  const localeModule = (await localeLoader()) as { default?: LocaleMessages } | LocaleMessages
  return ('default' in localeModule ? localeModule.default : localeModule) as LocaleMessages
}

async function loadLocaleMessages(code: string): Promise<LocaleMessages | null> {
  const localeMessages = await loadLocaleFile(code)
  if (!localeMessages) return null

  const commonMessages = localeMessages.common as LocaleMessages | undefined
  if (!commonMessages) return null
  const sourceMessages = sourceLocaleNamespace
    ? (localeMessages[sourceLocaleNamespace] as LocaleMessages | undefined)
    : undefined
  return sourceMessages ? deepMerge(commonMessages, sourceMessages) : commonMessages
}

export function setLocaleSource(namespace: string): void {
  sourceLocaleNamespace = namespace
}

export async function setCurrentLocale(locale: Language, persist = true): Promise<boolean> {
  if (!loadedLocales.includes(locale.code)) {
    const localeMessages = await loadLocaleMessages(locale.code)
    if (!localeMessages) {
      console.error(`Locale file not found for ${locale.code}`)
      return false
    }
    i18n.global.setLocaleMessage(locale.code, localeMessages)
    loadedLocales.push(locale.code)
  }
  i18n.global.locale.value = locale.code
  document.documentElement.setAttribute('dir', locale.rtl ? 'rtl' : 'ltr')
  document.documentElement.setAttribute('lang', locale.code)
  if (persist) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale.code)
  }
  return true
}

export function getCurrentLocale() {
  return i18n.global.locale.value
}

function getInitialLanguage(): Language {
  const storedLocale =
    typeof localStorage !== 'undefined' ? localStorage.getItem(LOCALE_STORAGE_KEY) : null
  if (storedLocale) {
    const storedLanguage = supportedLanguages.find((lang) => lang.code === storedLocale)
    if (storedLanguage) return storedLanguage
  }
  return defaultLanguage
}

async function loadI18n(sourceNamespace: string) {
  setLocaleSource(sourceNamespace)
  const enLocaleMessages = await loadLocaleMessages('en')
  if (enLocaleMessages) {
    i18n.global.setLocaleMessage('en', enLocaleMessages)
    loadedLocales.push('en')
  }

  const initialLanguage = getInitialLanguage()
  if (initialLanguage.code !== 'en') {
    await setCurrentLocale(initialLanguage, false)
  } else {
    i18n.global.locale.value = 'en'
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.setAttribute('dir', 'ltr')
    }
  }

  return i18n
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    t: ComposerTranslation
  }
}

export function i18nPlugin({ store }: PiniaPluginContext) {
  store.t = i18n.global.t
}

export default loadI18n
