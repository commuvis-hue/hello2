import { NavLink } from 'react-router-dom'
import { Home, Search, Plus, PlaySquare, User } from 'lucide-react'
import { t } from '../i18n/index.jsx'

const cls = ({ isActive }) => 'bottom-nav__item' + (isActive ? ' is-active' : '')

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label={t('하단 메뉴')}>
      <NavLink to="/" end className={cls}><Home size={24} /><span>{t('홈')}</span></NavLink>
      <NavLink to="/watch" className={cls}><Search size={24} /><span>{t('탐색')}</span></NavLink>
      <NavLink to="/upload" className="bottom-nav__fab" aria-label={t('영상 올리기')}><Plus size={32} strokeWidth={2.5} /></NavLink>
      <NavLink to="/library" className={cls}><PlaySquare size={24} /><span>{t('내 라이브러리')}</span></NavLink>
      <NavLink to="/my" className={cls}><User size={24} /><span>{t('마이페이지')}</span></NavLink>
    </nav>
  )
}
