import { createContext, useContext, useEffect, useState } from 'react'
import en from './en.js'
import zh from './zh.js'

// 지원 언어. 기본값은 한국어.
export const LANGS = [
  { id: 'ko', label: '한국어', short: 'KO', locale: 'ko-KR', html: 'ko' },
  { id: 'en', label: 'English', short: 'EN', locale: 'en-US', html: 'en' },
  { id: 'zh', label: '简体中文', short: '中文', locale: 'zh-CN', html: 'zh-CN' },
]
const DICTS = { en, zh }
const STORAGE_KEY = 'hellooooo.lang'

// 한국어 문장이 곧 번역 키입니다. en.js / zh.js 에 같은 문장을 키로 번역을 넣으면 됩니다.
// 번역이 없으면 한국어 원문이 그대로 나옵니다.
let current = 'ko'
const missing = new Set()

export function t(text, vars) {
  if (text == null) return ''
  let s = text
  if (current !== 'ko') {
    const hit = DICTS[current]?.[text]
    if (hit != null) s = hit
    else if (import.meta.env?.DEV && !missing.has(current + text)) {
      missing.add(current + text)
      console.warn(`[i18n] ${current} 번역 없음:`, text)
    }
  }
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
  return s
}

export const getLang = () => current
export const locale = () => LANGS.find((l) => l.id === current)?.locale ?? 'ko-KR'

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.some((l) => l.id === saved)) return saved
  } catch { /* 저장소 사용 불가 */ }
  return 'ko'
}

const LangContext = createContext({ lang: 'ko', setLang: () => {} })

export function LangProvider({ children }) {
  const [lang, setLang] = useState(initialLang)
  current = lang // 렌더링 중 t()가 현재 언어를 쓰도록

  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.id === lang)?.html ?? 'ko'
    document.title = t('HELLOOOO · Shorts to the World')
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* 무시 */ }
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

// 앱 최상단(App)에서 호출하면 언어가 바뀔 때 화면 전체가 다시 그려집니다.
export const useLang = () => useContext(LangContext)
