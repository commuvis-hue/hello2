import { useEffect, useRef, useState } from 'react'
import { Globe, Check } from 'lucide-react'
import { LANGS, useLang, t } from '../i18n/index.jsx'

// 상단 언어 선택: 🌐 KO ▾ → 한국어 / English / 简体中文
export default function LangSwitcher({ className = '' }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const esc = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div className={'lang ' + className} ref={ref}>
      <button
        type="button"
        className="lang__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('언어 선택')}
        onClick={() => setOpen((o) => !o)}
      >
        <Globe size={18} />
        <span>{current.short}</span>
      </button>
      {open && (
        <ul className="lang__menu" role="listbox" aria-label={t('언어 선택')}>
          {LANGS.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                role="option"
                aria-selected={l.id === lang}
                lang={l.html}
                onClick={() => { setLang(l.id); setOpen(false) }}
              >
                <span>{l.label}</span>
                {l.id === lang && <Check size={16} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
