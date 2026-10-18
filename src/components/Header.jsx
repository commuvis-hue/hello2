import { NavLink, Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import Logo from './Logo.jsx'
import LangSwitcher from './LangSwitcher.jsx'
import { useAuth } from '../lib/auth.jsx'
import { t } from '../i18n/index.jsx'

const TABS = [
  { to: '/watch', label: 'WATCH' },
  { to: '/create', label: 'CREATE' },
  { to: '/fund', label: 'FUND' },
  { to: '/trade', label: 'TRADE' },
]

export default function Header() {
  const { user, profile } = useAuth()
  const initial = (profile?.nickname || user?.email || '?')[0].toUpperCase()
  return (
    <header className="header">
      <div className="header__bar">
        <Logo to="/" />
        <div className="header__actions">
          <LangSwitcher />
          <button className="icon-btn" aria-label={t('검색')}><Search size={24} /></button>
          <button className="icon-btn icon-btn--dot" aria-label={t('알림 (새 알림 있음)')}><Bell size={24} /></button>
          {user ? (
            <NavLink to="/my" className="avatar avatar--initial" aria-label={t('마이페이지')}>{initial}</NavLink>
          ) : (
            <Link to="/login" className="login-pill">{t('로그인')}</Link>
          )}
        </div>
      </div>
      <nav className="top-tabs" aria-label={t('주요 메뉴')}>
        {TABS.map((tab) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => 'top-tabs__item' + (isActive ? ' is-active' : '')}>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
